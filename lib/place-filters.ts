import {
  BOROUGHS,
  CUISINES,
  DIETARY_OPTIONS,
  DISH_TYPES,
  DRINK_TYPES,
  LIGHT_TIMES,
  SHOP_TYPES,
  VIBE_TAGS,
  WEEKDAYS,
} from "@/types/enums"
import type {
  Borough,
  Category,
  Cuisine,
  DietaryOption,
  DishType,
  DrinkType,
  LightTime,
  Place,
  ShopType,
  VibeTag,
} from "@/types/place"

export type PlaceFilter = {
  category?: Category | Category[]
  borough?: Borough
  neighborhood?: string
  cuisine?: Cuisine
  dishType?: DishType
  drinkType?: DrinkType
  shopType?: ShopType
  light?: LightTime
  vibe?: VibeTag
  dietary?: DietaryOption
  isFree?: boolean
  maxPriceLevel?: 1 | 2 | 3 | 4
}

export const SORTS = ["trending", "name", "price"] as const
export type PlaceSort = (typeof SORTS)[number]

/** The fields filtering and sorting read, so slim place cards can be filtered in the browser. */
export type FilterablePlace = Pick<
  Place,
  | "category"
  | "borough"
  | "neighborhood"
  | "cuisines"
  | "dishTypes"
  | "drinkTypes"
  | "shopTypes"
  | "vibeTags"
  | "dietary"
  | "isFree"
  | "priceLevel"
  | "name"
  | "trendingScore"
> & { photoSpot?: { bestLight: LightTime[] } }

/** Pure predicate so the same filtering runs on the server and in client components. */
export function matchesFilter(place: FilterablePlace, f: PlaceFilter): boolean {
  if (f.category) {
    const cats = Array.isArray(f.category) ? f.category : [f.category]
    if (!cats.includes(place.category)) return false
  }
  if (f.borough && place.borough !== f.borough) return false
  if (f.neighborhood && place.neighborhood.toLowerCase() !== f.neighborhood.toLowerCase())
    return false
  if (f.cuisine && !place.cuisines?.includes(f.cuisine)) return false
  if (f.dishType && !place.dishTypes?.includes(f.dishType)) return false
  if (f.drinkType && !place.drinkTypes?.includes(f.drinkType)) return false
  if (f.shopType && !place.shopTypes?.includes(f.shopType)) return false
  if (f.light && !place.photoSpot?.bestLight.includes(f.light)) return false
  if (f.vibe && !place.vibeTags.includes(f.vibe)) return false
  if (f.dietary && !place.dietary?.includes(f.dietary)) return false
  if (f.isFree !== undefined && place.isFree !== f.isFree) return false
  if (f.maxPriceLevel && place.priceLevel > f.maxPriceLevel) return false
  return true
}

export function sortPlaces<P extends FilterablePlace>(
  places: P[],
  sort: PlaceSort = "trending",
): P[] {
  const copy = [...places]
  switch (sort) {
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case "price":
      return copy.sort((a, b) => a.priceLevel - b.priceLevel || a.name.localeCompare(b.name))
    case "trending":
      return copy.sort((a, b) => (b.trendingScore ?? 0) - (a.trendingScore ?? 0))
  }
}

/** Filter state as it appears in the URL, so every filtered view is shareable. */
export type ListingParams = {
  borough?: Borough
  hood?: string
  price?: 1 | 2 | 3 | 4
  open?: boolean
  /** Open on a weekday at a time, as "sat-2100" (New York time). */
  at?: string
  free?: boolean
  /** Only places with a step-free subway station a short walk away. */
  step?: boolean
  vibe?: VibeTag
  diet?: DietaryOption
  light?: LightTime
  sort: PlaceSort
  view: "list" | "map"
}

type RawParams = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
const oneOf = <T extends string>(list: readonly T[], v: string | undefined): T | undefined =>
  list.includes(v as T) ? (v as T) : undefined

export function parseListingParams(raw: RawParams): ListingParams {
  const price = Number(first(raw.price))
  return {
    borough: oneOf(BOROUGHS, first(raw.borough)),
    hood: first(raw.hood) || undefined,
    price: price >= 1 && price <= 4 ? (price as 1 | 2 | 3 | 4) : undefined,
    open: first(raw.open) === "1" || undefined,
    at: atClock(first(raw.at) ?? "") ? first(raw.at) : undefined,
    free: first(raw.free) === "1" || undefined,
    step: first(raw.step) === "1" || undefined,
    vibe: oneOf(VIBE_TAGS, first(raw.vibe)),
    diet: oneOf(DIETARY_OPTIONS, first(raw.diet)),
    light: oneOf(LIGHT_TIMES, first(raw.light)),
    sort: oneOf(SORTS, first(raw.sort)) ?? "trending",
    view: first(raw.view) === "map" ? "map" : "list",
  }
}

const AT = /^(sun|mon|tue|wed|thu|fri|sat)-([01]\d|2[0-3])([0-5]\d)$/

/** "sat-2100" as a weekday (0 = Sunday) and minutes after midnight. */
export function atClock(at: string): { weekday: number; minutes: number } | undefined {
  const m = AT.exec(at)
  if (!m) return undefined
  return {
    weekday: WEEKDAYS.indexOf(m[1] as (typeof WEEKDAYS)[number]),
    minutes: Number(m[2]) * 60 + Number(m[3]),
  }
}

export function toAt(weekday: number, minutes: number): string {
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0")
  const mm = String(minutes % 60).padStart(2, "0")
  return `${WEEKDAYS[weekday]}-${hh}${mm}`
}

/** Serializes only non-default values, so clean URLs stay clean. */
export function listingQuery(p: Partial<ListingParams>): Record<string, string> {
  const q: Record<string, string> = {}
  if (p.borough) q.borough = p.borough
  if (p.hood) q.hood = p.hood
  if (p.price) q.price = String(p.price)
  if (p.open) q.open = "1"
  if (p.at) q.at = p.at
  if (p.free) q.free = "1"
  if (p.step) q.step = "1"
  if (p.vibe) q.vibe = p.vibe
  if (p.diet) q.diet = p.diet
  if (p.light) q.light = p.light
  if (p.sort && p.sort !== "trending") q.sort = p.sort
  if (p.view === "map") q.view = "map"
  return q
}

export function paramsToFilter(p: ListingParams): PlaceFilter {
  return {
    borough: p.borough,
    neighborhood: p.hood,
    maxPriceLevel: p.price,
    isFree: p.free ? true : undefined,
    vibe: p.vibe,
    dietary: p.diet,
    light: p.light,
  }
}

/** URL slugs for enum values: `middle_eastern` <-> `middle-eastern`. */
export const toSlug = (value: string) => value.replace(/_/g, "-")
export function fromSlug<T extends string>(list: readonly T[], slug: string): T | undefined {
  return oneOf(list, slug.replace(/-/g, "_"))
}

export const TYPE_LISTS = {
  cuisine: CUISINES,
  dish: DISH_TYPES,
  drink: DRINK_TYPES,
  shop: SHOP_TYPES,
} as const
