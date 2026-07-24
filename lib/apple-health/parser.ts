/**
 * Apple Health Export XML Parser
 *
 * Parses Apple Health export.xml to extract running workouts
 * with GPS routes, heart rate, pace, distance, duration, etc.
 */

export interface HealthWorkout {
  type: string;
  startDate: Date;
  endDate: Date;
  duration: number; // minutes
  distance: number; // km
  calories: number;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  cadence: number | null;
  elevation: number | null;
  indoor: boolean;
  route: GpsPoint[];
}

export interface GpsPoint {
  lat: number;
  lng: number;
  elevation?: number;
  timestamp?: Date;
}

export interface HeartRateSample {
  date: Date;
  value: number;
}

export interface ParseResult {
  workouts: HealthWorkout[];
  totalParsed: number;
  errors: string[];
}

// Apple Health workout type identifiers
const RUNNING_TYPES = [
  "HKWorkoutActivityTypeRunning",
  "HKWorkoutActivityTypeWalking",
  "HKWorkoutActivityTypeHiking",
];

/**
 * Parse Apple Health export.xml text content
 */
export function parseAppleHealthXml(xmlText: string): ParseResult {
  const errors: string[] = [];
  const workouts: HealthWorkout[] = [];

  try {
    // Extract Workout records
    const workoutMatches = xmlText.matchAll(
      /<Workout\s([^>]*?)(?:\/>|>([\s\S]*?)<\/Workout>)/g
    );

    for (const match of workoutMatches) {
      const attrs = match[1];
      const innerContent = match[2] || "";

      const type = extractAttr(attrs, "workoutActivityType");
      if (!type || !RUNNING_TYPES.includes(type)) continue;

      try {
        const workout = parseWorkoutElement(attrs, innerContent, xmlText);
        workouts.push(workout);
      } catch (e) {
        errors.push(`Failed to parse workout: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  } catch (e) {
    errors.push(`XML parsing failed: ${e instanceof Error ? e.message : String(e)}`);
  }

  return {
    workouts: workouts.sort((a, b) => b.startDate.getTime() - a.startDate.getTime()),
    totalParsed: workouts.length,
    errors,
  };
}

function parseWorkoutElement(
  attrs: string,
  innerContent: string,
  _fullXml: string
): HealthWorkout {
  const startDate = new Date(extractAttr(attrs, "startDate") || "");
  const endDate = new Date(extractAttr(attrs, "endDate") || "");
  const duration = parseFloat(extractAttr(attrs, "duration") || "0");

  // Extract distance from WorkoutStatistics or attributes
  let distance = 0;
  const distanceMatch = innerContent.match(
    /<WorkoutStatistics[^>]*type="HKQuantityTypeIdentifierDistanceWalkingRunning"[^>]*sum="([^"]*)"[^>]*\/?>/
  );
  if (distanceMatch) {
    distance = parseFloat(distanceMatch[1]);
  }

  // Extract calories
  let calories = 0;
  const caloriesMatch = innerContent.match(
    /<WorkoutStatistics[^>]*type="HKQuantityTypeIdentifierActiveEnergyBurned"[^>]*sum="([^"]*)"[^>]*\/?>/
  );
  if (caloriesMatch) {
    calories = Math.round(parseFloat(caloriesMatch[1]));
  }

  // Extract heart rate from WorkoutStatistics
  let avgHeartRate: number | null = null;
  let maxHeartRate: number | null = null;
  const hrMatch = innerContent.match(
    /<WorkoutStatistics[^>]*type="HKQuantityTypeIdentifierHeartRate"([^>]*)\/?>/
  );
  if (hrMatch) {
    const hrAttrs = hrMatch[1];
    const avg = extractAttr(hrAttrs, "average");
    const max = extractAttr(hrAttrs, "maximum");
    if (avg) avgHeartRate = Math.round(parseFloat(avg));
    if (max) maxHeartRate = Math.round(parseFloat(max));
  }

  // Extract elevation
  let elevation: number | null = null;
  const elevMatch = innerContent.match(
    /<WorkoutStatistics[^>]*type="HKQuantityTypeIdentifierFlightsClimbed"[^>]*sum="([^"]*)"[^>]*\/?>/
  );
  if (elevMatch) {
    elevation = parseFloat(elevMatch[1]);
  }

  // Extract cadence
  let cadence: number | null = null;
  const cadenceMatch = innerContent.match(
    /<WorkoutStatistics[^>]*type="HKQuantityTypeIdentifierStepCount"[^>]*sum="([^"]*)"[^>]*\/?>/
  );
  if (cadenceMatch && duration > 0) {
    cadence = Math.round(parseFloat(cadenceMatch[1]) / duration);
  }

  // Extract route data from WorkoutRoute
  const route = parseRouteFromWorkout(innerContent);

  // Determine if indoor
  const indoor =
    extractAttr(attrs, "workoutActivityType")?.includes("Indoor") ||
    innerContent.includes("HKIndoorWorkout") && innerContent.includes('"1"');

  return {
    type: extractAttr(attrs, "workoutActivityType") || "HKWorkoutActivityTypeRunning",
    startDate,
    endDate,
    duration,
    distance,
    calories,
    avgHeartRate,
    maxHeartRate,
    cadence,
    elevation,
    indoor: !!indoor,
    route,
  };
}

function parseRouteFromWorkout(innerContent: string): GpsPoint[] {
  const points: GpsPoint[] = [];

  // Match Location elements within WorkoutRoute
  const locationMatches = innerContent.matchAll(
    /<Location[^>]*latitude="([^"]*)"[^>]*longitude="([^"]*)"[^>]*(?:altitude="([^"]*)")?[^>]*(?:timestamp="([^"]*)")?[^>]*\/?>/g
  );

  for (const loc of locationMatches) {
    points.push({
      lat: parseFloat(loc[1]),
      lng: parseFloat(loc[2]),
      elevation: loc[3] ? parseFloat(loc[3]) : undefined,
      timestamp: loc[4] ? new Date(loc[4]) : undefined,
    });
  }

  return points;
}

function extractAttr(attrString: string, name: string): string | null {
  const match = attrString.match(new RegExp(`${name}="([^"]*)"`));
  return match ? match[1] : null;
}

/**
 * Convert parsed workout to the format needed for our Run model
 */
export function workoutToRunData(workout: HealthWorkout, userId: string) {
  const pace = workout.distance > 0
    ? workout.duration / workout.distance
    : 0;

  const routeData = workout.route.length > 0
    ? {
        type: "LineString" as const,
        coordinates: workout.route.map((p) => [p.lng, p.lat, p.elevation || 0]),
      }
    : null;

  return {
    userId,
    date: workout.startDate,
    distance: workout.distance,
    duration: workout.duration,
    pace: Math.round(pace * 100) / 100,
    avgHeartRate: workout.avgHeartRate,
    maxHeartRate: workout.maxHeartRate,
    cadence: workout.cadence,
    elevation: workout.elevation,
    calories: workout.calories,
    indoor: workout.indoor,
    routeData,
    notes: `Imported from Apple Health`,
    trainingLoad: getTrainingLoad(pace, workout.duration),
  };
}

function getTrainingLoad(pace: number, duration: number): string {
  if (pace < 4.5 || duration > 90) return "intense";
  if (pace < 5.5 || duration > 60) return "hard";
  if (pace < 6.5 || duration > 40) return "moderate";
  return "easy";
}
