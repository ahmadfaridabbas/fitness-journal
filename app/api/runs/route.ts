import { NextRequest, NextResponse } from "next/server";
import { allRuns as mockRuns } from "@/lib/mock-data";

// GET /api/runs - Get all runs
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sortBy = searchParams.get("sortBy") || "date";
  const limit = parseInt(searchParams.get("limit") || "50");

  let runs = [...mockRuns];

  // Sort
  if (sortBy === "distance") {
    runs.sort((a, b) => b.distance - a.distance);
  } else if (sortBy === "pace") {
    runs.sort((a, b) => a.pace - b.pace);
  } else {
    runs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Limit
  runs = runs.slice(0, limit);

  return NextResponse.json({ runs, total: mockRuns.length });
}

// POST /api/runs - Create a new run
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const { date, distance, duration } = body;
    if (!date || !distance || !duration) {
      return NextResponse.json(
        { error: "date, distance, and duration are required" },
        { status: 400 }
      );
    }

    // In production, this would save to database via Prisma
    const newRun = {
      id: `run_${Date.now()}`,
      pace: duration / distance,
      calories: Math.round(distance * 76 * 1.036), // estimate
      createdAt: new Date().toISOString(),
      ...body,
    };

    return NextResponse.json({ run: newRun }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
