import { NextRequest, NextResponse } from "next/server";
import {
  parseAppleHealthStream,
  parseGpx,
  attachRoutes,
  workoutToRunData,
  type GpsPoint,
} from "@/lib/apple-health/parser";

// Apple Health exports can be very large (hundreds of MB). Run on the Node.js
// runtime and allow a long processing window instead of the default edge/short
// limits.
export const runtime = "nodejs";
export const maxDuration = 300; // seconds
export const dynamic = "force-dynamic";

// POST /api/import/apple-health - Import Apple Health export.xml (+ optional GPX routes)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Accept either a single "file" (export.xml) or many "files" (export.xml
    // plus the /workout-routes/*.gpx files, e.g. from a folder upload).
    const all = [
      ...formData.getAll("file"),
      ...formData.getAll("files"),
    ].filter((f): f is File => f instanceof File);

    if (all.length === 0) {
      return NextResponse.json(
        { error: "No file provided. Please upload your export.xml (and optionally the workout-routes folder)." },
        { status: 400 }
      );
    }

    const xmlFile = all.find((f) => f.name.endsWith(".xml"));
    const gpxFiles = all.filter((f) => f.name.toLowerCase().endsWith(".gpx"));

    if (!xmlFile) {
      return NextResponse.json(
        { error: "No export.xml found. Please include the Apple Health export.xml file." },
        { status: 400 }
      );
    }

    // Stream the (potentially huge) XML instead of loading it all into one
    // string, which would exceed V8's max string length for large exports.
    const result = await parseAppleHealthStream(xmlFile.stream());

    if (result.workouts.length === 0) {
      const looksLikeHealthExport = result.errors.length === 0;
      return NextResponse.json(
        {
          error: looksLikeHealthExport
            ? "No running workouts found in this export."
            : "Could not parse this file as an Apple Health export.",
          details: result.errors.length > 0 ? result.errors : undefined,
        },
        { status: 404 }
      );
    }

    // Parse any provided GPX route files and attach them to workouts.
    let routesAttached = 0;
    if (gpxFiles.length > 0) {
      const gpxByName = new Map<string, GpsPoint[]>();
      for (const g of gpxFiles) {
        try {
          const text = await g.text(); // GPX files are small; safe to read fully
          const basename = g.name.split("/").pop() || g.name;
          gpxByName.set(basename, parseGpx(text));
        } catch (e) {
          result.errors.push(
            `Failed to read GPX ${g.name}: ${e instanceof Error ? e.message : String(e)}`
          );
        }
      }
      routesAttached = attachRoutes(result.workouts, gpxByName);
    }

    // TODO: Replace with actual user ID from auth
    const userId = "demo-user";

    const runs = result.workouts.map((workout) => workoutToRunData(workout, userId));

    // In production, save to database via Prisma:
    // const created = await prisma.run.createMany({ data: runs });

    return NextResponse.json({
      success: true,
      imported: runs.length,
      routesAttached,
      gpxProvided: gpxFiles.length,
      runs: runs.map((run, i) => ({
        ...run,
        id: `imported_${Date.now()}_${i}`,
        hasRoute: result.workouts[i].route.length > 0,
        routePoints: result.workouts[i].route.length,
      })),
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (e) {
    console.error("Apple Health import error:", e);
    return NextResponse.json(
      { error: "Failed to process file. Please try again." },
      { status: 500 }
    );
  }
}
