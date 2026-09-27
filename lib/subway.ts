import stations from "@/data/subway-stations.json"
import { distanceKm, type LatLng } from "@/lib/geo"
import type { LineColor } from "@/lib/lines"
import { walkMinutes } from "@/lib/planner/estimates"

/**
 * Subway stations from the MTA's open data (data.ny.gov, "MTA Subway Stations"),
 * with the routes that stop there on weekdays during the day. Platforms of the
 * same station inside one complex are merged.
 */
export type Station = {
  name: string
  lat: number
  lng: number
  routes: string[]
  /** Fully or partly accessible (elevators or ramps) */
  ada: boolean
}

export type NearbyStation = Station & { walkMinutes: number }

const STATIONS = stations as Station[]

/** Official MTA trunk-line colors. */
export const ROUTE_LINE: Record<string, LineColor> = {
  "1": "red",
  "2": "red",
  "3": "red",
  "4": "green",
  "5": "green",
  "6": "green",
  "7": "purple",
  A: "blue",
  C: "blue",
  E: "blue",
  B: "orange",
  D: "orange",
  F: "orange",
  M: "orange",
  G: "lime",
  J: "brown",
  Z: "brown",
  L: "gray",
  N: "yellow",
  Q: "yellow",
  R: "yellow",
  W: "yellow",
  S: "gray",
}

/** The closest stations within a comfortable walk, nearest first. */
export function nearestStations(point: LatLng, limit = 3, maxWalk = 15): NearbyStation[] {
  return STATIONS.map((s) => ({ s, km: distanceKm(point, s) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, limit)
    .map(({ s }) => ({ ...s, walkMinutes: walkMinutes(point, s) }))
    .filter((s) => s.walkMinutes <= maxWalk)
}

/** Every route with a station within `radiusKm`, in map order. */
export function routesNear(point: LatLng, radiusKm: number): string[] {
  const order = Object.keys(ROUTE_LINE)
  const routes = new Set<string>()
  for (const s of STATIONS) {
    if (distanceKm(point, s) <= radiusKm) for (const r of s.routes) routes.add(r)
  }
  return order.filter((r) => routes.has(r))
}

export type SubwayLeg = {
  board: NearbyStation
  alight: NearbyStation
  /** A train that runs between the two stations without a transfer, if any. */
  direct?: string
}

/** The B and W run weekdays only; the Z runs only at rush hour, in the peak direction. */
const WEEKDAY_ONLY = new Set(["B", "W"])
const RUSH_HOUR_ONLY = new Set(["Z"])

/**
 * Stations for a subway hop. Prefers a pair within walking distance that shares a
 * train running that day (fewest total minutes on foot); otherwise the nearest
 * station at each end.
 */
export function subwayLeg(
  from: LatLng,
  to: LatLng,
  { weekend = false }: { weekend?: boolean } = {},
): SubwayLeg | null {
  const runs = (r: string) => !RUSH_HOUR_ONLY.has(r) && !(weekend && WEEKDAY_ONLY.has(r))
  const starts = nearestStations(from, 4)
  const ends = nearestStations(to, 4)
  if (!starts.length || !ends.length) return null
  let best: SubwayLeg | null = null
  let bestWalk = Infinity
  for (const board of starts) {
    for (const alight of ends) {
      if (board.name === alight.name) continue
      const direct = board.routes.find((r) => runs(r) && alight.routes.includes(r))
      const walk = board.walkMinutes + alight.walkMinutes
      if (direct && walk < bestWalk) {
        best = { board, alight, direct }
        bestWalk = walk
      }
    }
  }
  return best ?? { board: starts[0], alight: ends[0] }
}
