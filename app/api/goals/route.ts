import { NextRequest, NextResponse } from "next/server";
import { mockGoals } from "@/lib/mock-data";

// GET /api/goals - Get all goals
export async function GET() {
  return NextResponse.json({ goals: mockGoals, total: mockGoals.length });
}

// POST /api/goals - Create a new goal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { title, target, unit } = body;
    if (!title || !target || !unit) {
      return NextResponse.json(
        { error: "title, target, and unit are required" },
        { status: 400 }
      );
    }

    const newGoal = {
      id: `goal_${Date.now()}`,
      current: 0,
      status: "active",
      createdAt: new Date().toISOString(),
      ...body,
    };

    return NextResponse.json({ goal: newGoal }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
