import { NextResponse } from "next/server";
import { CARS } from "@/data/cars";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const car = CARS.find((c) => c.id === params.id);
  if (!car) {
    return NextResponse.json({ error: "Car not found" }, { status: 404 });
  }
  return NextResponse.json(car);
}
