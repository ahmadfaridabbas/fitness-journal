import { browserStorageOnly } from "@/lib/api-storage";
import { NextRequest, NextResponse } from "next/server";
import { allRuns as mockRuns } from "@/lib/mock-data";

// GET /api/runs - Get all runs
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sortBy = searchParams.get("sortBy") || "date";
  const requestedLimit = Number(searchParams.get("limit") || "50");
  const limit = Number.isFinite(requestedLimit)
    ? Math.max(0, Math.min(1000, Math.floor(requestedLimit)))
    : 50;

  let runs = [...mockRuns];

  // Sort
  if (sortBy === "distance") {
    runs.sort((a, b) => b.distance - a.distance);
  } else if (sortBy === "pace") {
    runs.sort((a, b) => a.pace - b.pace);
  } else {
    runs.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  // Limit
  runs = runs.slice(0, limit);

  return NextResponse.json({
    runs,
    total: mockRuns.length,
    source: "bundled Apple Health history",
    storage: "browser edits are available in the interface",
  });
}

// POST /api/runs - Create a new run
export async function POST() {
  return browserStorageOnly();
}
