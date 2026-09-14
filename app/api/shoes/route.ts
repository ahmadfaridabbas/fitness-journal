import { browserStorageOnly } from "@/lib/api-storage";
import { NextResponse } from "next/server";
import { mockShoes } from "@/lib/mock-data";

// GET /api/shoes - Get all shoes
export async function GET() {
  return NextResponse.json({
    shoes: mockShoes,
    total: mockShoes.length,
    source: "unverified legacy footwear reference",
  });
}

// POST /api/shoes - Add a new shoe
export async function POST() {
  return browserStorageOnly();
}
