import { distanceKm, type LatLng } from "@/lib/geo"
import { PRICE_LEVEL_ESTIMATE } from "@/lib/taxonomy"
import type { Place } from "@/types/place"
import type { Slot, Travel } from "./types"

/** NYC subway/bus base fare in USD. TODO: verify against mta.info when fares change. */
export const SUBWAY_FARE = 3

/** Street grids and avenues make real walks longer than the straight line. */
const DETOUR = 1.3
const WALK_KMH = 4.8
const MAX_WALK_MINUTES = 20
/** Walking to the station, waiting, and walking out. */
const SUBWAY_OVERHEAD_MINUTES = 10
/** Average door-to-door speed once on a train, including transfers. */
const SUBWAY_KMH = 22

/** Minutes on foot along the street grid. */
export function walkMinutes(from: LatLng, to: LatLng): number {
  return Math.max(Math.round(((distanceKm(from, to) * DETOUR) / WALK_KMH) * 60), 1)
}

export function estimateTravel(from: LatLng, to: LatLng): Travel {
  const km = distanceKm(from, to) * DETOUR
  const walk = Math.round((km / WALK_KMH) * 60)
  if (walk <= MAX_WALK_MINUTES) return { mode: "walk", minutes: Math.max(walk, 2), km }
  return {
    mode: "subway",
    minutes: Math.round(SUBWAY_OVERHEAD_MINUTES + (km / SUBWAY_KMH) * 60),
    km,
  }
}

/** Rough per-person spend for one visit, in whole dollars. */
export function estimateCost(place: Place, slot: Slot): number {
  if (place.isFree) return 0
  if (place.ticketInfo) {
    return Math.round((place.ticketInfo.priceRange.min + place.ticketInfo.priceRange.max) / 2)
  }
  const base = PRICE_LEVEL_ESTIMATE[place.priceLevel]
  switch (place.category) {
    case "restaurant":
      return Math.round(slot === "breakfast" ? base * 0.6 : base)
    case "drink":
      return Math.round(slot === "night" ? base * 0.8 : base * 0.35)
    case "attraction":
      return Math.round(base * 0.5)
    // Browsing is free; purchases are up to you
    default:
      return 0
  }
}
