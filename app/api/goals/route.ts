import { browserStorageOnly } from "@/lib/api-storage";
import { NextResponse } from "next/server";

// GET /api/goals - Get all goals
export async function GET() {
  return NextResponse.json({ goals: [], total: 0, storage: "browser" });
}

// POST /api/goals - Create a new goal
export async function POST() {
  return browserStorageOnly();
}
