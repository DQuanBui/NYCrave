import type { Photo, Place } from "@/types/place"

/**
 * Just what a place card needs. Client components receive this instead of the
 * full record, which keeps addresses, notes and photo credits out of every page's
 * payload (the home page repeats places across several rows).
 */
export type CardPlace = Pick<
  Place,
  | "id"
  | "slug"
  | "name"
  | "category"
  | "cuisines"
  | "dishTypes"
  | "drinkTypes"
  | "shopTypes"
  | "vibeTags"
  | "neighborhood"
  | "borough"
  | "lat"
  | "lng"
  | "priceLevel"
  | "isFree"
  | "ticketInfo"
  | "hours"
  | "editorialTake"
  | "timeNeededMinutes"
  | "verified"
> & {
  photos: Pick<Photo, "url" | "alt" | "width" | "height" | "source" | "illustrative">[]
  photoSpot?: { bestLight: NonNullable<Place["photoSpot"]>["bestLight"] }
}

export function toCard(p: Place): CardPlace {
  const cover = p.photos[0]
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    cuisines: p.cuisines,
    dishTypes: p.dishTypes,
    drinkTypes: p.drinkTypes,
    shopTypes: p.shopTypes,
    vibeTags: p.vibeTags,
    neighborhood: p.neighborhood,
    borough: p.borough,
    lat: p.lat,
    lng: p.lng,
    priceLevel: p.priceLevel,
    isFree: p.isFree,
    ticketInfo: p.ticketInfo ? { priceRange: p.ticketInfo.priceRange } : undefined,
    hours: p.hours,
    editorialTake: p.editorialTake,
    timeNeededMinutes: p.timeNeededMinutes,
    verified: p.verified,
    photos: cover
      ? [
          {
            url: cover.url,
            alt: cover.alt,
            width: cover.width,
            height: cover.height,
            source: cover.source,
            illustrative: cover.illustrative,
          },
        ]
      : [],
    photoSpot: p.photoSpot ? { bestLight: p.photoSpot.bestLight } : undefined,
  }
}
