# NYCrave

A mobile-first guide to New York City: where to eat, sip, shop, explore and take photos, plus a Design My Day itinerary planner.

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 · shadcn/ui · Motion · next-intl · Vitest

## Setup

Requires Node.js 20.9+.

```bash
npm install
cp .env.example .env.local   # optional in Phase 1
npm run dev                  # http://localhost:3000
```

| Script                            | What it does                             |
| --------------------------------- | ---------------------------------------- |
| `npm run dev`                     | Dev server                               |
| `npm run build` / `npm start`     | Production build and server              |
| `npm test`                        | Vitest (hours engine, search, seed data) |
| `npm run typecheck`               | Generates route types, then `tsc`        |
| `npm run lint` / `npm run format` | ESLint / Prettier                        |

## Environment variables

See [.env.example](.env.example). Nothing is required yet; keys unlock later phases (maps, Google Places, Supabase, the LLM planner). Keys without the `NEXT_PUBLIC_` prefix stay server-side.

## Adding and verifying places

Places live in `data/*.json`, one file per category. Every entry is validated against the zod schema in `types/place.ts` at build time, so a malformed entry fails the build with the exact field.

The seed entries are **placeholders** (`"Sample …"` names, `verified: false`). Replace them with real places:

1. Add an object to the right file. Required fields and allowed values are in `types/place.ts`.
2. Hours are `HH:MM` 24-hour ranges per weekday, in New York time. A close at or before the open time runs past midnight (`{ "open": "17:00", "close": "02:00" }`); `00:00`–`24:00` means open all day; `[]` means closed.
3. Keep `verified: false` and describe what still needs checking in `verificationNotes`.
4. Check the name, address, hours and prices against the business itself (its website, a call or a visit), then set `verified: true`, remove `verificationNotes` and update `updatedAt`.

Unverified places show an "Unverified" tag, are excluded from search indexes (`noindex`), and never emit schema.org data.

Do not copy data or reviews from Yelp, Google, TripAdvisor or Instagram. Review snippets come only from official APIs, with attribution (Phase 5). `editorialTake` is our own writing.

## Project layout

```
app/[locale]/   routes (home, eat, sip, explore, shop, photo-spots, parks, place/[slug], search, saved, my-day, tips)
components/     brand/ (LineBullet, SignBand, EmptyState) · layout/ · home/ · place/ · ui/ (shadcn)
lib/            hours.ts (NY-time open status) · search.ts (query parser) · places.ts (data access) · taxonomy.ts
types/place.ts  zod schemas and inferred types — source of truth for the data model
data/           seed JSON and neighborhoods
messages/       UI strings (en); add vi/es/zh/ko/ja files and list them in i18n/routing.ts
supabase/       schema.sql, mirrors types/place.ts
tests/          Vitest
```
