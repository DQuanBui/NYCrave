import { NEIGHBORHOODS } from "@/data/neighborhoods"
import { getStatusAt, isOpen, nycClock } from "@/lib/hours"
import { matchesFilter, paramsToFilter, sortPlaces, type ListingParams } from "@/lib/place-filters"
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

/** Applies URL filters (including "open now" against New York time) and sorting. */
export function applyListing(pool: Place[], params: ListingParams, now = new Date()): Place[] {
  let results = pool.filter((p) => matchesFilter(p, paramsToFilter(params)))
  if (params.open) {
    const clock = nycClock(now)
    results = results.filter((p) => isOpen(getStatusAt(p.hours, clock)))
  }
  return sortPlaces(results, params.sort)
}

export function hasActiveFilters(p: ListingParams): boolean {
  return Boolean(p.borough || p.hood || p.price || p.open || p.free || p.vibe || p.diet || p.light)
}
