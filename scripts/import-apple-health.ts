/**
 * Local Apple Health Import Script
 * 
 * Run with: npx ts-node --skip-project scripts/import-apple-health.ts
 * 
 * Reads GPX files from the Apple Health export folder and
 * outputs structured JSON data for the fitness journal.
 */

import * as fs from "fs";
import * as path from "path";

interface GpsPoint {
  lat: number;
  lng: number;
  elevation: number;
  time: string;
  speed: number;
}

interface ParsedRun {
  date: string;
  startTime: string;
  endTime: string;
  duration: number; // minutes
  distance: number; // km
  pace: number; // min/km
  avgSpeed: number; // km/h
  maxSpeed: number; // km/h
  elevation: { gain: number; loss: number; min: number; max: number };
  calories: number;
  routeData: { type: string; coordinates: number[][] };
  pointCount: number;
}

const EXPORT_PATH = "/Users/ahmadfaridabbas/Documents/Fitness Project/Apple Health Export/workout-routes";
const OUTPUT_PATH = path.join(__dirname, "..", "lib", "data", "imported-runs.json");

function parseGpxFile(filePath: string): ParsedRun | null {
  const xml = fs.readFileSync(filePath, "utf-8");
  const points: GpsPoint[] = [];

  // Extract track points
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

  if (points.length < 2) return null;

  // Calculate metrics
  const startTime = new Date(points[0].time);
  const endTime = new Date(points[points.length - 1].time);
  const durationMs = endTime.getTime() - startTime.getTime();
  const duration = durationMs / 60000; // minutes

  // Calculate distance using Haversine
  let distance = 0;
  let elevGain = 0;
  let elevLoss = 0;
  let minElev = points[0].elevation;
  let maxElev = points[0].elevation;
  let maxSpeed = 0;

  for (let i = 1; i < points.length; i++) {
    distance += haversine(points[i - 1], points[i]);

    const elevDiff = points[i].elevation - points[i - 1].elevation;
    if (elevDiff > 0) elevGain += elevDiff;
    else elevLoss += Math.abs(elevDiff);

    minElev = Math.min(minElev, points[i].elevation);
    maxElev = Math.max(maxElev, points[i].elevation);
    maxSpeed = Math.max(maxSpeed, points[i].speed);
  }

  const pace = distance > 0 ? duration / distance : 0;
  const avgSpeed = duration > 0 ? (distance / duration) * 60 : 0;

  // Simplify route for storage (keep every Nth point)
  const simplifyFactor = Math.max(1, Math.floor(points.length / 200));
  const simplified = points.filter((_, i) => i % simplifyFactor === 0);

  return {
    date: startTime.toISOString().split("T")[0],
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration: Math.round(duration * 100) / 100,
    distance: Math.round(distance * 1000) / 1000,
    pace: Math.round(pace * 100) / 100,
    avgSpeed: Math.round(avgSpeed * 100) / 100,
    maxSpeed: Math.round(maxSpeed * 3.6 * 100) / 100, // m/s to km/h
    elevation: {
      gain: Math.round(elevGain),
      loss: Math.round(elevLoss),
      min: Math.round(minElev),
      max: Math.round(maxElev),
    },
    calories: estimateCalories(distance, duration),
    routeData: {
      type: "LineString",
      coordinates: simplified.map((p) => [p.lng, p.lat, p.elevation]),
    },
    pointCount: points.length,
  };
}

function haversine(p1: GpsPoint, p2: GpsPoint): number {
  const R = 6371; // km
  const dLat = toRad(p2.lat - p1.lat);
  const dLon = toRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

function estimateCalories(distanceKm: number, durationMin: number): number {
  // Rough estimate: ~70 cal per km for a 70kg runner
  return Math.round(distanceKm * 70);
}

// Main
function main() {
  console.log("🏃 Apple Health GPX Import");
  console.log(`📂 Reading from: ${EXPORT_PATH}`);
  console.log("");

  const files = fs.readdirSync(EXPORT_PATH).filter((f) => f.endsWith(".gpx"));
  console.log(`Found ${files.length} GPX files\n`);

  const runs: ParsedRun[] = [];
  let errors = 0;

  for (const file of files) {
    try {
      const result = parseGpxFile(path.join(EXPORT_PATH, file));
      if (result && result.distance > 0.1) {
        runs.push(result);
        console.log(`✅ ${file} → ${result.distance.toFixed(2)} km, ${result.duration.toFixed(0)} min`);
      }
    } catch (e) {
      errors++;
      console.log(`❌ ${file}: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  // Sort by date (newest first)
  runs.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(runs, null, 2));

  console.log(`\n✨ Done!`);
  console.log(`   Imported: ${runs.length} runs`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Output: ${OUTPUT_PATH}`);
  console.log(`\n   Total distance: ${runs.reduce((s, r) => s + r.distance, 0).toFixed(1)} km`);
}

main();
