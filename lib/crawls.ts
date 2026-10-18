import type { LineColor } from "@/lib/lines"
import { walkMinutes } from "@/lib/planner/estimates"
import type { Place } from "@/types/place"

/**
 * Food and drink crawls: three or four places for one craving, a short walk
 * apart. Built from the place data: start from each matching place, keep
 * walking to the nearest match, and keep the route that fits the most stops
 * with the least walking. A second, separate crawl is found the same way.
 */

export type CrawlKey =
  "pizza" | "dumplings" | "noodles" | "bagels" | "bakeries" | "tacos" | "coffee" | "cocktails"

type CrawlPlace = Pick<
  Place,
  "slug" | "lat" | "lng" | "neighborhood" | "category" | "dishTypes" | "drinkTypes"
>

export type CrawlKind = {
  key: CrawlKey
  emoji: string
  line: LineColor
  matches: (p: CrawlPlace) => boolean
}

const dish =
  (...types: NonNullable<Place["dishTypes"]>) =>
  (p: CrawlPlace) =>
    p.category === "restaurant" && (p.dishTypes ?? []).some((d) => types.includes(d))
const drink =
  (...types: NonNullable<Place["drinkTypes"]>) =>
  (p: CrawlPlace) =>
    p.category === "drink" && (p.drinkTypes ?? []).some((d) => types.includes(d))

export const CRAWL_KINDS: CrawlKind[] = [
  { key: "pizza", emoji: "🍕", line: "red", matches: dish("pizza") },
  { key: "dumplings", emoji: "🥟", line: "orange", matches: dish("dumplings") },
  {
    key: "noodles",
    emoji: "🍜",
    line: "yellow",
    matches: dish("ramen", "noodle_soup", "dry_noodles"),
  },
  { key: "bagels", emoji: "🥯", line: "brown", matches: dish("bagels") },
  { key: "bakeries", emoji: "🥐", line: "purple", matches: dish("bakery", "desserts") },
  { key: "tacos", emoji: "🌮", line: "lime", matches: dish("tacos") },
  { key: "coffee", emoji: "☕", line: "brown", matches: drink("coffee") },
  { key: "cocktails", emoji: "🍸", line: "blue", matches: drink("cocktails") },
]

export const MIN_STOPS = 3
const MAX_STOPS = 4
/** The longest walk between two stops. */
export const MAX_LEG = 20

export type Crawl<P> = {
  kind: CrawlKind
  stops: { place: P; walk: number }[]
  walkMinutes: number
  /** The neighborhoods it passes through, most stops first. */
  areas: string[]
}

function routeFrom<P extends CrawlPlace>(seed: P, pool: P[]) {
  const stops = [{ place: seed, walk: 0 }]
  const left = new Set(pool.filter((p) => p !== seed))
  while (stops.length < MAX_STOPS) {
    const here = stops.at(-1)!.place
    let next: P | undefined
    let best = Infinity
    for (const p of left) {
      const w = walkMinutes(here, p)
      if (w < best) {
        best = w
        next = p
      }
    }
    if (!next || best > MAX_LEG) break
    stops.push({ place: next, walk: best })
    left.delete(next)
  }
  return stops
}

/** Up to `limit` crawls for a craving that do not share any stops. */
export function crawlsFor<P extends CrawlPlace>(
  kind: CrawlKind,
  places: P[],
  limit = 2,
): Crawl<P>[] {
  let pool = places.filter(kind.matches)
  const crawls: Crawl<P>[] = []
  while (crawls.length < limit) {
    let best: Crawl<P> | null = null
    for (const seed of pool) {
      const stops = routeFrom(seed, pool)
      if (stops.length < MIN_STOPS) continue
      const walk = stops.reduce((n, s) => n + s.walk, 0)
      if (
        !best ||
        stops.length > best.stops.length ||
        (stops.length === best.stops.length && walk < best.walkMinutes)
      ) {
        const counts = new Map<string, number>()
        for (const s of stops)
          counts.set(s.place.neighborhood, (counts.get(s.place.neighborhood) ?? 0) + 1)
        const areas = [...counts].sort((a, b) => b[1] - a[1]).map(([n]) => n)
        best = { kind, stops, walkMinutes: walk, areas }
      }
    }
    if (!best) break
    crawls.push(best)
    const used = new Set(best.stops.map((s) => s.place.slug))
    pool = pool.filter((p) => !used.has(p.slug))
  }
  return crawls
}
