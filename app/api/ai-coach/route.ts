import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json(
    {
      error:
        "AI coaching is not configured. Calculated training observations are available on the Training insights page.",
    },
    { status: 501 },
  );
}
