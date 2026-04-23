# CarDekho Advisor

A small car-research web app that helps a confused buyer go from
**"I don't know what to buy"** to **"I'm confident about my shortlist"** — built as a take-home for CarDekho's AI-Native SWE role.

**Live:** https://cardekho-advisor.vercel.app
**Repo:** https://github.com/Faraaz-Ali-Syed/cardekho-advisor

Try the [AI Advisor](https://cardekho-advisor.vercel.app/advisor) — send something like *"family of 4, ₹18L, petrol auto, safety first"* and watch it ask 1-2 clarifying questions, then produce a shortlist of 2-4 real cars from the dataset with per-car reasoning.

---

## 1. What did you build and why? What did you deliberately cut?

### What I built

Three surfaces, all working end-to-end:

1. **AI Advisor** (`/advisor`) — a Claude-powered chat that does a short intake (budget, use case, fuel, family size), then returns a **shortlist of 2-4 cars** with a per-car reason tied to the user's stated needs. Recommendations render as inline cards inside the chat with one-tap "Save" + "See full specs".
2. **Browse catalog** (`/`) — 20-car Indian-market dataset (Maruti, Tata, Hyundai, Kia, Mahindra, Toyota, Honda, Skoda, VW, MG), filterable by price / fuel / body / seats / safety.
3. **Shortlist compare** (`/compare`) — side-by-side spec table of everything the user saved (via localStorage). Cars can be added from the catalog, a detail page, or directly from the AI advisor's recommendation cards.

### Why this scoping

The brief says "confused → confident shortlist." A confused buyer doesn't need **more filters** — CarDekho's real site already has those and they're often part of *why* people feel lost (too many knobs, no opinion). They need someone to ask the two questions that narrow the field and then commit to a recommendation.

So the highest-value thing I could build in 2-3 hours is an **opinionated conversational advisor that is grounded in the real catalog** — not a toy chatbot that invents cars, and not a filter page with a chat skin. Everything else (catalog, detail, compare) exists to *support* the advisor: it's where users go after they see a shortlist card and want to verify or compare.

A concrete example of the advisor doing useful work: asked for a petrol-automatic compact SUV under ₹14L with top safety, it correctly responds that **no such car exists in the catalog** and offers two honest compromises (stretch budget to the Nexon EV, or give up on automatic for 5-star safety). That's not something a filter UI ever does.

### What I deliberately cut

- **Auth / accounts** — the assignment is about shortlisting, not user management. Kills a big chunk of scope with zero value lost.
- **Real images** — colored gradient tiles in place of photos. Licensing real car images is out of scope and a visual distraction from the core AI feature.
- **User-generated reviews** — pros/cons are baked into the dataset as representative summaries. A review submission + moderation flow is a feature of its own.
- **Dealer / test-drive booking** — CarDekho has this but it's not on the "confused → confident" critical path.
- **EMI / financing calculator** — useful, but a pure filter-and-math feature that doesn't showcase AI.
- **Pagination / search-as-you-type** — 20 cars render in one viewport. No premature scaling.
- **Streaming advisor responses** — the chat waits for the full JSON before rendering. Fine for this scale; a known follow-up (see section 4).

---

## 2. What's your tech stack and why did you pick it?

| Choice | Why |
|---|---|
| **Next.js 14 App Router (TypeScript)** | One repo for frontend + backend. API routes are Node.js — no separate server process to manage. Server Components let the detail page ship zero JS for spec tables. Deploys to Vercel in one click. |
| **Tailwind CSS** | Fastest way to ship a clean, responsive UI in the time budget. No component library — ~400 LoC of hand-rolled primitives (`CarCard`, `FilterBar`, `Navbar`, `ShortlistButton`) keeps the bundle small and nothing feels generic. |
| **Anthropic SDK + `claude-sonnet-4-6`** | Sonnet is the right tier for a conversational advisor — smart enough to reason about tradeoffs ("3-star NCAP is a dealbreaker for a first-car buyer"), fast enough for chat latency. The **entire 20-car catalog is embedded in the system prompt** so Claude is grounded: it physically can't hallucinate cars not in our dataset, and I validate every returned `carId` server-side before replying (see `app/api/advisor/route.ts`). |
| **In-memory dataset** (`data/cars.ts`) | No DB — the dataset is 20 rows. A database would be pure ceremony for the time budget. If this scaled, I'd move to Postgres for car data and a vector store for review embeddings. |
| **localStorage for shortlist** | No auth = no user table = no "save across devices" requirement. localStorage + a custom `shortlist:changed` window event gives a reactive cross-tab experience with zero backend state. |
| **Vercel for deploy** | Native Next.js support, free tier, auto-redeploy on `git push`. Setting one env var (`ANTHROPIC_API_KEY`) is the entire deploy config. |

### Things I explicitly did NOT add

- No state management library (Zustand/Redux) — component state + localStorage is enough.
- No UI library (shadcn/Radix/Material) — Tailwind primitives only.
- No ORM — no DB to ORM against.
- No auth library — no user model.
- No testing framework — see section 4; if I had 4 more hours I would, but in 2-3 hours tests are ceremonial.

---

## 3. AI tools: what I delegated vs. did manually, what helped, what got in the way

This was built with **Claude Code (Claude Opus 4.7)** driving the build while I (the human) scoped and course-corrected. Here's the honest breakdown:

### Delegated to the AI agent

- **All boilerplate.** `tailwind.config.ts`, `tsconfig.json`, `postcss.config.mjs`, the layout shell, the localStorage helpers, navbar, filter dropdowns, compare table, detail page. This is ~70% of the line count and the part where I had no judgment to add.
- **The 20-car dataset.** Realistic Indian-market specs — prices in lakhs, NCAP ratings, correct transmission/body-type combos, pros/cons that read like actual owner complaints (e.g. *"fit-finish not as tight as Korean rivals"* for the Nexon). Faster to generate than to type, and cross-checkable against public sources if needed.
- **The conversational advisor runtime itself.** Claude Sonnet 4.6 is making the actual shortlisting decisions at request time based on user input — that's the product, not a delegation.

### Done manually / by explicit human decision

- **Product scoping.** The decision that the highest-value first build is a *conversational, grounded advisor* (not another filter UI) is the whole thesis of this submission. That's a product call, not a code generation task.
- **Grounding design.** I insisted the model receives the entire catalog as structured JSON in the system prompt, must output a specific JSON schema, and that every returned `carId` is validated server-side against the catalog before being sent to the client. This is what prevents hallucinated cars and makes every recommendation card actually clickable. I wrote the system prompt and the validator.
- **Conversation pacing.** The prompt instructs Claude to ask **1-2 clarifying questions only** when the first message is thin, then commit. I tightened this after early test runs where the model wanted to ask 4-5 questions before recommending — too much friction for a "confused buyer."
- **JSON parse hardening.** Added a cleaner for the case where the model occasionally wraps output in markdown fences despite being told not to. Small, common failure mode. `parseAdvisorJSON` handles it.
- **Deciding when to stop prompting and just write code.** Example: I wrote the filter-bar dropdown options by hand because enumerating `["Hatchback", "Sedan", "SUV", ...]` is faster than prompting for it.

### Where the tools helped most

- **Scaffolding speed.** Going from empty directory to working `npm run dev` would have taken 30-45 minutes manually (config files, next.js boilerplate, tailwind wiring). The agent did it in under 5.
- **Parallel file generation.** Writing the `data/cars.ts` file (20 cars × 15 fields) in one pass is tedious manual work and exactly what models are good at.
- **Keeping momentum.** The agent happily wrote the entire `/compare` page from a one-line spec, which let me stay focused on the advisor logic that actually matters.

### Where they got in the way

- **Over-qualifying.** Claude Sonnet's first advisor draft wanted to ask 4-5 clarifying questions ("and what's your preferred color? and your typical weekend use?"). Real users bail. I had to explicitly prompt the system to cap at 2 questions and commit. **Models don't calibrate product feel for you — you prompt for it.**
- **Version drift in generated `package.json`.** The agent picked `@anthropic-ai/sdk@0.30.1` and `next@14.2.15`; the Next version had a known security advisory. Harmless for a demo but a reminder that generated dependency choices need a human eye.
- **Instruction-following on JSON output.** The model occasionally wrapped JSON in ```` ```json ```` fences despite being told not to. Rather than keep prompting, I wrote a 3-line cleaner. Faster than convincing the model, and more reliable.
- **Occasional over-engineering.** The agent's first pass at the advisor route had full retry + exponential backoff logic for a single API call. Deleted — YAGNI for a take-home demo.

---

## 4. If I had another 4 hours

In priority order:

1. **Reviews ingestion + RAG.** Scrape/import real review text per car, chunk + embed, store in a vector DB (pgvector). Give the advisor a retrieval tool so it can cite actual owner quotes (*"3 of the last 20 Seltos reviews mention service issues in Tier-2 cities"*) instead of relying on baked-in summaries. This is the single biggest upgrade — it turns the advisor from "grounded in a spec sheet" to "grounded in lived experience."
2. **Streaming advisor responses.** Right now the chat waits for the full JSON before rendering. Stream the `reply` text as tokens, then materialize recommendation cards at the end. Chat UX feels ~2x better with partial output, and it's a small SDK change.
3. **AI tiebreaker on the compare page.** A "Help me decide" button that takes the 2-3 cars you've shortlisted plus your original advisor conversation and gives a decisive recommendation. Closes the loop on "confused → confident."
4. **Structured tool calls instead of JSON-in-text.** Swap the "respond with a JSON blob" prompt pattern for Anthropic's native tool-use API with a `recommend_cars` tool. More robust than string parsing, and I could also add a `search_catalog` tool so the model can filter/sort the catalog itself instead of being handed the whole thing in the system prompt — matters once the catalog grows past ~50 cars.
5. **Tests.** A handful of API route integration tests, especially around the grounding validator (ensure invented `carId`s are stripped) and the JSON parse fallback. The advisor endpoint is the part most likely to break silently.
6. **Dataset expansion + real images.** 20 → 200 cars with licensed images. Would also require pagination and server-side filtering.
7. **Observability.** Log every advisor call (input messages, output, latency, tokens) to a Vercel KV or Postgres table, with a simple admin view. Useful for catching regressions in advisor quality when iterating on the system prompt.

---

## Run it locally

Requires Node 18+ and an Anthropic API key.

```bash
git clone https://github.com/Faraaz-Ali-Syed/cardekho-advisor
cd cardekho-advisor
npm install
echo "ANTHROPIC_API_KEY=your_key_here" > .env.local
npm run dev
```

Open http://localhost:3000. First page load compiles routes on demand; give it 2-3 seconds on a cold start.

Production build:
```bash
npm run build && npm start
```

---

## Project layout

```
app/
  page.tsx                 home / catalog with filters
  advisor/page.tsx         AI chat (the main feature)
  compare/page.tsx         shortlist side-by-side
  cars/[id]/page.tsx       detail page (SSG'd at build time)
  api/cars/route.ts        list + filter
  api/cars/[id]/route.ts   single car
  api/advisor/route.ts     Claude-powered recommender with grounding + validation
components/
  Navbar.tsx  CarCard.tsx  FilterBar.tsx  ShortlistButton.tsx
data/cars.ts               20-car dataset (the source of truth)
lib/types.ts               Car, AdvisorMessage, AdvisorResponse types
lib/shortlist.ts           localStorage + custom-event shortlist store
```
