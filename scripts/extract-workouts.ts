/**
 * Extract workout data from Apple Health export.xml
 * 
 * Run with: npx ts-node --skip-project scripts/extract-workouts.ts
 * 
 * Parses the large export.xml line-by-line to extract running workouts
 * with heart rate, cadence, power, distance, calories, weather, etc.
 * Then merges with existing GPS route data.
 */

import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

interface WorkoutData {
  startDate: string;
  endDate: string;
  duration: number;
  distance: number;
  calories: number;
  avgHeartRate: number | null;
  maxHeartRate: number | null;
  cadence: number | null;
  power: number | null;
  elevation: number | null;
  avgSpeed: number | null;
  maxSpeed: number | null;
  strideLength: number | null;
  groundContactTime: number | null;
  weather: { temperature: number | null; humidity: number | null } | null;
  routeFile: string | null;
  effortScore: number | null;
}

const EXPORT_FILE = "/Users/ahmadfaridabbas/Downloads/apple_health_export/export.xml";
const EXISTING_RUNS = path.join(__dirname, "..", "lib", "data", "imported-runs.json");
const OUTPUT_FILE = path.join(__dirname, "..", "lib", "data", "imported-runs.json");

async function main() {
  console.log("🏃 Extracting workouts from export.xml...");
  console.log(`📂 File: ${EXPORT_FILE}\n`);

  const workouts = await extractWorkouts();
  console.log(`\n✅ Found ${workouts.length} running/walking workouts`);

  // Load existing GPS data
  const existingRuns = JSON.parse(fs.readFileSync(EXISTING_RUNS, "utf-8"));
  console.log(`📍 Existing GPS runs: ${existingRuns.length}`);

  // Merge: match by date
  const merged = mergeData(workouts, existingRuns);
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2));
  console.log(`\n✨ Done! Output: ${OUTPUT_FILE}`);
  console.log(`   Total runs: ${merged.length}`);
  console.log(`   With HR data: ${merged.filter((r: any) => r.avgHeartRate).length}`);
  console.log(`   With routes: ${merged.filter((r: any) => r.routeData).length}`);
}

async function extractWorkouts(): Promise<WorkoutData[]> {
  const workouts: WorkoutData[] = [];
  
  const fileStream = fs.createReadStream(EXPORT_FILE, { encoding: "utf-8" });
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let inWorkout = false;
  let isRunning = false;
  let workoutLines: string[] = [];
  let count = 0;

  for await (const line of rl) {
    if (line.includes("<Workout ") && (line.includes("Running") || line.includes("Walking"))) {
      inWorkout = true;
      isRunning = true;
      workoutLines = [line];
    } else if (line.includes("<Workout ")) {
      inWorkout = true;
      isRunning = false;
      workoutLines = [];
    } else if (inWorkout && isRunning) {
      workoutLines.push(line);
      if (line.includes("</Workout>")) {
        const workout = parseWorkout(workoutLines.join("\n"));
        if (workout && workout.distance > 0.1) {
          workouts.push(workout);
          count++;
          if (count % 10 === 0) process.stdout.write(`\r   Parsed ${count} workouts...`);
        }
        inWorkout = false;
        isRunning = false;
        workoutLines = [];
      }
    } else if (inWorkout && line.includes("</Workout>")) {
      inWorkout = false;
      workoutLines = [];
    }
  }

  return workouts;
}

function parseWorkout(xml: string): WorkoutData | null {
  try {
    // Extract main attributes
    const startDate = extractAttr(xml, "startDate");
    const endDate = extractAttr(xml, "endDate");
    const duration = parseFloat(extractAttr(xml, "duration") || "0");

    if (!startDate || !endDate) return null;

    // Distance
    let distance = 0;
    const distMatch = xml.match(/IdentifierDistanceWalkingRunning[^>]*sum="([^"]+)"/);
    if (distMatch) distance = parseFloat(distMatch[1]);

    // Calories
    let calories = 0;
    const calMatch = xml.match(/IdentifierActiveEnergyBurned[^>]*sum="([^"]+)"/);
    if (calMatch) calories = Math.round(parseFloat(calMatch[1]));

    // Heart Rate
    let avgHeartRate: number | null = null;
    let maxHeartRate: number | null = null;
    const hrMatch = xml.match(/IdentifierHeartRate[^>]*average="([^"]+)"[^>]*minimum="[^"]*"[^>]*maximum="([^"]+)"/);
    if (hrMatch) {
      avgHeartRate = Math.round(parseFloat(hrMatch[1]));
      maxHeartRate = Math.round(parseFloat(hrMatch[2]));
    }

    // Cadence (steps / duration)
    let cadence: number | null = null;
    const stepMatch = xml.match(/IdentifierStepCount[^>]*sum="([^"]+)"/);
    if (stepMatch && duration > 0) {
      cadence = Math.round(parseFloat(stepMatch[1]) / duration);
    }

    // Running Power
    let power: number | null = null;
    const powerMatch = xml.match(/IdentifierRunningPower[^>]*average="([^"]+)"/);
    if (powerMatch) power = Math.round(parseFloat(powerMatch[1]));

    // Elevation
    let elevation: number | null = null;
    const elevMatch = xml.match(/HKElevationAscended[^>]*value="([^"]+)/);
    if (elevMatch) {
      const val = parseFloat(elevMatch[1]);
      elevation = Math.round(val / 100); // cm to m
    }

    // Speed
    let avgSpeed: number | null = null;
    let maxSpeed: number | null = null;
    const speedMatch = xml.match(/IdentifierRunningSpeed[^>]*average="([^"]+)"[^>]*minimum="[^"]*"[^>]*maximum="([^"]+)"/);
    if (speedMatch) {
      avgSpeed = Math.round(parseFloat(speedMatch[1]) * 100) / 100;
      maxSpeed = Math.round(parseFloat(speedMatch[2]) * 100) / 100;
    }

    // Stride Length
    let strideLength: number | null = null;
    const strideMatch = xml.match(/IdentifierRunningStrideLength[^>]*average="([^"]+)"/);
    if (strideMatch) strideLength = Math.round(parseFloat(strideMatch[1]) * 100) / 100;

    // Ground Contact Time
    let groundContactTime: number | null = null;
    const gctMatch = xml.match(/IdentifierRunningGroundContactTime[^>]*average="([^"]+)"/);
    if (gctMatch) groundContactTime = Math.round(parseFloat(gctMatch[1]));

    // Weather
    let weather: { temperature: number | null; humidity: number | null } | null = null;
    const tempMatch = xml.match(/HKWeatherTemperature[^>]*value="([^"]+)/);
    const humMatch = xml.match(/HKWeatherHumidity[^>]*value="([^"]+)/);
    if (tempMatch || humMatch) {
      const tempF = tempMatch ? parseFloat(tempMatch[1]) : null;
      const tempC = tempF !== null ? Math.round((tempF - 32) * 5 / 9) : null;
      const humidity = humMatch ? Math.round(parseFloat(humMatch[1]) / 100) : null;
      weather = { temperature: tempC, humidity };
    }

    // Route file reference
    let routeFile: string | null = null;
    const routeMatch = xml.match(/FileReference path="([^"]+)"/);
    if (routeMatch) routeFile = routeMatch[1];

    // Effort Score
    let effortScore: number | null = null;
    const effortMatch = xml.match(/EffortScore[^>]*value="([^"]+)"/);
    if (effortMatch) effortScore = parseInt(effortMatch[1]);

    return {
      startDate,
      endDate,
      duration,
      distance,
      calories,
      avgHeartRate,
      maxHeartRate,
      cadence,
      power,
      elevation,
      avgSpeed,
      maxSpeed,
      strideLength,
      groundContactTime,
      weather,
      routeFile,
      effortScore,
    };
  } catch {
    return null;
  }
}

function extractAttr(xml: string, name: string): string | null {
  const match = xml.match(new RegExp(`${name}="([^"]+)"`));
  return match ? match[1] : null;
}

function mergeData(workouts: WorkoutData[], existingRuns: any[]): any[] {
  // Create a map of existing runs by date for matching
  const runsByDate = new Map<string, any>();
  for (const run of existingRuns) {
    const key = run.startTime ? run.startTime.substring(0, 16) : run.date;
    runsByDate.set(key, run);
  }

  const merged: any[] = [];

  for (const workout of workouts) {
    // Parse the startDate (format: "2026-04-03 17:08:15 +0500")
    const parsedStart = new Date(workout.startDate.replace(" +", "+").replace(" ", "T"));
    const dateStr = parsedStart.toISOString().split("T")[0];
    const startIso = parsedStart.toISOString();

    // Try to find matching GPS run (within 5 min window)
    let matchedRoute: any = null;
    let matchedKey: string | null = null;
    runsByDate.forEach((run, key) => {
      if (matchedRoute) return;
      if (run.startTime) {
        const existingStart = new Date(run.startTime).getTime();
        const diff = Math.abs(parsedStart.getTime() - existingStart);
        if (diff < 5 * 60 * 1000) {
          matchedRoute = run.routeData;
          matchedKey = key;
        }
      }
    });
    if (matchedKey) runsByDate.delete(matchedKey);

    // Also try matching by date for older data
    if (!matchedRoute) {
      runsByDate.forEach((run, key) => {
        if (matchedRoute) return;
        if (run.date === dateStr && Math.abs(run.distance - workout.distance) < 0.5) {
          matchedRoute = run.routeData;
          matchedKey = key;
        }
      });
      if (matchedKey) runsByDate.delete(matchedKey);
    }

    const pace = workout.distance > 0 ? workout.duration / workout.distance : 0;

    merged.push({
      date: dateStr,
      startTime: startIso,
      endTime: new Date(workout.endDate.replace(" +", "+").replace(" ", "T")).toISOString(),
      duration: Math.round(workout.duration * 100) / 100,
      distance: Math.round(workout.distance * 1000) / 1000,
      pace: Math.round(pace * 100) / 100,
      avgHeartRate: workout.avgHeartRate,
      maxHeartRate: workout.maxHeartRate,
      cadence: workout.cadence,
      power: workout.power,
      elevation: workout.elevation,
      calories: workout.calories,
      avgSpeed: workout.avgSpeed,
      maxSpeed: workout.maxSpeed,
      strideLength: workout.strideLength,
      groundContactTime: workout.groundContactTime,
      weather: workout.weather,
      effortScore: workout.effortScore,
      routeData: matchedRoute,
      pointCount: matchedRoute ? matchedRoute.coordinates.length : 0,
    });
  }

  // Sort newest first
  merged.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  return merged;
}

main().catch(console.error);
