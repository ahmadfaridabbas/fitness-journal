import importedData from "@/lib/data/imported-runs.json";

interface ImportedRun {
  date: string;
  startTime: string;
  endTime: string;
  workoutType?: string;
  duration: number;
  distance: number;
  pace: number;
  activeCalories?: number;
  basalCalories?: number;
  totalCalories?: number;
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
  heartRateZones?: any[] | null;
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

export const realRuns = (importedData as ImportedRun[])
  .filter((r) => r.distance > 0.5)
  .map((run, i) => ({
    id: `run_imported_${i}`,
    date: run.date,
    distance: Math.round(run.distance * 100) / 100,
    duration: Math.round(run.duration),
    pace: Math.round(run.pace * 100) / 100,
    avgHeartRate: run.avgHeartRate,
    maxHeartRate: run.maxHeartRate,
    cadence: run.cadence,
    power: run.avgPower || run.power || null,
    elevation: run.elevation,
    calories: run.totalCalories || run.activeCalories || run.calories || 0,
    indoor: run.indoor || false,
    effort: run.effortScore,
    notes: null,
    route: `Run on ${run.date}`,
    routeData: run.routeData,
    moodBefore: null,
    moodAfter: null,
    aiAnalysis: null,
    coachScore: null,
    recoveryScore: null,
    trainingLoad: getTrainingLoad(run.pace, run.duration),
    shoeId: null,
    weather: run.weather ? {
      temperature: run.weather.temperature,
      humidity: run.weather.humidity,
      windSpeed: null,
      condition: null,
      feelsLike: null,
      aqi: null,
      pressure: null,
      sunrise: null,
      sunset: null,
    } : null,
  }));
