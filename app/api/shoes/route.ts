import { NextRequest, NextResponse } from "next/server";
import { mockShoes } from "@/lib/mock-data";

// GET /api/shoes - Get all shoes
export async function GET() {
  return NextResponse.json({ shoes: mockShoes, total: mockShoes.length });
}

// POST /api/shoes - Add a new shoe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { brand, model, purchaseDate } = body;
    if (!brand || !model || !purchaseDate) {
      return NextResponse.json(
        { error: "brand, model, and purchaseDate are required" },
        { status: 400 }
      );
    }

    const newShoe = {
      id: `shoe_${Date.now()}`,
      currentDistance: 0,
      expectedLifetime: 800,
      retireAt: 800,
      retired: false,
      createdAt: new Date().toISOString(),
      ...body,
    };

    return NextResponse.json({ shoe: newShoe }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}
