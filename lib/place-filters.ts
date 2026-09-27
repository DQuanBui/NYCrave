import type {
  Borough,
  Category,
  Cuisine,
  DietaryOption,
  DishType,
  DrinkType,
  Place,
  VibeTag,
} from "@/types/place"

export type PlaceFilter = {
  category?: Category | Category[]
  borough?: Borough
  neighborhood?: string
  cuisine?: Cuisine
  dishType?: DishType
  drinkType?: DrinkType
  vibe?: VibeTag
  dietary?: DietaryOption
  isFree?: boolean
  maxPriceLevel?: 1 | 2 | 3 | 4
}

export type PlaceSort = "trending" | "name" | "price"

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
