import { browserStorageOnly } from "@/lib/api-storage";
import { NextResponse } from "next/server";

// GET /api/measurements - Get all body measurements
export async function GET() {
  return NextResponse.json({
    measurements: [],
    storage: "browser",
    total: 0,
  });
}

// POST /api/measurements - Create a new measurement
export async function POST() {
  return browserStorageOnly();
}
