import type { LatLng } from "@/lib/geo"
import type { LineColor } from "@/lib/lines"
import type { Borough, Photo } from "@/types/place"

export type WalkKey =
  | "inwood"
  | "highbridge"
  | "fortTryon"
  | "brooklynBridge"
  | "reservoir"
  | "centralParkLoop"
  | "prospectWoods"
  | "saltMarsh"
  | "vanCortlandt"
  | "pelhamBay"
  | "soundview"
  | "forestPark"
  | "alleyPond"
  | "greenbelt"
  | "cloveLakes"

/** A city walk or a trail in one of the city's forests. */
export type Walk = {
  key: WalkKey
  kind: "walk" | "hike"
  emoji: string
  line: LineColor
  borough: Borough
  /** Proper name of the park or bridge, shown as is in every language. */
  park: string
  /** Official length in miles; null when the source lists several routes. */
  miles: number | null
  difficulty: "easy" | "moderate" | null
  /** Listed as accessible in the NYC Parks trail directory. */
  accessible: boolean
  start: LatLng
  /** For one-way walks, where they end. */
  end?: LatLng
  /** The matching place on NYCrave, if any. */
  place?: string
  photo?: Photo
  source: { name: string; url: string }
}

/** Easy strolling pace on city paths, and a gentler one on dirt trails. */
const MPH = { walk: 2.5, hike: 2 } as const

/** About how long a walk takes, rounded to 5 minutes; null without a length. */
export function walkMinutesFor(walk: Pick<Walk, "kind" | "miles">): number | null {
  if (walk.miles === null) return null
  return Math.max(5, Math.round(((walk.miles / MPH[walk.kind]) * 60) / 5) * 5)
}

export const kmFromMiles = (miles: number) => Math.round(miles * 1.609 * 10) / 10
