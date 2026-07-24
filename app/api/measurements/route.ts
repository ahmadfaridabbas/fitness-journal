import { NextRequest, NextResponse } from "next/server";
import { mockBodyMeasurements } from "@/lib/mock-data";

// GET /api/measurements - Get all body measurements
export async function GET() {
  return NextResponse.json({
    measurements: mockBodyMeasurements,
    total: mockBodyMeasurements.length,
  });
}

// POST /api/measurements - Create a new measurement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { date, weight } = body;
    if (!date || !weight) {
      return NextResponse.json(
        { error: "date and weight are required" },
        { status: 400 }
      );
    }

    const newMeasurement = {
      id: `measurement_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...body,
    };

    return NextResponse.json({ measurement: newMeasurement }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
