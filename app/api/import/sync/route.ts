import { NextRequest, NextResponse } from "next/server";
import * as path from "path";
import * as fs from "fs";

const OUTPUT_FILE = path.join(process.cwd(), "lib", "data", "imported-runs.json");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const exportFile = formData.get("exportFile") as File | null;
    const gpxFiles = formData.getAll("gpxFiles") as File[];

    if (!exportFile) {
      return NextResponse.json(
        { error: "No export.xml file provided. Please upload your Apple Health export." },
        { status: 400 }
      );
    }

    if (!exportFile.name.endsWith(".xml")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an XML file." },
        { status: 400 }
      );
    }

    // Read export.xml content
    const exportXmlText = await exportFile.text();

    if (!exportXmlText.includes("HealthData") && !exportXmlText.includes("Workout")) {
      return NextResponse.json(
        { error: "This does not appear to be an Apple Health export file." },
        { status: 400 }
      );
    }

    // Step 1: Parse all workouts from export.xml
    const workouts = extractWorkouts(exportXmlText);

    // Step 2: Parse GPS routes from uploaded GPX files
    const routes = await parseUploadedGpxFiles(gpxFiles);

    // Step 3: Merge workouts with GPS data
    const merged = mergeWorkoutsWithRoutes(workouts, routes);

    // Step 4: Write to data file
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2));

    // Summary stats
    const stats = {
      totalRuns: merged.length,
      withHeartRate: merged.filter((r: any) => r.avgHeartRate).length,
      withRoutes: merged.filter((r: any) => r.routeData).length,
      withWeather: merged.filter((r: any) => r.weather).length,
      withCadence: merged.filter((r: any) => r.cadence).length,
      withPower: merged.filter((r: any) => r.power).length,
      totalDistance: Math.round(merged.reduce((s: number, r: any) => s + r.distance, 0) * 10) / 10,
      dateRange: {
        from: merged.length > 0 ? merged[merged.length - 1].date : null,
        to: merged.length > 0 ? merged[0].date : null,
      },
    };

    return NextResponse.json({ success: true, stats });
  } catch (e) {
    console.error("Import error:", e);
    return NextResponse.json(
      { error: `Import failed: ${e instanceof Error ? e.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}

// --- Extract workouts from export.xml text ---
function extractWorkouts(xmlText: string) {
  const workouts: any[] = [];
  const lines = xmlText.split("\n");

  let inWorkout = false;
  let isRunning = false;
  let workoutLines: string[] = [];

  for (const line of lines) {
    if (line.includes("<Workout ") && (line.includes("Running") || line.includes("Walking") || line.includes("Hiking"))) {
      inWorkout = true;
      isRunning = true;
      workoutLines = [line];
    } else if (line.includes("<Workout ")) {
      inWorkout = true;
      isRunning = false;
    } else if (inWorkout && isRunning) {
      workoutLines.push(line);
      if (line.includes("</Workout>")) {
        const workout = parseWorkoutXml(workoutLines.join("\n"));
        if (workout && workout.distance > 0.1) {
          workouts.push(workout);
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

function parseWorkoutXml(xml: string) {
  try {
    const startDate = extractAttr(xml, "startDate");
    const endDate = extractAttr(xml, "endDate");
    const duration = parseFloat(extractAttr(xml, "duration") || "0");
    if (!startDate || !endDate) return null;

    // Distance
    let distance = 0;
    const distMatch = xml.match(/IdentifierDistanceWalkingRunning[^>]*sum="([^"]+)"/);
    if (distMatch) distance = parseFloat(distMatch[1]);

    // Calories (active + basal)
    let activeCalories = 0;
    let basalCalories = 0;
    const activeCalMatch = xml.match(/IdentifierActiveEnergyBurned[^>]*sum="([^"]+)"/);
    if (activeCalMatch) activeCalories = Math.round(parseFloat(activeCalMatch[1]));
    const basalCalMatch = xml.match(/IdentifierBasalEnergyBurned[^>]*sum="([^"]+)"/);
    if (basalCalMatch) basalCalories = Math.round(parseFloat(basalCalMatch[1]));

    // Heart Rate
    let avgHeartRate: number | null = null;
    let maxHeartRate: number | null = null;
    let minHeartRate: number | null = null;
    const hrMatch = xml.match(/IdentifierHeartRate[^>]*average="([^"]+)"[^>]*minimum="([^"]*)"[^>]*maximum="([^"]+)"/);
    if (hrMatch) {
      avgHeartRate = Math.round(parseFloat(hrMatch[1]));
      minHeartRate = Math.round(parseFloat(hrMatch[2]));
      maxHeartRate = Math.round(parseFloat(hrMatch[3]));
    }

    // Step count / Cadence
    let cadence: number | null = null;
    let totalSteps: number | null = null;
    const stepMatch = xml.match(/IdentifierStepCount[^>]*sum="([^"]+)"/);
    if (stepMatch && duration > 0) {
      totalSteps = Math.round(parseFloat(stepMatch[1]));
      cadence = Math.round(totalSteps / duration);
    }

    // Running Power
    let avgPower: number | null = null;
    let maxPower: number | null = null;
    const powerMatch = xml.match(/IdentifierRunningPower[^>]*average="([^"]+)"[^>]*minimum="[^"]*"[^>]*maximum="([^"]+)"/);
    if (powerMatch) {
      avgPower = Math.round(parseFloat(powerMatch[1]));
      maxPower = Math.round(parseFloat(powerMatch[2]));
    }

    // Elevation
    let elevation: number | null = null;
    const elevMatch = xml.match(/HKElevationAscended[^>]*value="([^"]+)/);
    if (elevMatch) elevation = Math.round(parseFloat(elevMatch[1]) / 100); // cm to m

    // Speed
    let avgSpeed: number | null = null;
    let maxSpeed: number | null = null;
    const speedMatch = xml.match(/IdentifierRunningSpeed[^>]*average="([^"]+)"[^>]*minimum="[^"]*"[^>]*maximum="([^"]+)"/);
    if (speedMatch) {
      avgSpeed = Math.round(parseFloat(speedMatch[1]) * 100) / 100;
      maxSpeed = Math.round(parseFloat(speedMatch[2]) * 100) / 100;
    }

    // Stride Length
    let avgStride: number | null = null;
    let maxStride: number | null = null;
    const strideMatch = xml.match(/IdentifierRunningStrideLength[^>]*average="([^"]+)"[^>]*minimum="[^"]*"[^>]*maximum="([^"]+)"/);
    if (strideMatch) {
      avgStride = Math.round(parseFloat(strideMatch[1]) * 100) / 100;
      maxStride = Math.round(parseFloat(strideMatch[2]) * 100) / 100;
    }

    // Ground Contact Time
    let avgGCT: number | null = null;
    const gctMatch = xml.match(/IdentifierRunningGroundContactTime[^>]*average="([^"]+)"/);
    if (gctMatch) avgGCT = Math.round(parseFloat(gctMatch[1]));

    // Vertical Oscillation
    let avgVertOsc: number | null = null;
    const voMatch = xml.match(/IdentifierRunningVerticalOscillation[^>]*average="([^"]+)"/);
    if (voMatch) avgVertOsc = Math.round(parseFloat(voMatch[1]) * 100) / 100;

    // Weather
    let weather: any = null;
    const tempMatch = xml.match(/HKWeatherTemperature[^>]*value="([^"]+)/);
    const humMatch = xml.match(/HKWeatherHumidity[^>]*value="([^"]+)/);
    if (tempMatch || humMatch) {
      const tempF = tempMatch ? parseFloat(tempMatch[1]) : null;
      const tempC = tempF !== null ? Math.round((tempF - 32) * 5 / 9) : null;
      const humidity = humMatch ? Math.round(parseFloat(humMatch[1]) / 100) : null;
      weather = { temperature: tempC, humidity };
    }

    // Indoor
    const indoor = xml.includes('HKIndoorWorkout') && xml.includes('value="1"');

    // Route file reference
    let routeFile: string | null = null;
    const routeMatch = xml.match(/FileReference path="([^"]+)"/);
    if (routeMatch) routeFile = routeMatch[1];

    // Effort Score
    let effortScore: number | null = null;
    const effortMatch = xml.match(/EffortScore[^>]*value="([^"]+)"/);
    if (effortMatch) effortScore = parseInt(effortMatch[1]);

    // Heart Rate Zones
    let heartRateZones: any[] | null = null;
    const zoneMatches = xml.matchAll(/<WorkoutZone(?:\s+minimum="([^"]*)")?(?:\s+maximum="([^"]*)")?\s+duration="([^"]+)"/g);
    const zones: any[] = [];
    for (const z of zoneMatches) {
      zones.push({
        min: z[1] ? parseInt(z[1]) : null,
        max: z[2] ? parseInt(z[2]) : null,
        duration: parseFloat(z[3]),
      });
    }
    if (zones.length > 0) heartRateZones = zones;

    // Workout type
    const typeMatch = xml.match(/workoutActivityType="([^"]+)"/);
    const workoutType = typeMatch ? typeMatch[1].replace("HKWorkoutActivityType", "") : "Running";

    const pace = distance > 0 ? duration / distance : 0;

    return {
      startDate,
      endDate,
      duration: Math.round(duration * 100) / 100,
      distance: Math.round(distance * 1000) / 1000,
      pace: Math.round(pace * 100) / 100,
      activeCalories,
      basalCalories,
      totalCalories: activeCalories + basalCalories,
      avgHeartRate,
      maxHeartRate,
      minHeartRate,
      cadence,
      totalSteps,
      avgPower,
      maxPower,
      elevation,
      avgSpeed,
      maxSpeed,
      avgStride,
      maxStride,
      avgGCT,
      avgVertOsc,
      weather,
      indoor,
      routeFile,
      effortScore,
      heartRateZones,
      workoutType,
    };
  } catch {
    return null;
  }
}

function extractAttr(xml: string, name: string): string | null {
  const match = xml.match(new RegExp(`${name}="([^"]+)"`));
  return match ? match[1] : null;
}

// --- Parse uploaded GPX files ---
async function parseUploadedGpxFiles(gpxFiles: File[]) {
  const routeMap = new Map<string, any>();

  for (const file of gpxFiles) {
    try {
      const xml = await file.text();
      const points: any[] = [];

      const trkptRegex = /<trkpt\s+lon="([^"]+)"\s+lat="([^"]+)"[^>]*>[\s\S]*?<ele>([^<]+)<\/ele>[\s\S]*?<time>([^<]+)<\/time>[\s\S]*?<speed>([^<]+)<\/speed>[\s\S]*?<\/trkpt>/g;
      let match;
      while ((match = trkptRegex.exec(xml)) !== null) {
        points.push({
          lng: parseFloat(match[1]),
          lat: parseFloat(match[2]),
          elevation: parseFloat(match[3]),
          time: match[4],
          speed: parseFloat(match[5]),
        });
      }

      if (points.length < 2) continue;

      // Simplify route (keep every Nth point, max 200)
      const factor = Math.max(1, Math.floor(points.length / 200));
      const simplified = points.filter((_, i) => i % factor === 0);

      const routeData = {
        type: "LineString",
        coordinates: simplified.map((p) => [p.lng, p.lat, p.elevation]),
      };

      // Store with the filename as key (matches against route file references)
      routeMap.set(`/workout-routes/${file.name}`, {
        routeData,
        pointCount: points.length,
      });
    } catch {
      // skip failed files
    }
  }

  return routeMap;
}

// --- Merge workouts with routes ---
function mergeWorkoutsWithRoutes(workouts: any[], routes: Map<string, any>) {
  const merged = workouts.map((workout) => {
    const parsedStart = new Date(workout.startDate.replace(" +", "+").replace(" ", "T"));
    const parsedEnd = new Date(workout.endDate.replace(" +", "+").replace(" ", "T"));
    const dateStr = parsedStart.toISOString().split("T")[0];

    // Match route by file reference
    let routeData = null;
    let pointCount = 0;
    if (workout.routeFile) {
      // Try exact match first
      if (routes.has(workout.routeFile)) {
        const route = routes.get(workout.routeFile);
        routeData = route.routeData;
        pointCount = route.pointCount;
      } else {
        // Try matching by filename only (uploaded files won't have full path)
        const routeFileName = workout.routeFile.split("/").pop();
        for (const [key, route] of routes.entries()) {
          if (key.endsWith(routeFileName)) {
            routeData = route.routeData;
            pointCount = route.pointCount;
            break;
          }
        }
      }
    }

    return {
      date: dateStr,
      startTime: parsedStart.toISOString(),
      endTime: parsedEnd.toISOString(),
      workoutType: workout.workoutType,
      duration: workout.duration,
      distance: workout.distance,
      pace: workout.pace,
      activeCalories: workout.activeCalories,
      basalCalories: workout.basalCalories,
      totalCalories: workout.totalCalories,
      avgHeartRate: workout.avgHeartRate,
      maxHeartRate: workout.maxHeartRate,
      minHeartRate: workout.minHeartRate,
      cadence: workout.cadence,
      totalSteps: workout.totalSteps,
      avgPower: workout.avgPower,
      maxPower: workout.maxPower,
      elevation: workout.elevation,
      avgSpeed: workout.avgSpeed,
      maxSpeed: workout.maxSpeed,
      avgStride: workout.avgStride,
      maxStride: workout.maxStride,
      avgGCT: workout.avgGCT,
      avgVertOsc: workout.avgVertOsc,
      weather: workout.weather,
      indoor: workout.indoor,
      effortScore: workout.effortScore,
      heartRateZones: workout.heartRateZones,
      routeData,
      pointCount,
    };
  });

  // Sort newest first
  merged.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  return merged;
}
