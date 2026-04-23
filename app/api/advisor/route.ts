import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CARS } from "@/data/cars";
import type { AdvisorMessage } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Compact catalog representation — keeps the prompt small while preserving
// the fields the model needs to reason about matches.
function catalogForPrompt() {
  return CARS.map((c) => ({
    id: c.id,
    name: `${c.make} ${c.model} ${c.variant}`,
    body: c.bodyType,
    priceLakhs: c.priceLakhs,
    fuel: c.fuel,
    transmission: c.transmission,
    mileage: c.mileageKmpl,
    seats: c.seats,
    power: c.power,
    safety: c.safetyStars,
    boot: c.bootLitres,
    rating: c.rating,
    pros: c.pros,
    cons: c.cons,
  }));
}

const SYSTEM_PROMPT = `You are an expert car advisor for CarDekho, a leading Indian car research platform. Your job is to help a confused buyer go from "I don't know what to buy" to a confident shortlist of 2-4 cars.

You MUST only recommend cars from the provided catalog. Never invent cars or specs.

Conversation approach:
- On the FIRST turn, if the user has not given enough signal, ask 1-2 focused clarifying questions. Typical gaps: budget (in lakhs INR), primary use (city commute / family / highway / off-road), fuel preference, must-have features, seat requirement.
- Once you have at least budget + rough use-case, produce a shortlist. Don't drag out the conversation.
- When you recommend, explain WHY each car fits this specific user — reference their stated needs. Be concrete about tradeoffs.
- Keep replies under ~150 words. Indian buyer context: prices in lakhs, distances in km, mileage in kmpl.

Output format — ALWAYS respond with a single JSON object, no prose outside it, no markdown fences:
{
  "reply": "Your conversational message to the user (markdown ok inside the string — use **bold** and line breaks \\n).",
  "recommendations": [
    { "carId": "<id from catalog>", "reason": "1-2 sentence reason tied to user's needs" }
  ]
}

Rules for recommendations:
- Empty array [] when you are still asking clarifying questions.
- 2-4 items once you have enough signal to shortlist.
- carId MUST exactly match an id from the catalog.
- Order from best match to backup option.

Catalog (authoritative — only recommend from these):
${JSON.stringify(catalogForPrompt())}`;

function parseAdvisorJSON(raw: string) {
  // Model sometimes wraps in ```json fences despite the instruction — strip them.
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) throw new Error("no JSON object in response");
  const obj = JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  if (typeof obj.reply !== "string") throw new Error("missing reply field");
  if (!Array.isArray(obj.recommendations)) obj.recommendations = [];
  // Drop any recommendations whose carId doesn't exist in our catalog.
  const validIds = new Set(CARS.map((c) => c.id));
  obj.recommendations = obj.recommendations.filter(
    (r: { carId?: string }) => r.carId && validIds.has(r.carId)
  );
  return obj;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages: AdvisorMessage[] = Array.isArray(body.messages) ? body.messages : [];

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY not configured on server" },
        { status: 500 }
      );
    }
    if (messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "empty model response" }, { status: 502 });
    }

    const parsed = parseAdvisorJSON(textBlock.text);
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("[advisor] error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
