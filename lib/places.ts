import { z } from "zod"
import attractions from "@/data/attractions.json"
import drinks from "@/data/drinks.json"
import parksPiers from "@/data/parks-piers.json"
import photoSpots from "@/data/photo-spots.json"
import restaurants from "@/data/restaurants.json"
import shopping from "@/data/shopping.json"
import { matchesFilter, sortPlaces, type PlaceFilter, type PlaceSort } from "@/lib/place-filters"
import { placeSchema, type Place } from "@/types/place"

/**
 * Data access for places. Backed by the JSON seed files today; the async signatures
 * let this module switch to Supabase without touching callers.
 */

function load(): Place[] {
  const parsed = z
    .array(placeSchema)
    .parse([...restaurants, ...drinks, ...attractions, ...shopping, ...photoSpots, ...parksPiers])
  const seen = new Set<string>()
  for (const p of parsed) {
    if (seen.has(p.slug)) throw new Error(`Duplicate place slug in seed data: ${p.slug}`)
    seen.add(p.slug)
  }
  return parsed
}

const PLACES = load()

export async function getPlaces(
  filter: PlaceFilter = {},
  options: { sort?: PlaceSort; limit?: number } = {},
): Promise<Place[]> {
  const sorted = sortPlaces(
    PLACES.filter((p) => matchesFilter(p, filter)),
    options.sort,
  )
  return options.limit ? sorted.slice(0, options.limit) : sorted
}

export async function getPlaceBySlug(slug: string): Promise<Place | undefined> {
  return PLACES.find((p) => p.slug === slug)
}
