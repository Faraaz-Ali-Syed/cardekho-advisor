import { notFound } from "next/navigation";
import Link from "next/link";
import { CARS } from "@/data/cars";
import ShortlistButton from "@/components/ShortlistButton";

export function generateStaticParams() {
  return CARS.map((c) => ({ id: c.id }));
}

export default function CarDetailPage({ params }: { params: { id: string } }) {
  const car = CARS.find((c) => c.id === params.id);
  if (!car) notFound();

  const mileageLabel = car.fuel === "Electric" ? `${car.mileageKmpl} km/charge` : `${car.mileageKmpl} kmpl`;

  const specs: Array<[string, string]> = [
    ["Body type", car.bodyType],
    ["Ex-showroom price", `₹${car.priceLakhs.toFixed(2)} Lakh`],
    ["Fuel type", car.fuel],
    ["Transmission", car.transmission],
    ["Mileage", mileageLabel],
    ["Seats", String(car.seats)],
    ["Engine", car.engineCc === 0 ? "Electric" : `${car.engineCc} cc`],
    ["Power", `${car.power} bhp`],
    ["Safety rating", `${car.safetyStars}★ Global NCAP`],
    ["Boot space", `${car.bootLitres} L`],
    ["User rating", `${car.rating}/5 (${car.reviewsCount} reviews)`],
  ];

  return (
    <div>
      <Link href="/" className="text-sm text-slate-600 hover:underline">
        ← Back to catalog
      </Link>

      <div
        className="rounded-2xl mt-4 p-8 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${car.imageColor}, ${car.imageColor}bb)` }}
      >
        <div className="absolute top-4 right-4">
          <ShortlistButton carId={car.id} />
        </div>
        <div className="text-sm uppercase tracking-widest opacity-80">{car.make}</div>
        <h1 className="text-4xl font-bold">{car.model}</h1>
        <div className="text-lg opacity-90">{car.variant}</div>
        <div className="mt-4 inline-block bg-white/20 px-3 py-1 rounded text-sm">{car.bodyType}</div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold mb-3">Specifications</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {specs.map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-slate-100 py-1.5">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-900 text-right">{value}</dd>
              </div>
            ))}
          </dl>

          <h2 className="font-semibold mt-6 mb-2">Features</h2>
          <div className="flex flex-wrap gap-2">
            {car.features.map((f) => (
              <span key={f} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                {f}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-green-800 mb-2">👍 What owners love</h3>
            <ul className="text-sm text-green-900 space-y-1 list-disc list-inside">
              {car.pros.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-amber-800 mb-2">👎 Common complaints</h3>
            <ul className="text-sm text-amber-900 space-y-1 list-disc list-inside">
              {car.cons.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
