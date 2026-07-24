import { NextResponse } from "next/server";
import { mockAchievements } from "@/lib/mock-data";

// GET /api/achievements - Get all achievements
export async function GET() {
  const unlocked = mockAchievements.filter((a) => a.dateUnlocked);
  const inProgress = mockAchievements.filter((a) => !a.dateUnlocked);

  return NextResponse.json({
    achievements: mockAchievements,
    unlocked: unlocked.length,
    inProgress: inProgress.length,
    total: mockAchievements.length,
  });
}
