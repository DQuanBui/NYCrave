import { z } from "zod"
import attractions from "@/data/attractions.json"
import drinks from "@/data/drinks.json"
import parksPiers from "@/data/parks-piers.json"
import photoSpots from "@/data/photo-spots.json"
import restaurants from "@/data/restaurants.json"
import shopping from "@/data/shopping.json"
import { matchesFilter, sortPlaces, type PlaceFilter, type PlaceSort } from "@/lib/place-filters"
import { rowToPlace, type PlaceRow } from "@/lib/place-row"
import { supabaseConfigured, supabaseReader } from "@/lib/supabase"
import { placeSchema, type Place } from "@/types/place"

/**
 * Data access for places. Reads Supabase when it is configured, otherwise the JSON
 * seed files. Callers only see these async functions, never the backend.
 */

function loadSeed(): Place[] {
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

const SEED = loadSeed()

/** The validated JSON seed, regardless of backend (used to sync into Supabase). */
export function seedPlaces(): Place[] {
  return SEED
}

const CACHE_MS = 60_000
let cache: { at: number; places: Promise<Place[]> } | undefined

async function loadFromSupabase(): Promise<Place[]> {
  const { data, error } = await supabaseReader()!.from("places").select("*")
  if (error) throw new Error(`Supabase places query failed: ${error.message}`)
  const places: Place[] = []
  for (const row of data as PlaceRow[]) {
    const result = placeSchema.safeParse(rowToPlace(row))
    // One bad row should not take the whole site down
    if (result.success) places.push(result.data)
    else console.warn(`Skipping invalid place row ${row.id}:`, z.prettifyError(result.error))
  }
  return places
}

async function allPlaces(): Promise<Place[]> {
  if (!supabaseConfigured) return SEED
  if (!cache || Date.now() - cache.at > CACHE_MS) {
    const places = loadFromSupabase()
    cache = { at: Date.now(), places }
    places.catch(() => {
      cache = undefined
    })
  }
  return cache.places
}

/** Drop the cached Supabase snapshot after an admin write. */
export function invalidatePlaces() {
  cache = undefined
}

export async function getPlaces(
  filter: PlaceFilter = {},
  options: { sort?: PlaceSort; limit?: number } = {},
): Promise<Place[]> {
  const sorted = sortPlaces(
    (await allPlaces()).filter((p) => matchesFilter(p, filter)),
    options.sort,
  )
  return options.limit ? sorted.slice(0, options.limit) : sorted
}

export async function getPlaceBySlug(slug: string): Promise<Place | undefined> {
  return (await allPlaces()).find((p) => p.slug === slug)
}

export async function getPlaceById(id: string): Promise<Place | undefined> {
  return (await allPlaces()).find((p) => p.id === id)
}
