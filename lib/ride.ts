import stations from "@/data/subway-stations.json"
import { distanceKm } from "@/lib/geo"
import { walkMinutes } from "@/lib/planner/estimates"
import { ROUTE_LINE, type Station } from "@/lib/subway"
import type { Place } from "@/types/place"

/**
 * Ride a train: every station on a route, with the NYCrave places a short walk
 * from it. The station list has no stop sequence, so the order is rebuilt from
 * geography: start at the far end of the line and keep stepping to the nearest
 * station not yet visited. That follows the track on a straight line; on lines
 * with branches it finishes one branch before jumping to the next.
 */

const STATIONS = stations as Station[]

/** The shuttles are three separate lines, and the Z only runs at rush hour. */
export const RIDE_ROUTES = Object.keys(ROUTE_LINE).filter((r) => r !== "S" && r !== "Z")

export const MAX_WALK = 10

export const routeSlug = (route: string) => route.toLowerCase()
export const routeFromSlug = (slug: string) =>
  RIDE_ROUTES.find((r) => routeSlug(r) === slug.toLowerCase())

export type RideStop<P> = { station: Station; places: { place: P; walk: number }[] }

export type Ride<P> = {
  route: string
  stops: RideStop<P>[]
  placeCount: number
}

/** Stations in riding order, starting from the northern or western end. */
export function stationOrder(line: Station[]): Station[] {
  if (line.length < 2) return line
  const lat = line.reduce((n, s) => n + s.lat, 0) / line.length
  const lng = line.reduce((n, s) => n + s.lng, 0) / line.length
  // The station farthest from the middle of the line is one of its ends
  let start = line[0]
  for (const s of line) if (distanceKm(s, { lat, lng }) > distanceKm(start, { lat, lng })) start = s
  const order = [start]
  const left = new Set(line.filter((s) => s !== start))
  while (left.size) {
    const here = order.at(-1)!
    let next: Station | undefined
    for (const s of left) if (!next || distanceKm(here, s) < distanceKm(here, next)) next = s
    order.push(next!)
    left.delete(next!)
  }
  // Read north to south, or west to east when the ends sit side by side
  const [a, b] = [order[0], order.at(-1)!]
  const dLat = (a.lat - b.lat) * 111
  const dLng = (b.lng - a.lng) * 84
  const forward = Math.abs(dLat) >= Math.abs(dLng) ? dLat > 0 : dLng > 0
  return forward ? order : order.reverse()
}

export function rideLine<P extends Pick<Place, "lat" | "lng" | "slug">>(
  route: string,
  places: P[],
): Ride<P> {
  const ordered = stationOrder(STATIONS.filter((s) => s.routes.includes(route)))
  const stops: RideStop<P>[] = ordered.map((station) => ({ station, places: [] }))
  let placeCount = 0
  for (const place of places) {
    let best: RideStop<P> | undefined
    let bestKm = Infinity
    for (const stop of stops) {
      const km = distanceKm(place, stop.station)
      if (km < bestKm) {
        best = stop
        bestKm = km
      }
    }
    if (!best) continue
    const walk = walkMinutes(place, best.station)
    if (walk > MAX_WALK) continue
    best.places.push({ place, walk })
    placeCount++
  }
  for (const stop of stops) stop.places.sort((a, b) => a.walk - b.walk)
  return { route, stops, placeCount }
}
