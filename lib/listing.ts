import { NEIGHBORHOODS } from "@/data/neighborhoods"
import { getStatusAt, isOpen, nycClock, type NycClock } from "@/lib/hours"
import {
  atClock,
  matchesFilter,
  type FilterablePlace,
  paramsToFilter,
  sortPlaces,
  type ListingParams,
} from "@/lib/place-filters"
import { BOROUGHS, DIETARY_OPTIONS, LIGHT_TIMES, VIBE_TAGS } from "@/types/enums"
import type { Borough, DietaryOption, LightTime, Place, VibeTag } from "@/types/place"

/** Which filter choices make sense for a set of places (no dead-end options). */
export type FilterOptions = {
  boroughs: Borough[]
  neighborhoods: { name: string; borough: Borough }[]
  vibes: VibeTag[]
  dietary: DietaryOption[]
  lights: LightTime[]
  prices: (1 | 2 | 3 | 4)[]
  showFree: boolean
}

export function filterOptions(pool: Place[]): FilterOptions {
  const has = <T>(list: readonly T[], pick: (p: Place) => readonly T[] | undefined) =>
    list.filter((v) => pool.some((p) => pick(p)?.includes(v)))

  const hoods = new Map<string, Borough>()
  for (const p of pool) hoods.set(p.neighborhood, p.borough)
  const order = (name: string) => {
    const i = NEIGHBORHOODS.findIndex((n) => n.name === name)
    return i === -1 ? Number.MAX_SAFE_INTEGER : i
  }

  const paid = pool.filter((p) => !p.isFree)
  return {
    boroughs: BOROUGHS.filter((b) => pool.some((p) => p.borough === b)),
    neighborhoods: [...hoods]
      .map(([name, borough]) => ({ name, borough }))
      .sort((a, b) => order(a.name) - order(b.name) || a.name.localeCompare(b.name)),
    vibes: has(VIBE_TAGS, (p) => p.vibeTags),
    dietary: has(DIETARY_OPTIONS, (p) => p.dietary),
    lights: has(LIGHT_TIMES, (p) => p.photoSpot?.bestLight),
    prices: ([1, 2, 3, 4] as const).filter((l) => paid.some((p) => p.priceLevel >= l)),
    showFree: paid.length > 0 && paid.length < pool.length,
  }
}

/**
 * Applies URL filters (including "open now" against New York time, or open at
 * a chosen day and time) and sorting.
 */
export function applyListing<P extends FilterablePlace & Pick<Place, "hours">>(
  pool: P[],
  params: ListingParams,
  now = new Date(),
): P[] {
  let results = pool.filter((p) => matchesFilter(p, paramsToFilter(params)))
  const at = params.at ? atClock(params.at) : undefined
  if (at || params.open) {
    const clock = at ?? nycClock(now)
    results = results.filter((p) => isOpen(getStatusAt(p.hours, clock)))
  }
  const sorted = sortPlaces(results, params.sort)
  return params.sort === "closes" ? byClosingTime(sorted, at ?? nycClock(now)) : sorted
}

/** Minutes until a place closes at `clock`: open around the clock first, closed last. */
function minutesOpen(hours: Place["hours"], clock: NycClock): number {
  const status = getStatusAt(hours, clock)
  if (status.state === "open_24h") return 7 * 1440
  if (status.state === "open" || status.state === "closing_soon") return status.minutesLeft
  return -1
}

/** "Open latest": what stays open longest comes first (a stable sort keeps the rest in order). */
function byClosingTime<P extends Pick<Place, "hours">>(places: P[], clock: NycClock): P[] {
  const left = new Map(places.map((p) => [p, minutesOpen(p.hours, clock)]))
  return [...places].sort((a, b) => left.get(b)! - left.get(a)!)
}

export function hasActiveFilters(p: ListingParams): boolean {
  return Boolean(
    p.borough ||
    p.hood ||
    p.price ||
    p.open ||
    p.at ||
    p.free ||
    p.step ||
    p.vibe ||
    p.diet ||
    p.light,
  )
}
