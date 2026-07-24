import { NextRequest, NextResponse } from "next/server";
import { parseAppleHealthXml, workoutToRunData } from "@/lib/apple-health/parser";

// POST /api/import/apple-health - Import Apple Health export.xml
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Please upload an export.xml file." },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.endsWith(".xml")) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload an XML file." },
        { status: 400 }
      );
    }

    // Read file content
    const xmlText = await file.text();

    if (!xmlText.includes("HealthData") && !xmlText.includes("Workout")) {
      return NextResponse.json(
        { error: "This does not appear to be an Apple Health export file." },
        { status: 400 }
      );
    }

    // Parse the XML
    const result = parseAppleHealthXml(xmlText);

    if (result.workouts.length === 0) {
      return NextResponse.json(
        {
          error: "No running workouts found in this export.",
          details: result.errors.length > 0 ? result.errors : undefined,
        },
        { status: 404 }
      );
    }

    // TODO: Replace with actual user ID from auth
    const userId = "demo-user";

    // Convert workouts to run data format
    const runs = result.workouts.map((workout) => workoutToRunData(workout, userId));

    // In production, save to database via Prisma:
    // const created = await prisma.run.createMany({ data: runs });

    return NextResponse.json({
      success: true,
      imported: runs.length,
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
