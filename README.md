# NYCrave

A mobile-first guide to New York City: where to eat, sip, shop, explore and take photos, plus a Design My Day itinerary planner.

Next.js 16 (App Router) · TypeScript strict · Tailwind CSS v4 · shadcn/ui · Motion · next-intl · Vitest

## Setup

Requires Node.js 20.9+.

```bash
npm install
cp .env.example .env.local   # optional
npm run dev                  # http://localhost:3000
```

| Script                            | What it does                          |
| --------------------------------- | ------------------------------------- |
| `npm run dev`                     | Dev server                            |
| `npm run build` / `npm start`     | Production build and server           |
| `npm test`                        | Vitest (hours, search, planner, data) |
| `npm run typecheck`               | Generates route types, then `tsc`     |
| `npm run lint` / `npm run format` | ESLint / Prettier                     |

## Environment variables

See [.env.example](.env.example). Nothing is required: without keys the site runs on the JSON seed with OpenStreetMap tiles. Keys without the `NEXT_PUBLIC_` prefix stay server-side.

| Key                                                         | Turns on                                                                                              |
| ----------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Reading places from Postgres instead of `data/*.json`                                                 |
| `SUPABASE_SERVICE_ROLE_KEY`                                 | Admin writes in production, and "Sync seed JSON to Supabase"                                          |
| `ADMIN_PASSWORD`                                            | The `/admin` page                                                                                     |
| `GOOGLE_PLACES_API_KEY`                                     | Google photos, rating and review snippets on places with a `googlePlaceId`, and hours import in admin |
| `ANTHROPIC_API_KEY`                                         | "Refine with AI" in Design My Day                                                                     |
| `NEXT_PUBLIC_MAPBOX_TOKEN`                                  | Mapbox tiles instead of OpenFreeMap                                                                   |

### Supabase

1. Run `supabase/schema.sql` in the Supabase SQL editor.
2. Set the three Supabase keys and `ADMIN_PASSWORD`, start the app, open `/admin` and press **Sync seed JSON to Supabase** (or add places there directly).

## Adding and verifying places

Use `/admin` (JSON editor with schema validation, Google import, verify toggle), or edit `data/*.json` by hand (one file per category). Every entry is validated against the zod schema in `types/place.ts`, so a malformed entry fails with the exact field. Without Supabase, `/admin` edits the JSON files in development and is read-only in production.

The seed entries are **placeholders** (`"Sample …"` names, `verified: false`). Replace them with real places:

1. Add the place. Required fields and allowed values are in `types/place.ts`.
2. Hours are `HH:MM` 24-hour ranges per weekday, in New York time. A close at or before the open time runs past midnight (`{ "open": "17:00", "close": "02:00" }`); `00:00`–`24:00` means open all day; `[]` means closed.
3. Keep `verified: false` and describe what still needs checking in `verificationNotes`.
4. Check the name, address, hours and prices against the business itself (its website, a call or a visit), then remove the TODO notes and mark it verified. Admin refuses to verify while TODO notes remain.

Unverified places show an "Unverified" tag, are excluded from search indexes (`noindex`), and never emit schema.org data.

Do not copy data or reviews from Yelp, Google, TripAdvisor or Instagram. Ratings, reviews and photos come only from the official Google Places API, shown with attribution. `editorialTake` is our own writing.

## Project layout

```
app/[locale]/   pages (home, eat, sip, explore, shop, photo-spots, parks, place/[slug], search, saved, my-day, tips, admin)
app/api/        my-day/ics, my-day/enhance (AI), places/photo (Google proxy)
components/     brand/ · layout/ · home/ · place/ · listing/ (filters) · map/ · planner/ · admin/ · ui/ (shadcn)
lib/            hours.ts (NY-time open status) · search.ts · places.ts (JSON or Supabase) · planner/ (Design My Day)
types/place.ts  zod schemas and inferred types — source of truth for the data model
data/           seed JSON and neighborhoods
messages/       UI strings (en); add vi/es/zh/ko/ja files and list them in i18n/routing.ts
supabase/       schema.sql, mirrors types/place.ts
tests/          Vitest
```
