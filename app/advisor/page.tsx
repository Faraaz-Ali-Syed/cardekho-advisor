"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { AdvisorMessage, Car } from "@/lib/types";
import { toggleShortlist, isShortlisted } from "@/lib/shortlist";

type AssistantTurn = AdvisorMessage & {
  recommendations?: Array<{ carId: string; reason: string }>;
};

const SUGGESTED_PROMPTS = [
  "Budget under ₹12L, first car for city commute in Bangalore. Need good mileage.",
  "Family of 5 with two kids, ₹20L budget, weekend trips to hill stations, safety is top priority.",
  "I drive 2000 km a month for work, need a comfortable highway cruiser under ₹25L.",
  "Want an EV under ₹20L for daily office commute of 40km.",
];

export default function AdvisorPage() {
  const [messages, setMessages] = useState<AssistantTurn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [carMap, setCarMap] = useState<Record<string, Car>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/cars")
      .then((r) => r.json())
      .then((data: { cars: Car[] }) => {
        const map: Record<string, Car> = {};
        (data.cars || []).forEach((c) => (map[c.id] = c));
        setCarMap(map);
      });
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(prompt?: string) {
    const text = (prompt ?? input).trim();
    if (!text || loading) return;

    setError(null);
    const userMsg: AssistantTurn = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed: ${res.status}`);
      }
      const data = await res.json();
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content: data.reply,
          recommendations: data.recommendations || [],
        },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">AI Car Advisor</h1>
        <p className="text-sm text-slate-600">
          Answer a few questions and I&apos;ll shortlist 2-4 cars that actually fit your needs.
        </p>
      </div>

      <div
        ref={scrollRef}
        className="chat-scroll bg-white border border-slate-200 rounded-xl h-[520px] overflow-y-auto p-4 mb-3"
      >
        {messages.length === 0 && (
          <div className="text-center text-slate-500 py-6">
            <div className="text-4xl mb-3">🤖</div>
            <p className="font-medium mb-4">Tell me about what you&apos;re looking for.</p>
            <div className="grid gap-2 text-left max-w-md mx-auto">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="text-sm bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-2 text-slate-700 transition"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, idx) => (
          <div key={idx} className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-xl px-4 py-2 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-800"
              }`}
            >
              <Markdown text={m.content} />
              {m.recommendations && m.recommendations.length > 0 && (
                <div className="mt-3 space-y-2">
                  {m.recommendations.map((rec) => {
                    const car = carMap[rec.carId];
                    if (!car) return null;
                    return <RecCard key={rec.carId} car={car} reason={rec.reason} />;
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-slate-100 text-slate-500 rounded-xl px-4 py-2 text-sm">
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              </span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2"
      >
        <input
          className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          placeholder={messages.length === 0 ? "e.g. Family SUV under ₹18L, 5 seats, automatic…" : "Reply…"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-brand text-white text-sm px-4 py-2 rounded-md hover:bg-brand-dark disabled:opacity-50 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}

function RecCard({ car, reason }: { car: Car; reason: string }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setSaved(isShortlisted(car.id));
    const sync = () => setSaved(isShortlisted(car.id));
    window.addEventListener("shortlist:changed", sync);
    return () => window.removeEventListener("shortlist:changed", sync);
  }, [car.id]);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-500">{car.make}</div>
          <div className="font-semibold">
            {car.model} <span className="font-normal text-slate-600">{car.variant}</span>
          </div>
          <div className="text-xs text-slate-600 mt-0.5">
            ₹{car.priceLakhs.toFixed(2)}L · {car.fuel} · {car.transmission} · {car.seats} seats
          </div>
        </div>
        <button
          onClick={() => setSaved(toggleShortlist(car.id))}
          className={`text-xs px-2 py-1 rounded whitespace-nowrap ${
            saved ? "bg-brand text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          {saved ? "★ Saved" : "☆ Save"}
        </button>
      </div>
      <div className="text-xs text-slate-700 mt-2 italic">“{reason}”</div>
      <Link
        href={`/cars/${car.id}`}
        className="text-xs text-brand hover:underline mt-1 inline-block"
      >
        See full specs →
      </Link>
    </div>
  );
}

/** Tiny markdown-ish renderer: **bold** and \n only. Keeps the dep surface zero. */
function Markdown({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) {
          return <strong key={i}>{p.slice(2, -2)}</strong>;
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}
