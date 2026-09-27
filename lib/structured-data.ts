import { SITE_URL } from "@/lib/site"
import { WEEKDAYS, type Category, type Place } from "@/types/place"

const SCHEMA_TYPE: Record<Category, string> = {
  restaurant: "Restaurant",
  drink: "FoodEstablishment",
  attraction: "TouristAttraction",
  shopping: "Store",
  photo_spot: "TouristAttraction",
  park_pier: "Park",
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

/**
 * schema.org JSON-LD for a place. Returns null for unverified places so placeholder
 * data is never published to search engines as fact.
 */
export function placeJsonLd(p: Place): Record<string, unknown> | null {
  if (!p.verified) return null
  return {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPE[p.category],
    name: p.name,
    url: `${SITE_URL}/place/${p.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: p.address,
      addressLocality: "New York",
      addressRegion: "NY",
      addressCountry: "US",
    },
    geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng },
    ...(p.cuisines?.length ? { servesCuisine: p.cuisines } : {}),
    ...(p.category !== "park_pier" && p.category !== "photo_spot"
      ? { priceRange: p.isFree ? "Free" : "$".repeat(p.priceLevel) }
      : {}),
    ...(p.isFree ? { isAccessibleForFree: true } : {}),
    ...(p.website ? { sameAs: p.website } : {}),
    ...(p.phone ? { telephone: p.phone } : {}),
    image: p.photos.map((ph) => ph.url),
    openingHoursSpecification: WEEKDAYS.flatMap((day, i) =>
      p.hours[day].map((r) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_NAMES[i],
        opens: r.open,
        closes: r.close === "24:00" ? "23:59" : r.close,
      })),
    ),
  }
}
