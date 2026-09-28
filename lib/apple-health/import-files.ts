import { parseGpx } from "@/lib/apple-health/parser";
export type ImportProgress = { percent: number; message: string };
/** Compact, already-simplified route keyed by its /workout-routes/ path. */
export type RouteMap = Map<string, RouteRecord>;
export async function parseHealthFiles(
  file: { name: string; size: number; stream: () => ReadableStream<Uint8Array> },
  gpxFiles: Pick<File, "name" | "text">[] | RouteMap,
  onProgress?: (progress: ImportProgress) => void,
) {
  if (file.name.toLowerCase() === "export_cda.xml")
    throw new Error("Choose export.xml. export_cda.xml is a clinical document and does not contain the workout export.");
  if (!file.name.toLowerCase().endsWith(".xml"))
    throw new Error(
      "Choose the extracted export.xml file, not the ZIP archive.",
    );
  let read = 0,
    last = -1;
  onProgress?.({ percent: 0, message: "Reading your health export…" });
  const workouts = await extractWorkoutsFromStream(file.stream(), (bytes) => {
    read += bytes;
    const percent = Math.min(
      90,
      Math.floor((read / Math.max(1, file.size)) * 90),
    );
    if (percent !== last) {
      last = percent;
      onProgress?.({ percent, message: "Reading your health export…" });
    }
  });
  if (!workouts.length)
    throw new Error(
      "No running, walking, or hiking workouts found. Choose a complete Apple Health export.xml.",
    );
  onProgress?.({ percent: 92, message: "Matching GPS routes…" });
  const routes =
    gpxFiles instanceof Map
      ? gpxFiles
      : await parseUploadedGpxFiles(gpxFiles);
  const runs = mergeWorkoutsWithRoutes(workouts, routes);
  onProgress?.({ percent: 98, message: "Preparing your workouts…" });
  return runs;
}
export type ImportedHealthRun = Awaited<
  ReturnType<typeof parseHealthFiles>
>[number];
type ParsedWorkout = NonNullable<ReturnType<typeof parseWorkoutXml>>;
type RouteRecord = {
  routeData: { type: string; coordinates: number[][] };
  pointCount: number;
};
type Zone = { min: number | null; max: number | null; duration: number };

// --- Stream export.xml and extract running/walking/hiking workouts ---
// Decodes the stream in bounded byte windows and pulls out complete
// <Workout>...</Workout> elements as they arrive, so the whole file is never
// held in one string.
async function extractWorkoutsFromStream(
  stream: ReadableStream<Uint8Array>,
  onBytes?: (bytes: number) => void,
): Promise<ParsedWorkout[]> {
  const workouts: ParsedWorkout[] = [];
  const decoder = new TextDecoder("utf-8", { fatal: false, ignoreBOM: true });
  const reader = stream.getReader();

  let buffer = "";
  const WINDOW = 8 * 1024 * 1024; // 8 MB per decode
  const MAX_BUFFER = 64 * 1024 * 1024; // 64 MB safety cap
  const workoutOpen = /<Workout\s/;

  const processBuffer = () => {
    while (true) {
      const openMatch = workoutOpen.exec(buffer);
      if (!openMatch) {
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
          buffer = buffer.slice(openIdx);
          return;
        }
        elementEnd = closeIdx + "</Workout>".length;
      }

      const element = buffer.slice(openIdx, elementEnd);
      buffer = buffer.slice(elementEnd);

      // Only running-type workouts, matching the original filter.
      if (
        element.includes("Running") ||
        element.includes("Walking") ||
        element.includes("Hiking")
      ) {
        const workout = parseWorkoutXml(element);
        if (
          workout &&
          Number.isFinite(workout.distance) &&
          workout.distance > 0
        ) {
          workouts.push(workout);
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
          "Oversized element without a closing tag (malformed XML?).",
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
      onBytes?.(bytes.byteLength);
    }
    buffer += decoder.decode();
    processBuffer();
    if (/<Workout(?:\s|$)/.test(buffer))
      throw new Error(
        "The XML ends inside a workout. Please extract a complete export.xml and try again.",
      );
  } finally {
    reader.releaseLock();
  }

  return workouts;
}

function parseWorkoutXml(xml: string) {
  try {
    const startDate = extractAttr(xml, "startDate");
    const endDate = extractAttr(xml, "endDate");
    let duration = parseFloat(extractAttr(xml, "duration") || "0");
    const durationUnit = extractAttr(xml, "durationUnit");
    if (durationUnit === "s") duration /= 60;
    if (durationUnit === "hr") duration *= 60;
    if (!startDate || !endDate || !Number.isFinite(duration) || duration <= 0)
      return null;
    if (
      !Number.isFinite(
        new Date(
          startDate.replace(/ ([+-]\d{4})$/, "$1").replace(" ", "T"),
        ).getTime(),
      )
    )
      return null;

    // Read attributes independently: Apple Health does not guarantee their order.
    const statistic = (identifier: string) =>
      xml.match(
        new RegExp(`<WorkoutStatistics[^>]*${identifier}[^>]*>`),
      )?.[0] || "";
    const numeric = (tag: string, attribute: string): number | null => {
      const raw = extractAttr(tag, attribute);
      if (raw === null) return null;
      const n = Number.parseFloat(raw);
      return Number.isFinite(n) ? n : null;
    };
    const distanceTag = statistic("IdentifierDistanceWalkingRunning");
    let distance =
      numeric(distanceTag, "sum") ?? numeric(xml, "totalDistance") ?? 0;
    const distanceUnit =
      extractAttr(distanceTag, "unit") || extractAttr(xml, "totalDistanceUnit");
    if (distanceUnit === "mi") distance *= 1.609344;
    if (distanceUnit === "m") distance /= 1000;
    const energy = (identifier: string) => {
      const tag = statistic(identifier),
        value = numeric(tag, "sum");
      return value === null
        ? null
        : Math.round(extractAttr(tag, "unit") === "kJ" ? value / 4.184 : value);
    };
    const activeCalories = energy("IdentifierActiveEnergyBurned");
    const basalCalories = energy("IdentifierBasalEnergyBurned");
    const hrTag = statistic("IdentifierHeartRate");
    const avgHeartRate = numeric(hrTag, "average");
    const maxHeartRate = numeric(hrTag, "maximum");
    const minHeartRate = numeric(hrTag, "minimum");

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
    const powerMatch = xml.match(
      /IdentifierRunningPower[^>]*average="([^"]+)"[^>]*minimum="[^"]*"[^>]*maximum="([^"]+)"/,
    );
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
    const speedMatch = xml.match(
      /IdentifierRunningSpeed[^>]*average="([^"]+)"[^>]*minimum="[^"]*"[^>]*maximum="([^"]+)"/,
    );
    if (speedMatch) {
      avgSpeed = Math.round(parseFloat(speedMatch[1]) * 100) / 100;
      maxSpeed = Math.round(parseFloat(speedMatch[2]) * 100) / 100;
    }

    // Stride Length
    let avgStride: number | null = null;
    let maxStride: number | null = null;
    const strideMatch = xml.match(
      /IdentifierRunningStrideLength[^>]*average="([^"]+)"[^>]*minimum="[^"]*"[^>]*maximum="([^"]+)"/,
    );
    if (strideMatch) {
      avgStride = Math.round(parseFloat(strideMatch[1]) * 100) / 100;
      maxStride = Math.round(parseFloat(strideMatch[2]) * 100) / 100;
    }

    // Ground Contact Time
    let avgGCT: number | null = null;
    const gctMatch = xml.match(
      /IdentifierRunningGroundContactTime[^>]*average="([^"]+)"/,
    );
    if (gctMatch) avgGCT = Math.round(parseFloat(gctMatch[1]));

    // Vertical Oscillation
    let avgVertOsc: number | null = null;
    const voMatch = xml.match(
      /IdentifierRunningVerticalOscillation[^>]*average="([^"]+)"/,
    );
    if (voMatch) avgVertOsc = Math.round(parseFloat(voMatch[1]) * 100) / 100;

    // Weather
    let weather: {
      temperature: number | null;
      humidity: number | null;
    } | null = null;
    const tempMatch = xml.match(/HKWeatherTemperature[^>]*value="([^"]+)/);
    const humMatch = xml.match(/HKWeatherHumidity[^>]*value="([^"]+)/);
    if (tempMatch || humMatch) {
      const tempF = tempMatch ? parseFloat(tempMatch[1]) : null;
      const tempC =
        tempF !== null
          ? tempMatch?.[1].includes("degC")
            ? tempF
            : Math.round(((tempF - 32) * 5) / 9)
          : null;
      const rawHumidity = humMatch ? parseFloat(humMatch[1]) : null;
      const humidity =
        rawHumidity === null
          ? null
          : Math.round(rawHumidity <= 1 ? rawHumidity * 100 : rawHumidity);
      weather = { temperature: tempC, humidity };
    }

    // Indoor
    const indoorTag =
      xml.match(/<MetadataEntry[^>]*HKIndoorWorkout[^>]*>/)?.[0] || "";
    const indoor = extractAttr(indoorTag, "value") === "1";

    // Route file reference
    let routeFile: string | null = null;
    const routeMatch = xml.match(/FileReference path="([^"]+)"/);
    if (routeMatch) routeFile = routeMatch[1];

    // Effort Score
    let effortScore: number | null = null;
    const effortMatch = xml.match(/EffortScore[^>]*value="([^"]+)"/);
    if (effortMatch) effortScore = parseInt(effortMatch[1]);

    // Heart Rate Zones
    let heartRateZones: Zone[] | null = null;
    const zoneMatches = xml.matchAll(
      /<WorkoutZone(?:\s+minimum="([^"]*)")?(?:\s+maximum="([^"]*)")?\s+duration="([^"]+)"/g,
    );
    const zones: Zone[] = [];
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
    const workoutType = typeMatch
      ? typeMatch[1].replace("HKWorkoutActivityType", "")
      : "Running";

    const pace = distance > 0 ? duration / distance : 0;

    return {
      startDate,
      endDate,
      duration,
      distance,
      pace,
      activeCalories,
      basalCalories,
      totalCalories:
        activeCalories === null && basalCalories === null
          ? null
          : (activeCalories ?? 0) + (basalCalories ?? 0),
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

// --- Parse a single GPX text into a compact, simplified route record ---
// Exported so the ZIP path can parse each entry and immediately discard its
// raw text, rather than holding every route's full text in memory at once.
// Returns [routeKey, record] or null when the file has too few points.
export function simplifyGpxToRoute(
  name: string,
  gpxText: string,
): [string, RouteRecord] | null {
  const points = parseGpx(gpxText);
  if (points.length < 2) return null;

  // Simplify route (keep every Nth point, max 200)
  const count = Math.min(200, points.length);
  const simplified = Array.from({ length: count }, (_, i) =>
    points[Math.round((i * (points.length - 1)) / (count - 1))],
  );

  const routeData = {
    type: "LineString",
    coordinates: simplified.map((p) => [p.lng, p.lat, p.elevation ?? 0]),
  };

  // Key by filename (matches against route file references).
  return [`/workout-routes/${name}`, { routeData, pointCount: points.length }];
}

// --- Parse uploaded GPX files ---
async function parseUploadedGpxFiles(gpxFiles: Pick<File, "name" | "text">[]) {
  const routeMap: RouteMap = new Map();

  for (const file of gpxFiles) {
    try {
      const entry = simplifyGpxToRoute(file.name, await file.text());
      if (entry) routeMap.set(entry[0], entry[1]);
    } catch {
      // skip failed files
    }
  }

  return routeMap;
}

// --- Merge workouts with routes ---
function mergeWorkoutsWithRoutes(
  workouts: ParsedWorkout[],
  routes: Map<string, RouteRecord>,
) {
  const merged = workouts.map((workout) => {
    const parsedStart = new Date(
      workout.startDate.replace(/ ([+-]\d{4})$/, "$1").replace(" ", "T"),
    );
    const parsedEnd = new Date(
      workout.endDate.replace(/ ([+-]\d{4})$/, "$1").replace(" ", "T"),
    );
    const dateStr = workout.startDate.slice(0, 10);

    // Match route by file reference
    let routeData = null;
    let pointCount = 0;
    if (workout.routeFile) {
      // Try exact match first
      if (routes.has(workout.routeFile)) {
        const route = routes.get(workout.routeFile)!;
        routeData = route.routeData;
        pointCount = route.pointCount;
      } else {
        // Try matching by filename only (uploaded files won't have full path)
        const routeFileName = workout.routeFile.split("/").pop();
        for (const [key, route] of routes.entries()) {
          if (routeFileName && key.endsWith(routeFileName)) {
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
  merged.sort(
    (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
  );
  return merged;
}
