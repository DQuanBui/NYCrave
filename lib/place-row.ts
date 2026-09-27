import type { Place } from "@/types/place"

/** A row of the `places` table (supabase/schema.sql). */
export type PlaceRow = {
  id: string
  slug: string
  name: string
  category: Place["category"]
  cuisines: string[]
  dish_types: string[]
  drink_types: string[]
  shop_types: string[]
  dietary: string[]
  borough: Place["borough"]
  neighborhood: string
  address: string
  lat: number
  lng: number
  price_level: number
  is_free: boolean
  ticket_info: Place["ticketInfo"] | null
  hours: Place["hours"]
  must_try: string[]
  editorial_take: string
  vibe_tags: string[]
  best_time_to_visit: string | null
  time_needed_minutes: number | null
  photos: Place["photos"]
  photo_spot: Place["photoSpot"] | null
  park: Place["park"] | null
  trending_score: number | null
  google_place_id: string | null
  website: string | null
  phone: string | null
  verified: boolean
  verification_notes: string | null
  updated_at: string
}

const orUndefined = <T>(v: T | null | undefined) => (v === null ? undefined : v)

/**
 * Row -> unvalidated place shape. Callers run it through placeSchema, which
 * narrows enum strings and rejects bad data.
 */
export function rowToPlace(row: PlaceRow): unknown {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    // Postgres stores "none" and "not set" alike as '{}'; the app treats both the same
    cuisines: row.cuisines ?? [],
    dishTypes: row.dish_types ?? [],
    drinkTypes: row.drink_types ?? [],
    shopTypes: row.shop_types ?? [],
    dietary: row.dietary ?? [],
    borough: row.borough,
    neighborhood: row.neighborhood,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    priceLevel: row.price_level,
    isFree: row.is_free,
    ticketInfo: orUndefined(row.ticket_info),
    hours: row.hours,
    mustTry: row.must_try ?? [],
    editorialTake: row.editorial_take ?? "",
    vibeTags: row.vibe_tags ?? [],
    bestTimeToVisit: orUndefined(row.best_time_to_visit),
    timeNeededMinutes: orUndefined(row.time_needed_minutes),
    photos: row.photos ?? [],
    photoSpot: orUndefined(row.photo_spot),
    park: orUndefined(row.park),
    trendingScore: orUndefined(row.trending_score),
    googlePlaceId: orUndefined(row.google_place_id),
    website: orUndefined(row.website),
    phone: orUndefined(row.phone),
    verified: row.verified,
    verificationNotes: orUndefined(row.verification_notes),
    // Postgres returns "+00:00" offsets; the schema expects ISO "Z" form
    updatedAt: new Date(row.updated_at).toISOString(),
  }
}

export function placeToRow(p: Place): PlaceRow {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    cuisines: p.cuisines ?? [],
    dish_types: p.dishTypes ?? [],
    drink_types: p.drinkTypes ?? [],
    shop_types: p.shopTypes ?? [],
    dietary: p.dietary ?? [],
    borough: p.borough,
    neighborhood: p.neighborhood,
    address: p.address,
    lat: p.lat,
    lng: p.lng,
    price_level: p.priceLevel,
    is_free: p.isFree,
    ticket_info: p.ticketInfo ?? null,
    hours: p.hours,
    must_try: p.mustTry,
    editorial_take: p.editorialTake,
    vibe_tags: p.vibeTags,
    best_time_to_visit: p.bestTimeToVisit ?? null,
    time_needed_minutes: p.timeNeededMinutes ?? null,
    photos: p.photos,
    photo_spot: p.photoSpot ?? null,
    park: p.park ?? null,
    trending_score: p.trendingScore ?? null,
    google_place_id: p.googlePlaceId ?? null,
    website: p.website ?? null,
    phone: p.phone ?? null,
    verified: p.verified,
    verification_notes: p.verificationNotes ?? null,
    updated_at: p.updatedAt,
  }
}
