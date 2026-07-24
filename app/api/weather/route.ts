import { NextRequest, NextResponse } from "next/server";
import { mockWeatherHistory } from "@/lib/mock-data";

// GET /api/weather - Get weather records
export async function GET() {
  return NextResponse.json({
    weather: mockWeatherHistory,
    total: mockWeatherHistory.length,
    insights: {
      bestTemperatureRange: "27-30°C",
      worstConditions: "35°C+ with 80%+ humidity",
      avgTemperature: Math.round(
        mockWeatherHistory.reduce((s, w) => s + w.temperature, 0) / mockWeatherHistory.length
      ),
      avgHumidity: Math.round(
        mockWeatherHistory.reduce((s, w) => s + w.humidity, 0) / mockWeatherHistory.length
      ),
      avgAqi: Math.round(
        mockWeatherHistory.reduce((s, w) => s + w.aqi, 0) / mockWeatherHistory.length
      ),
    },
  });
}

// POST /api/weather - Log weather for a run
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { temperature, humidity, date } = body;
    if (temperature === undefined || humidity === undefined || !date) {
      return NextResponse.json(
        { error: "temperature, humidity, and date are required" },
        { status: 400 }
      );
    }

    const newRecord = {
      id: `weather_${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...body,
    };

    return NextResponse.json({ weather: newRecord }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
