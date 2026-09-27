export type LatLng = { lat: number; lng: number }

const EARTH_RADIUS_KM = 6371

/** Great-circle distance in kilometers. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}

export function googleMapsUrl(p: LatLng & { name: string; googlePlaceId?: string }): string {
  const url = new URL("https://www.google.com/maps/search/")
  url.searchParams.set("api", "1")
  url.searchParams.set("query", `${p.lat},${p.lng}`)
  if (p.googlePlaceId) url.searchParams.set("query_place_id", p.googlePlaceId)
  return url.toString()
}

export function appleMapsUrl(p: LatLng & { name: string }): string {
  const url = new URL("https://maps.apple.com/")
  url.searchParams.set("ll", `${p.lat},${p.lng}`)
  url.searchParams.set("q", p.name)
  return url.toString()
}

export function transitDirectionsUrl(p: LatLng): string {
  const url = new URL("https://www.google.com/maps/dir/")
  url.searchParams.set("api", "1")
  url.searchParams.set("destination", `${p.lat},${p.lng}`)
  url.searchParams.set("travelmode", "transit")
  return url.toString()
}

type Stop = LatLng & { name: string; address?: string }
const where = (s: Stop) => (s.address ? `${s.name}, ${s.address}` : `${s.lat},${s.lng}`)

/**
 * The whole day as one Google Maps route, from the start through every stop.
 * Google allows up to nine waypoints in these links; plans have at most eight.
 */
export function routeDirectionsUrl(origin: LatLng, stops: Stop[]): string {
  const url = new URL("https://www.google.com/maps/dir/")
  url.searchParams.set("api", "1")
  url.searchParams.set("origin", `${origin.lat},${origin.lng}`)
  url.searchParams.set("destination", where(stops[stops.length - 1]))
  const via = stops.slice(0, -1).slice(0, 9)
  if (via.length) url.searchParams.set("waypoints", via.map(where).join("|"))
  url.searchParams.set("travelmode", "walking")
  return url.toString()
}
