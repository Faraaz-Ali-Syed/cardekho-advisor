"use client";

import Link from "next/link";
import type { Car } from "@/lib/types";
import ShortlistButton from "./ShortlistButton";

export default function CarCard({ car }: { car: Car }) {
  const priceStr = `₹${car.priceLakhs.toFixed(2)} L`;
  const mileageLabel = car.fuel === "Electric" ? `${car.mileageKmpl} km/charge` : `${car.mileageKmpl} kmpl`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col">
      <div
        className="h-40 flex items-center justify-center text-white relative"
        style={{ background: `linear-gradient(135deg, ${car.imageColor}, ${car.imageColor}aa)` }}
      >
        <div className="absolute top-3 right-3">
          <ShortlistButton carId={car.id} />
        </div>
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider opacity-80">{car.make}</div>
          <div className="text-2xl font-bold">{car.model}</div>
          <div className="text-xs opacity-80">{car.variant}</div>
        </div>
        <div className="absolute bottom-3 left-3 bg-black/30 backdrop-blur text-white text-xs px-2 py-1 rounded">
          {car.bodyType}
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-baseline justify-between mb-2">
          <div className="text-lg font-bold">{priceStr}</div>
          <div className="text-xs text-slate-500">ex-showroom</div>
        </div>
        <div className="grid grid-cols-2 gap-y-1 text-xs text-slate-600 mb-3">
          <span>⛽ {car.fuel}</span>
          <span>🔁 {car.transmission}</span>
          <span>📊 {mileageLabel}</span>
          <span>👤 {car.seats} seats</span>
          <span>⭐ {car.rating.toFixed(1)} ({car.reviewsCount})</span>
          <span>🛡️ {car.safetyStars}★ safety</span>
        </div>
        <Link
          href={`/cars/${car.id}`}
          className="mt-auto inline-block text-center bg-slate-900 text-white text-sm py-2 rounded-md hover:bg-slate-700 transition"
        >
          View details
        </Link>
      </div>
    </div>
  );
}
