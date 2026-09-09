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
  /** basename of the referenced GPX route file, if any (e.g. "route_2026-08-05_9.46am.gpx") */
  routeFile: string | null;
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

/**
 * Parse an Apple Health export.xml from a ReadableStream without ever holding
 * the entire file in memory.
 *
 * Apple Health exports can be hundreds of MB (or larger). Loading the whole
 * file into a single JS string via `file.text()` fails for files > ~512 MB
 * (V8's maximum string length) and is memory-hostile even below that. This
 * function decodes the stream chunk-by-chunk, keeps only a small rolling
 * buffer, and extracts complete <Workout>...</Workout> elements as they
 * arrive, parsing each with the same logic as parseAppleHealthXml.
 */
export async function parseAppleHealthStream(
  stream: ReadableStream<Uint8Array>
): Promise<ParseResult> {
  const errors: string[] = [];
  const workouts: HealthWorkout[] = [];

  // fatal:false so partial multi-byte sequences at window boundaries are
  // tolerated (replaced) rather than throwing. ignoreBOM keeps a leading BOM
  // out of the buffer.
  const decoder = new TextDecoder("utf-8", { fatal: false, ignoreBOM: true });
  const reader = stream.getReader();

  // Rolling text buffer of not-yet-consumed characters. We only ever retain the
  // tail from the start of the current (incomplete) <Workout> onwards, so this
  // stays bounded regardless of total file size.
  let buffer = "";

  // Guard against pathological input (e.g. a never-closed tag) so the text
  // buffer can't grow without bound.
  const MAX_BUFFER = 64 * 1024 * 1024; // 64 MB

  // IMPORTANT: some runtimes (notably Node/undici's File.stream()) return the
  // ENTIRE file as a single Uint8Array chunk rather than many small chunks.
  // Decoding that in one call would exceed V8's max string length (~512 MB) and
  // throw ERR_ENCODING_INVALID_ENCODED_DATA. So we always re-slice every chunk
  // into fixed-size byte windows and decode each window incrementally.
  const WINDOW = 8 * 1024 * 1024; // 8 MB per decode

  const workoutOpen = /<Workout\s/;

  const processBuffer = () => {
    while (true) {
      const openMatch = workoutOpen.exec(buffer);
      if (!openMatch) {
        // No workout start present. Keep only the tail in case a "<Workout"
        // token is split across window boundaries.
        if (buffer.length > 16) buffer = buffer.slice(-16);
        return;
      }

      const openIdx = openMatch.index;
      const openTagEnd = buffer.indexOf(">", openIdx);
      if (openTagEnd === -1) {
        buffer = buffer.slice(openIdx);
        return;
      }

      const isSelfClosing = buffer[openTagEnd - 1] === "/";

      let elementEnd: number;
      if (isSelfClosing) {
        elementEnd = openTagEnd + 1;
      } else {
        const closeIdx = buffer.indexOf("</Workout>", openTagEnd);
        if (closeIdx === -1) {
          // Full workout not yet buffered. Discard anything before this workout
          // (it can't contain another workout start) and wait for more data.
          buffer = buffer.slice(openIdx);
          return;
        }
        elementEnd = closeIdx + "</Workout>".length;
      }

      const element = buffer.slice(openIdx, elementEnd);
      buffer = buffer.slice(elementEnd);

      const m = element.match(/<Workout\s([^>]*?)(?:\/>|>([\s\S]*?)<\/Workout>)/);
      if (m) {
        const attrs = m[1];
        const innerContent = m[2] || "";
        const type = extractAttr(attrs, "workoutActivityType");
        if (type && RUNNING_TYPES.includes(type)) {
          try {
            workouts.push(parseWorkoutElement(attrs, innerContent, ""));
          } catch (e) {
            errors.push(
              `Failed to parse workout: ${e instanceof Error ? e.message : String(e)}`
            );
          }
        }
      }
    }
  };

  const feed = (bytes: Uint8Array) => {
    for (let off = 0; off < bytes.length; off += WINDOW) {
      const window = bytes.subarray(off, Math.min(off + WINDOW, bytes.length));
      buffer += decoder.decode(window, { stream: true });
      processBuffer();
      if (buffer.length > MAX_BUFFER) {
        throw new Error(
          "Oversized element without a closing tag (malformed XML?)."
        );
      }
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      const bytes =
        value instanceof Uint8Array
          ? value
          : new Uint8Array(value as ArrayBufferLike);
      feed(bytes);
    }
    // Flush any trailing partial multi-byte sequence and do a final pass.
    buffer += decoder.decode();
    processBuffer();
  } catch (e) {
    errors.push(
      `Stream parsing failed: ${e instanceof Error ? e.message : String(e)}`
    );
  } finally {
    reader.releaseLock();
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

  // Extract route data from WorkoutRoute (inline <Location> elements, if any)
  const route = parseRouteFromWorkout(innerContent);

  // Capture a referenced GPX route file, if present. Apple Health stores the
  // actual GPS track in separate /workout-routes/*.gpx files and references
  // them from the workout via <FileReference path="..."/>.
  let routeFile: string | null = null;
  const fileRefMatch = innerContent.match(/<FileReference[^>]*path="([^"]*)"/);
  if (fileRefMatch) {
    // Keep only the basename so it matches uploaded file names regardless of path.
    routeFile = fileRefMatch[1].split("/").pop() || null;
  }

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
    routeFile,
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

/**
 * Parse an Apple Health GPX route file (text) into GPS points.
 *
 * GPX track points look like:
 *   <trkpt lon="74.27" lat="31.44"><ele>218.6</ele><time>...</time>...</trkpt>
 *
 * Individual GPX files are small (well under the string limit), so a single
 * pass is fine here.
 */
export function parseGpx(gpxText: string): GpsPoint[] {
  const points: GpsPoint[] = [];

  // lat/lon attribute order varies, so capture each independently per trkpt.
  const trkptMatches = gpxText.matchAll(/<trkpt\b([^>]*)>([\s\S]*?)<\/trkpt>/g);
  for (const m of trkptMatches) {
    const attrs = m[1];
    const inner = m[2];
    const lat = extractAttr(attrs, "lat");
    const lng = extractAttr(attrs, "lon");
    if (lat === null || lng === null) continue;

    const eleMatch = inner.match(/<ele>([^<]*)<\/ele>/);
    const timeMatch = inner.match(/<time>([^<]*)<\/time>/);

    points.push({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      elevation: eleMatch ? parseFloat(eleMatch[1]) : undefined,
      timestamp: timeMatch ? new Date(timeMatch[1]) : undefined,
    });
  }

  // Also handle self-closing trkpt (no inner ele/time): <trkpt lat=".." lon=".."/>
  if (points.length === 0) {
    const selfClosing = gpxText.matchAll(/<trkpt\b([^>]*)\/>/g);
    for (const m of selfClosing) {
      const lat = extractAttr(m[1], "lat");
      const lng = extractAttr(m[1], "lon");
      if (lat === null || lng === null) continue;
      points.push({ lat: parseFloat(lat), lng: parseFloat(lng) });
    }
  }

  return points;
}

/**
 * Attach GPS routes (parsed from separate .gpx files) to workouts that don't
 * already have an inline route.
 *
 * Matching strategy:
 *   1. Primary: the workout's <FileReference> basename === uploaded GPX filename.
 *   2. Fallback: match by date (GPX filenames are `route_YYYY-MM-DD_*`), pairing
 *      an unused GPX from the same calendar day as the workout's start date.
 *
 * `gpxByName` maps a GPX file's basename to its parsed points.
 */
export function attachRoutes(
  workouts: HealthWorkout[],
  gpxByName: Map<string, GpsPoint[]>
): number {
  let attached = 0;
  const used = new Set<string>();

  // Pass 1: exact FileReference basename match.
  for (const w of workouts) {
    if (w.route.length > 0) continue;
    if (w.routeFile && gpxByName.has(w.routeFile)) {
      w.route = gpxByName.get(w.routeFile)!;
      used.add(w.routeFile);
      if (w.route.length > 0) attached++;
    }
  }

  // Pass 2: date-based fallback for workouts still without a route.
  const remaining = [...gpxByName.keys()].filter((name) => !used.has(name));
  for (const w of workouts) {
    if (w.route.length > 0) continue;
    if (isNaN(w.startDate.getTime())) continue;
    const dateStr = w.startDate.toISOString().slice(0, 10); // YYYY-MM-DD
    const candidate = remaining.find(
      (name) => !used.has(name) && name.includes(dateStr)
    );
    if (candidate) {
      w.route = gpxByName.get(candidate)!;
      used.add(candidate);
      if (w.route.length > 0) attached++;
    }
  }

  return attached;
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
