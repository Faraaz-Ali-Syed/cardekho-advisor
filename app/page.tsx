"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Car } from "@/lib/types";
import CarCard from "@/components/CarCard";
import FilterBar, { emptyFilters, type Filters } from "@/components/FilterBar";

export default function HomePage() {
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cars")
      .then((r) => r.json())
      .then((data) => {
        setAllCars(data.cars || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cars = useMemo(() => {
    return allCars.filter((c) => {
      if (filters.maxPrice > 0 && c.priceLakhs > filters.maxPrice) return false;
      if (filters.fuel && c.fuel !== filters.fuel) return false;
      if (filters.bodyType && c.bodyType !== filters.bodyType) return false;
      if (filters.minSeats > 0 && c.seats < filters.minSeats) return false;
      if (filters.minSafety > 0 && c.safetyStars < filters.minSafety) return false;
      return true;
    });
  }, [allCars, filters]);

  return (
    <>
      <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-brand-dark text-white p-6 md:p-10 mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">
            Confused between cars? Let&apos;s fix that.
          </h1>
          <p className="text-slate-200 mb-5">
            Tell our AI advisor about your budget, your drive, your family — and walk away with a
            confident shortlist of 2-4 cars in under a minute.
          </p>
          <Link
            href="/advisor"
            className="inline-block bg-white text-brand font-semibold px-5 py-2.5 rounded-md hover:bg-slate-100 transition"
          >
            Talk to the AI Advisor →
          </Link>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 text-9xl flex items-center justify-center">
          🚗
        </div>
      </section>

      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-xl font-semibold">Browse the catalog</h2>
        <span className="text-sm text-slate-500">
          {loading ? "Loading…" : `${cars.length} of ${allCars.length} cars`}
        </span>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters(emptyFilters)}
      />

      {loading ? (
        <div className="py-16 text-center text-slate-500">Loading catalog…</div>
      ) : cars.length === 0 ? (
        <div className="py-16 text-center text-slate-500">
          No cars match those filters. Try relaxing them.
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {cars.map((c) => (
            <CarCard key={c.id} car={c} />
          ))}
        </div>
      )}
    </>
  );
}
