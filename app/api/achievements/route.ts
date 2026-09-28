import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    achievements: [],
    unlocked: 0,
    inProgress: 0,
    total: 0,
    storage:
      "Milestones are calculated in the interface from bundled history and browser-saved workouts.",
  });
}
