import { NextRequest, NextResponse } from "next/server";
import { parseHealthFiles } from "@/lib/apple-health/import-files";
// Apple Health exports can be very large (hundreds of MB). Run on Node.js and
// allow a long processing window.
export const runtime = "nodejs";
export const maxDuration = 300; // seconds
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const exportFile = formData.get("exportFile") as File | null;
    const gpxFiles = formData.getAll("gpxFiles") as File[];

    if (!(exportFile instanceof File)) {
      return NextResponse.json(
        {
          error:
            "No export.xml file provided. Please upload your Apple Health export.",
        },
        { status: 400 },
      );
    }

    if (!exportFile.name.endsWith(".xml")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an XML file." },
        { status: 400 },
      );
    }

    let merged;
    try {
      merged = await parseHealthFiles(exportFile, gpxFiles);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Could not read the health export.",
        },
        { status: 422 },
      );
    }

    // Summary stats
    const stats = {
      totalRuns: merged.length,
      withHeartRate: merged.filter((r) => r.avgHeartRate).length,
      withRoutes: merged.filter((r) => r.routeData).length,
      withWeather: merged.filter((r) => r.weather).length,
      withCadence: merged.filter((r) => r.cadence).length,
      withPower: merged.filter((r) => r.avgPower).length,
      totalDistance:
        Math.round(merged.reduce((s, r) => s + r.distance, 0) * 10) / 10,
      dateRange: {
        from: merged.length > 0 ? merged[merged.length - 1].date : null,
        to: merged.length > 0 ? merged[0].date : null,
      },
    };

    return NextResponse.json({ success: true, stats, runs: merged });
  } catch (e) {
    console.error("Import error:", e);
    return NextResponse.json(
      {
        error: `Import failed: ${e instanceof Error ? e.message : "Unknown error"}`,
      },
      { status: 500 },
    );
  }
}
