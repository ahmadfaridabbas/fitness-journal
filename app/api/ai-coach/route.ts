import { NextRequest, NextResponse } from "next/server";

// POST /api/ai-coach - Get AI coaching for a run
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { distance, duration, avgHeartRate, temperature, humidity } = body;

    if (!distance || !duration) {
      return NextResponse.json(
        { error: "distance and duration are required" },
        { status: 400 }
      );
    }

    // In production, this would call OpenAI API
    // For now, generate mock analysis
    const pace = duration / distance;
    const isEasy = avgHeartRate ? avgHeartRate < 145 : pace > 6.5;
    const isHot = temperature ? temperature > 32 : false;
    const isHumid = humidity ? humidity > 75 : false;

    let analysis = "";
    let coachScore = 8.5;
    let trainingLoad = "moderate";
    let recoveryScore = 8.0;

    if (isEasy) {
      analysis = `Good aerobic run. `;
      coachScore = 9.5;
      trainingLoad = "easy";
      recoveryScore = 9.5;
    } else {
      analysis = `Solid effort. `;
      coachScore = 9.0;
    }

    if (isHot) {
      analysis += `Temperature was ${temperature}°C — hot conditions. `;
    }
    if (isHumid) {
      analysis += `Humidity at ${humidity}% increased cardiac stress. `;
    }
    if (avgHeartRate) {
      analysis += `Average HR was ${avgHeartRate} bpm. `;
      if (avgHeartRate < 140) {
        analysis += `Excellent zone 2 running. `;
        coachScore += 0.3;
      }
    }

    analysis += `Recovery score: ${recoveryScore}/10.`;

    const recommendation = isEasy
      ? "You can run again tomorrow. Consider a moderate effort."
      : "Take a recovery day or easy run tomorrow.";

    return NextResponse.json({
      analysis,
      coachScore: Math.min(10, coachScore),
      trainingLoad,
      recoveryScore,
      recommendation,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
