"use client";

export type Filters = {
  maxPrice: number;
  fuel: string;
  bodyType: string;
  minSeats: number;
  minSafety: number;
};

export const emptyFilters: Filters = {
  maxPrice: 0,
  fuel: "",
  bodyType: "",
  minSeats: 0,
  minSafety: 0,
};

const FUEL_OPTIONS = ["", "Petrol", "Diesel", "CNG", "Electric", "Hybrid"];
const BODY_OPTIONS = ["", "Hatchback", "Sedan", "SUV", "Compact SUV", "MUV"];

export default function FilterBar({
  filters,
  onChange,
  onReset,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  onReset: () => void;
}) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 grid gap-3 md:grid-cols-6">
      <label className="text-xs text-slate-600 flex flex-col">
        Max price
        <select
          className="mt-1 border rounded px-2 py-1 text-sm"
          value={filters.maxPrice}
          onChange={(e) => set("maxPrice", parseFloat(e.target.value))}
        >
          <option value={0}>Any</option>
          <option value={10}>Under ₹10L</option>
          <option value={15}>Under ₹15L</option>
          <option value={20}>Under ₹20L</option>
          <option value={30}>Under ₹30L</option>
        </select>
      </label>

      <label className="text-xs text-slate-600 flex flex-col">
        Fuel
        <select
          className="mt-1 border rounded px-2 py-1 text-sm"
          value={filters.fuel}
          onChange={(e) => set("fuel", e.target.value)}
        >
          {FUEL_OPTIONS.map((f) => (
            <option key={f} value={f}>
              {f || "Any"}
            </option>
          ))}
        </select>
      </label>

      <label className="text-xs text-slate-600 flex flex-col">
        Body type
        <select
          className="mt-1 border rounded px-2 py-1 text-sm"
          value={filters.bodyType}
          onChange={(e) => set("bodyType", e.target.value)}
        >
          {BODY_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b || "Any"}
            </option>
          ))}
        </select>
      </label>

      <label className="text-xs text-slate-600 flex flex-col">
        Min seats
        <select
          className="mt-1 border rounded px-2 py-1 text-sm"
          value={filters.minSeats}
          onChange={(e) => set("minSeats", parseInt(e.target.value, 10))}
        >
          <option value={0}>Any</option>
          <option value={5}>5+</option>
          <option value={6}>6+</option>
          <option value={7}>7+</option>
        </select>
      </label>

      <label className="text-xs text-slate-600 flex flex-col">
        Min safety
        <select
          className="mt-1 border rounded px-2 py-1 text-sm"
          value={filters.minSafety}
          onChange={(e) => set("minSafety", parseInt(e.target.value, 10))}
        >
          <option value={0}>Any</option>
          <option value={3}>3★+</option>
          <option value={4}>4★+</option>
          <option value={5}>5★</option>
        </select>
      </label>

      <div className="flex items-end">
        <button
          onClick={onReset}
          className="w-full text-sm text-slate-600 border border-slate-300 rounded py-1 hover:bg-slate-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
