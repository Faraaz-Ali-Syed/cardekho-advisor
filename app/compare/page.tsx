"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Car } from "@/lib/types";
import { clearShortlist, getShortlist, toggleShortlist } from "@/lib/shortlist";

export default function ComparePage() {
  const [ids, setIds] = useState<string[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const current = getShortlist();
      setIds(current);
      if (current.length === 0) {
        setCars([]);
        setLoading(false);
        return;
      }
      const results = await Promise.all(
        current.map((id) =>
          fetch(`/api/cars/${id}`).then((r) => (r.ok ? r.json() : null))
        )
      );
      setCars(results.filter(Boolean) as Car[]);
      setLoading(false);
    };
    load();
    window.addEventListener("shortlist:changed", load);
    return () => window.removeEventListener("shortlist:changed", load);
  }, []);

  if (loading) {
    return <div className="py-16 text-center text-slate-500">Loading your shortlist…</div>;
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-3">📋</div>
        <h1 className="text-xl font-semibold mb-2">Your shortlist is empty</h1>
        <p className="text-slate-600 mb-5">
          Browse cars and tap ☆ Shortlist to save them here — or let the AI Advisor suggest picks.
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/" className="px-4 py-2 bg-slate-900 text-white rounded-md text-sm">
            Browse catalog
          </Link>
          <Link href="/advisor" className="px-4 py-2 bg-brand text-white rounded-md text-sm">
            Ask the AI Advisor
          </Link>
        </div>
      </div>
    );
  }

  const rows: Array<[string, (c: Car) => string]> = [
    ["Price", (c) => `₹${c.priceLakhs.toFixed(2)} L`],
    ["Body", (c) => c.bodyType],
    ["Fuel", (c) => c.fuel],
    ["Transmission", (c) => c.transmission],
    [
      "Mileage",
      (c) => (c.fuel === "Electric" ? `${c.mileageKmpl} km/charge` : `${c.mileageKmpl} kmpl`),
    ],
    ["Seats", (c) => String(c.seats)],
    ["Engine", (c) => (c.engineCc === 0 ? "Electric" : `${c.engineCc} cc`)],
    ["Power", (c) => `${c.power} bhp`],
    ["Safety", (c) => `${c.safetyStars}★`],
    ["Boot", (c) => `${c.bootLitres} L`],
    ["User rating", (c) => `${c.rating}/5`],
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Your shortlist</h1>
          <p className="text-sm text-slate-600">
            {cars.length} {cars.length === 1 ? "car" : "cars"} — compare side-by-side
          </p>
        </div>
        <button
          onClick={clearShortlist}
          className="text-xs text-slate-600 border border-slate-300 rounded px-3 py-1.5 hover:bg-slate-50"
        >
          Clear all
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left font-medium text-slate-500 p-3 border-b border-slate-200 w-40">
                Spec
              </th>
              {cars.map((c) => (
                <th
                  key={c.id}
                  className="p-3 border-b border-slate-200 text-left min-w-[180px]"
                >
                  <div
                    className="inline-block w-3 h-3 rounded-full mr-2 align-middle"
                    style={{ background: c.imageColor }}
                  />
                  <Link href={`/cars/${c.id}`} className="font-semibold hover:underline">
                    {c.make} {c.model}
                  </Link>
                  <div className="text-xs text-slate-500 font-normal mt-0.5">{c.variant}</div>
                  <button
                    onClick={() => toggleShortlist(c.id)}
                    className="text-xs text-red-600 hover:underline mt-1"
                  >
                    Remove
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, fn]) => (
              <tr key={label} className="border-b border-slate-100 last:border-0">
                <td className="p-3 text-slate-500">{label}</td>
                {cars.map((c) => (
                  <td key={c.id} className="p-3 font-medium text-slate-900">
                    {fn(c)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-b border-slate-100 last:border-0">
              <td className="p-3 text-slate-500 align-top">Pros</td>
              {cars.map((c) => (
                <td key={c.id} className="p-3 text-xs text-slate-700 align-top">
                  <ul className="list-disc list-inside space-y-1">
                    {c.pros.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 text-slate-500 align-top">Cons</td>
              {cars.map((c) => (
                <td key={c.id} className="p-3 text-xs text-slate-700 align-top">
                  <ul className="list-disc list-inside space-y-1">
                    {c.cons.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Not sure which of these to pick?{" "}
        <Link href="/advisor" className="text-brand underline">
          Ask the AI advisor for a tiebreaker
        </Link>
        .
      </p>
    </div>
  );
}
