import importedData from "@/lib/data/imported-runs.json";

interface ImportedRun {
  date: string;
  startTime: string;
  endTime: string;
  workoutType?: string;
  duration: number;
  distance: number;
  pace: number;
  activeCalories?: number | null;
  basalCalories?: number | null;
  totalCalories?: number | null;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  minHeartRate?: number | null;
  cadence: number | null;
  totalSteps?: number | null;
  avgPower?: number | null;
  maxPower?: number | null;
  power?: number | null;
  elevation: number | null;
  avgSpeed: number | null;
  maxSpeed: number | null;
  avgStride?: number | null;
  maxStride?: number | null;
  avgGCT?: number | null;
  avgVertOsc?: number | null;
  weather: { temperature: number | null; humidity: number | null } | null;
  indoor?: boolean;
  effortScore: number | null;
  heartRateZones?: unknown[] | null;
  routeData: { type: string; coordinates: number[][] } | null;
  pointCount: number;
  // Legacy fields
  calories?: number;
  strideLength?: number | null;
  groundContactTime?: number | null;
}

function getTrainingLoad(pace: number, duration: number): string {
  if (pace < 4.5 || duration > 90) return "intense";
  if (pace < 5.5 || duration > 60) return "hard";
  if (pace < 6.5 || duration > 40) return "moderate";
  return "easy";
}

export function normalizeImportedRun(run: ImportedRun, id: string) {
  return {
    id,
    date: run.date,
    distance: run.distance,
    duration: run.duration,
    workoutType: run.workoutType || "Running",
    startTime: run.startTime,
    pace: run.duration / run.distance,
    avgHeartRate: run.avgHeartRate,
    maxHeartRate: run.maxHeartRate,
    cadence: run.cadence,
    power: run.avgPower || run.power || null,
    elevation: run.elevation,
    calories: run.totalCalories ?? run.activeCalories ?? run.calories ?? null,
    indoor: run.indoor || false,
    effort: run.effortScore,
    notes: null as string | null,
    route: `Run on ${run.date}`,
    routeData: run.routeData,
    moodBefore: null,
    moodAfter: null,
    aiAnalysis: null,
    coachScore: null,
    recoveryScore: null,
    trainingLoad: getTrainingLoad(run.pace, run.duration),
    shoeId: null,
    weather: run.weather
      ? {
          temperature: run.weather.temperature,
          humidity: run.weather.humidity,
          windSpeed: null,
          condition: null,
          feelsLike: null,
          aqi: null,
          pressure: null,
          sunrise: null,
          sunset: null,
        }
      : null,
  };
}

let legacyIndex = 0;
export const realRuns = (importedData as ImportedRun[])
  .map((run, i) =>
    normalizeImportedRun(
      run,
      run.distance > 0.5 ? `run_imported_${legacyIndex++}` : `run_short_${i}`,
    ),
  )
  .filter(
    (r) =>
      Number.isFinite(r.distance) &&
      r.distance > 0 &&
      Number.isFinite(r.duration) &&
      r.duration > 0,
  );
