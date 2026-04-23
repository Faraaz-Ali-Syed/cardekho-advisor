"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getShortlist } from "@/lib/shortlist";

export default function Navbar() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(getShortlist().length);
    update();
    window.addEventListener("shortlist:changed", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("shortlist:changed", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const link = (href: string, label: string) => {
    const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
    return (
      <Link
        href={href}
        className={`px-3 py-2 rounded-md text-sm font-medium transition ${
          active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="inline-block w-8 h-8 rounded bg-brand text-white grid place-items-center font-bold">
            C
          </span>
          <span className="font-semibold text-slate-900">CarDekho Advisor</span>
        </Link>
        <nav className="flex items-center gap-1">
          {link("/", "Browse")}
          {link("/advisor", "AI Advisor")}
          <Link
            href="/compare"
            className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-200 relative"
          >
            Shortlist
            {count > 0 && (
              <span className="ml-1 inline-flex items-center justify-center text-xs bg-brand text-white rounded-full w-5 h-5">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
