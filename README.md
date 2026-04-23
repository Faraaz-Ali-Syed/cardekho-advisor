# CarDekho Advisor

A small car-research web app that helps a confused buyer go from
**"I don't know what to buy"** to **"I'm confident about my shortlist"** — built as a take-home for CarDekho's AI-Native SWE role.

## What it does

Three surfaces, all working end-to-end:

1. **AI Advisor** (`/advisor`) — a Claude-powered chat that does a short intake (budget, use case, fuel, family size) then returns a **shortlist of 2-4 cars** with a per-car reason tied to the user's stated needs. Recommendations render as inline cards inside the chat with one-tap save + "See full specs".
2. **Browse catalog** (`/`) — 20-car Indian-market dataset (Maruti, Tata, Hyundai, Kia, Mahindra, Toyota, Honda, Skoda, VW, MG), filterable by price / fuel / body / seats / safety. Click any car for the detail page.
3. **Shortlist compare** (`/compare`) — side-by-side spec table of everything the user saved (via localStorage). Cars can be added from the catalog, from a detail page, or directly from the AI advisor's recommendation cards.

## Run it

Requires Node 18+ and an Anthropic API key.

```bash
npm install
# .env.local already has the ANTHROPIC_API_KEY the assignment provided — replace it with your own
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). First page load compiles routes on demand; give it 2–3 seconds on a cold start.

Production build:
```bash
npm run build && npm start
```

## Tech stack & why

| Choice | Why |
|---|---|
| **Next.js 14 App Router (TypeScript)** | Single repo for frontend + backend. API routes are Node.js — no separate server process to manage. Server Components let the detail page ship zero JS for spec tables. |
| **Tailwind CSS** | Fastest way to ship a clean, responsive UI in the time budget. No component library — ~400 LoC of hand-rolled primitives (CarCard, FilterBar, Navbar, ShortlistButton) keeps the bundle small. |
| **Anthropic SDK + `claude-sonnet-4-6`** | Sonnet is the right tier for a conversational advisor — smart enough to reason about tradeoffs (e.g. "3-star NCAP is a dealbreaker for a first-car buyer"), fast enough for chat. The whole 20-car catalog is embedded in the system prompt so Claude is grounded: it physically can't hallucinate cars not in our dataset, and I validate every returned `carId` server-side before replying. |
| **In-memory dataset** (`data/cars.ts`) | No DB — the dataset is 20 rows. A database would be pure ceremony for the time budget. If this scaled, I'd move to Postgres or a vector store for reviews. |
| **localStorage for shortlist** | No auth = no user table = no "save across devices" requirement. localStorage + a custom `shortlist:changed` window event gives a reactive cross-tab experience with zero backend state. |

## What I deliberately cut

- **Auth / accounts** — the assignment is about shortlisting, not user management. Kills a huge chunk of scope.
- **Real images** — colored gradient tiles in place of photos. Licensing real car images is out of scope and a distraction from the core value.
- **User-generated reviews** — pros/cons are baked into the dataset as representative summaries. Building a review submission + moderation flow is a feature of its own.
- **Dealer/test-drive booking** — CarDekho has this but it's not on the "confused → confident" critical path.
- **EMI / financing calculator** — would be useful but a pure filter-and-math feature that doesn't showcase AI.
- **Pagination / search-as-you-type** — 20 cars renders in one viewport. No premature scaling.
- **Next.js patched security version** — got a warning for 14.2.15. For a demo that's fine; a production deploy should bump to latest 14.x patched release.

## AI delegation vs. manual work

**Delegated to Claude Code (the agent driving this build):**
- All boilerplate: tailwind/tsconfig/postcss configs, layout shell, shortlist localStorage helpers, navbar, filter dropdowns, compare table, detail page. This is ~70% of the line count and the part where AI has no judgment to add.
- The conversational advisor *runtime* — Claude Sonnet is making the actual shortlisting decisions based on user input at request time.
- Typing out the 20-car dataset with realistic specs for the Indian market (prices in lakhs, NCAP ratings, correct transmission/body-type combos, pros/cons that read like real owner complaints).

**Done manually / by explicit decision:**
- **Product scoping.** The decision that the *highest-value first build* is a conversational intake → grounded shortlist (not yet another filter UI) is the whole thesis. A buyer lost in 200 SUVs doesn't need more filters; they need someone to ask the two questions that narrow the field.
- **Grounding design.** I insisted the model receives the entire catalog as structured JSON in the system prompt, must output a specific JSON schema, and that every returned `carId` is validated server-side against the catalog before being sent to the client. This is what prevents hallucinated cars and makes the recommendations actually clickable.
- **State-of-conversation logic.** The prompt instructs Claude to ask 1–2 clarifying questions only when the first message is too thin, then commit to a shortlist — not to drag out the chat. Verified with two live curl round-trips during the build.
- **JSON parse hardening.** Added a cleaner for the case where the model wraps output in markdown fences despite the instruction (small, common failure mode). `parseAdvisorJSON` handles it.

**Where AI tools got in the way:**
- The SDK version I picked initially (`@anthropic-ai/sdk@0.30.1`) threw a deprecation warning about `next@14.2.15`'s security advisory — nothing to do with the SDK itself, but a reminder that generated `package.json` choices need a human eye on versions.
- Model occasionally wanted to "be thorough" and ask 4–5 clarifying questions; I tightened the system prompt to cap it at 2 and commit to a shortlist once budget + use-case are known. This kind of product calibration is not something the model does for you — you have to prompt for it.

## If I had another 4 hours

1. **Reviews ingestion pipeline.** Scrape/import real review text, chunk + embed, store in a vector DB. Give the advisor a retrieval tool so it can cite actual owner quotes ("3 of the last 20 Seltos reviews mention service issues") instead of relying on the baked-in pros/cons list.
2. **Streaming advisor responses.** Right now the chat waits for the full JSON before rendering. Stream the `reply` text and materialize recommendation cards at the end — chat UX improves a lot with partial output.
3. **AI tiebreaker on the compare page.** "You've shortlisted Creta vs Seltos — here's the decision based on your advisor conversation" button that reuses the advisor with the compare context.
4. **Dataset expansion + real images.** 20 cars → 200, with licensed images. Probably paginated + server-side filtering once the dataset grows.
5. **Test coverage.** A handful of API route integration tests (advisor schema validation, filter combinations, 404s). The grounding validation deserves tests especially.
6. **Deploy to Vercel.** One `vercel deploy`, set `ANTHROPIC_API_KEY` in project env, done. Skipped here to stay inside the time-box and because the local dev setup is already single-command.

## Project layout

```
app/
  page.tsx                 home / catalog with filters
  advisor/page.tsx         AI chat (the main feature)
  compare/page.tsx         shortlist side-by-side
  cars/[id]/page.tsx       detail page (SSG'd at build time)
  api/cars/route.ts        list + filter
  api/cars/[id]/route.ts   single car
  api/advisor/route.ts     Claude-powered recommender
components/
  Navbar.tsx  CarCard.tsx  FilterBar.tsx  ShortlistButton.tsx
data/cars.ts               20-car dataset (the source of truth)
lib/types.ts               Car, AdvisorMessage, AdvisorResponse types
lib/shortlist.ts           localStorage + custom-event shortlist store
```

## Security note

The `.env.local` in this repo contains the API key that came with the assignment. **Rotate it** before committing the repo publicly, or delete `.env.local` and provide your own.
