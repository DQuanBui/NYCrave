import { z } from "zod"
import { WEEKDAYS, type ApiReview, type Photo, type WeeklyHours } from "@/types/place"

/**
 * Google Places API (New). Server only: the key never reaches the browser. Photos
 * are served through /api/places/photo with their author attributions, and review
 * snippets are shown only with attribution, as Google's terms require.
 */

const KEY = process.env.GOOGLE_PLACES_API_KEY
export const googlePlacesConfigured = Boolean(KEY)

const FIELDS = [
  "id",
  "displayName",
  "formattedAddress",
  "nationalPhoneNumber",
  "websiteUri",
  "googleMapsUri",
  "rating",
  "userRatingCount",
  "regularOpeningHours",
  "reviews",
  "photos",
].join(",")

const point = z.object({ day: z.number(), hour: z.number(), minute: z.number().optional() })
const attribution = z.object({ displayName: z.string().optional(), uri: z.string().optional() })

const detailsSchema = z.object({
  id: z.string(),
  displayName: z.object({ text: z.string() }).optional(),
  formattedAddress: z.string().optional(),
  nationalPhoneNumber: z.string().optional(),
  websiteUri: z.string().optional(),
  googleMapsUri: z.string().optional(),
  rating: z.number().optional(),
  userRatingCount: z.number().optional(),
  regularOpeningHours: z
    .object({ periods: z.array(z.object({ open: point, close: point.optional() })).optional() })
    .optional(),
  reviews: z
    .array(
      z.object({
        rating: z.number().optional(),
        relativePublishTimeDescription: z.string().optional(),
        text: z.object({ text: z.string() }).optional(),
        authorAttribution: attribution.optional(),
      }),
    )
    .optional(),
  photos: z
    .array(
      z.object({
        name: z.string(),
        widthPx: z.number(),
        heightPx: z.number(),
        authorAttributions: z.array(attribution).optional(),
      }),
    )
    .optional(),
})

export type GooglePlaceDetails = {
  rating?: number
  ratingCount?: number
  mapsUri?: string
  address?: string
  phone?: string
  website?: string
  hours?: WeeklyHours
  reviews: ApiReview[]
  photos: Photo[]
}

const hhmm = (h: number, m = 0) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`

/** Google periods (day 0 = Sunday, like ours) -> our weekly ranges. No close means 24/7. */
export function periodsToHours(
  periods: { open: z.infer<typeof point>; close?: z.infer<typeof point> }[],
): WeeklyHours {
  const hours = Object.fromEntries(WEEKDAYS.map((d) => [d, []])) as unknown as WeeklyHours
  for (const { open, close } of periods) {
    const range = close
      ? { open: hhmm(open.hour, open.minute), close: hhmm(close.hour, close.minute) }
      : { open: "00:00", close: "24:00" }
    if (!close) {
      for (const d of WEEKDAYS) hours[d] = [range]
      break
    }
    hours[WEEKDAYS[open.day]].push(range)
  }
  return hours
}

export function photoUrl(name: string, maxWidth = 1200): string {
  return `/api/places/photo?${new URLSearchParams({ name, w: String(maxWidth) })}`
}

export async function getGooglePlaceDetails(
  placeId: string,
  placeName: string,
): Promise<GooglePlaceDetails | null> {
  if (!KEY) return null
  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: { "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": FIELDS },
        next: { revalidate: 60 * 60 * 24 },
      },
    )
    if (!res.ok) return null
    const d = detailsSchema.parse(await res.json())
    return {
      rating: d.rating,
      ratingCount: d.userRatingCount,
      mapsUri: d.googleMapsUri,
      address: d.formattedAddress,
      phone: d.nationalPhoneNumber,
      website: d.websiteUri,
      hours: d.regularOpeningHours?.periods
        ? periodsToHours(d.regularOpeningHours.periods)
        : undefined,
      reviews: (d.reviews ?? [])
        .filter((r) => r.text?.text && r.authorAttribution?.displayName)
        .map((r) => ({
          source: "google_places",
          authorName: r.authorAttribution!.displayName!,
          authorUrl: r.authorAttribution?.uri,
          rating: r.rating ?? 0,
          text: r.text!.text,
          relativeTime: r.relativePublishTimeDescription ?? "",
        })),
      photos: (d.photos ?? []).slice(0, 8).map((p) => {
        const author = p.authorAttributions?.[0]
        return {
          url: photoUrl(p.name),
          alt: `Photo of ${placeName}`,
          width: p.widthPx,
          height: p.heightPx,
          source: "google_places",
          attribution: author?.displayName
            ? { text: author.displayName, url: author.uri }
            : { text: "Google" },
        }
      }),
    }
  } catch {
    return null
  }
}
