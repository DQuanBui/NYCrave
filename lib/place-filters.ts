import {
  BOROUGHS,
  CUISINES,
  DIETARY_OPTIONS,
  DISH_TYPES,
  DRINK_TYPES,
  LIGHT_TIMES,
  SHOP_TYPES,
  VIBE_TAGS,
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

/** Pure predicate so the same filtering runs on the server and in client components. */
export function matchesFilter(place: Place, f: PlaceFilter): boolean {
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

export function sortPlaces(places: Place[], sort: PlaceSort = "trending"): Place[] {
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
  free?: boolean
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
    free: first(raw.free) === "1" || undefined,
    vibe: oneOf(VIBE_TAGS, first(raw.vibe)),
    diet: oneOf(DIETARY_OPTIONS, first(raw.diet)),
    light: oneOf(LIGHT_TIMES, first(raw.light)),
    sort: oneOf(SORTS, first(raw.sort)) ?? "trending",
    view: first(raw.view) === "map" ? "map" : "list",
  }
}

/** Serializes only non-default values, so clean URLs stay clean. */
export function listingQuery(p: Partial<ListingParams>): Record<string, string> {
  const q: Record<string, string> = {}
  if (p.borough) q.borough = p.borough
  if (p.hood) q.hood = p.hood
  if (p.price) q.price = String(p.price)
  if (p.open) q.open = "1"
  if (p.free) q.free = "1"
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
