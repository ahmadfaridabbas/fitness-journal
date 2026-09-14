import { NextResponse } from "next/server";
import { realRuns } from "@/lib/data/real-runs";
import { browserStorageOnly } from "@/lib/api-storage";
export async function GET() {
  const weather = realRuns
    .filter((r) => r.weather !== null)
    .map((r) => ({ date: r.date, ...r.weather }));
  return NextResponse.json({
    weather,
    total: weather.length,
    source: "Historical Apple Health readings; not a live forecast",
  });
}
export async function POST() {
  return browserStorageOnly();
}
