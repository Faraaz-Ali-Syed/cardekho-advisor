"use client";

import { useEffect, useState } from "react";
import { isShortlisted, toggleShortlist } from "@/lib/shortlist";

export default function ShortlistButton({ carId }: { carId: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(isShortlisted(carId));
    sync();
    window.addEventListener("shortlist:changed", sync);
    return () => window.removeEventListener("shortlist:changed", sync);
  }, [carId]);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved(toggleShortlist(carId));
      }}
      className={`text-xs px-2 py-1 rounded-full transition ${
        saved
          ? "bg-white text-brand font-semibold shadow"
          : "bg-black/30 backdrop-blur text-white hover:bg-black/50"
      }`}
      title={saved ? "Remove from shortlist" : "Add to shortlist"}
    >
      {saved ? "★ Saved" : "☆ Shortlist"}
    </button>
  );
}
