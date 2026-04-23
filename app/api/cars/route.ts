import { NextResponse } from "next/server";
import { CARS } from "@/data/cars";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const maxPrice = parseFloat(searchParams.get("maxPrice") || "0");
  const fuel = searchParams.get("fuel");
  const bodyType = searchParams.get("bodyType");
  const minSeats = parseInt(searchParams.get("minSeats") || "0", 10);
  const minSafety = parseInt(searchParams.get("minSafety") || "0", 10);

  let results = [...CARS];
  if (maxPrice > 0) results = results.filter((c) => c.priceLakhs <= maxPrice);
  if (fuel) results = results.filter((c) => c.fuel === fuel);
  if (bodyType) results = results.filter((c) => c.bodyType === bodyType);
  if (minSeats > 0) results = results.filter((c) => c.seats >= minSeats);
  if (minSafety > 0) results = results.filter((c) => c.safetyStars >= minSafety);

  return NextResponse.json({ cars: results, total: results.length });
}
