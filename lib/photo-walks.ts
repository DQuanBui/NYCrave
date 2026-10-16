import { distanceKm, type LatLng } from "@/lib/geo"
import { getStatusAt } from "@/lib/hours"
import type { LineColor } from "@/lib/lines"
import { walkMinutes } from "@/lib/planner/estimates"
import type { SunDay } from "@/lib/sun"
import type { WeeklyHours } from "@/types/place"

/**
 * Photo walks timed by the sun. Each walk strings together photo spots a short
 * walk apart and is anchored to a moment of today's light, so the schedule
 * moves with the seasons: start when it says and every stop lands in its light.
 */

export type LightPhase = "night" | "blue" | "dawn" | "golden" | "day" | "dusk"

export type LightBand = { phase: LightPhase; start: number; end: number }

/** The light at a minute of the day. Dawn and dusk: the sun just below the horizon. */
export function phaseAt(minute: number, sun: SunDay): LightPhase {
  if (minute < sun.blueMorning.start) return "night"
  if (minute < sun.blueMorning.end) return "blue"
  if (minute < sun.sunrise) return "dawn"
  if (minute < sun.goldenMorning.end) return "golden"
  if (minute < sun.goldenEvening.start) return "day"
  if (minute < sun.sunset) return "golden"
  if (minute < sun.blueEvening.start) return "dusk"
  if (minute < sun.blueEvening.end) return "blue"
  return "night"
}

/** The whole day, midnight to midnight, as back-to-back bands of light. */
export function lightBands(sun: SunDay): LightBand[] {
  const edges = [
    0,
    sun.blueMorning.start,
    sun.blueMorning.end,
    sun.sunrise,
    sun.goldenMorning.end,
    sun.goldenEvening.start,
    sun.sunset,
    sun.blueEvening.start,
    sun.blueEvening.end,
    1440,
  ]
  return edges.slice(0, -1).map((start, i) => ({
    phase: phaseAt(start, sun),
    start,
    end: edges[i + 1],
  }))
}

export type PhotoWalkKey =
  "dumboSunrise" | "centralParkMorning" | "brooklynSunset" | "midtownBlueHour" | "villageNight"

export type PhotoWalk = {
  key: PhotoWalkKey
  emoji: string
  line: LineColor
  /** Photo spot slugs, in walking order. */
  stops: string[]
  /** Arrive at the first stop this many minutes from the anchor. */
  anchor: "sunrise" | "sunset"
  offset: number
}

export const PHOTO_WALKS: PhotoWalk[] = [
  {
    key: "dumboSunrise",
    emoji: "🌅",
    line: "orange",
    stops: ["brooklyn-bridge-promenade", "dumbo-washington-street-view", "pebble-beach-dumbo"],
    anchor: "sunrise",
    offset: -20,
  },
  {
    key: "centralParkMorning",
    emoji: "🌳",
    line: "green",
    stops: ["gapstow-bridge-central-park", "bethesda-terrace", "bow-bridge-central-park"],
    anchor: "sunrise",
    offset: 5,
  },
  {
    key: "brooklynSunset",
    emoji: "🌇",
    line: "yellow",
    stops: ["brooklyn-heights-promenade", "pebble-beach-dumbo"],
    anchor: "sunset",
    offset: -35,
  },
  {
    key: "midtownBlueHour",
    emoji: "🌆",
    line: "blue",
    stops: ["tudor-city-bridge", "chrysler-building-view", "times-square"],
    anchor: "sunset",
    offset: -20,
  },
  {
    key: "villageNight",
    emoji: "🏮",
    line: "purple",
    stops: ["washington-square-arch", "mulberry-street-little-italy", "doyers-street"],
    anchor: "sunset",
    offset: -30,
  },
]

/** Long visits are trimmed: on a walk you take the shot and move on. */
const MAX_DWELL = 30
const DEFAULT_DWELL = 20

export type WalkSpot = LatLng & {
  slug: string
  hours: WeeklyHours
  timeNeededMinutes?: number
}

export type TimedStop<S extends WalkSpot> = {
  spot: S
  arrive: number
  phase: LightPhase
  /** Minutes on foot from the previous stop (0 for the first). */
  walk: number
  /** The schedule waited for this spot to open. */
  waitedToOpen: boolean
}

export type TimedWalk<S extends WalkSpot> = {
  walk: PhotoWalk
  start: number
  stops: TimedStop<S>[]
  walkMinutes: number
  km: number
}

/**
 * Today's schedule for a walk: arrive at the first stop at the anchor time,
 * then walk on after each visit, waiting for parks that are still closed.
 * Returns null when a stop is missing from the data.
 */
export function timeWalk<S extends WalkSpot>(
  walk: PhotoWalk,
  sun: SunDay,
  weekday: number,
  spots: Map<string, S>,
): TimedWalk<S> | null {
  const list = walk.stops.map((slug) => spots.get(slug))
  if (list.some((s) => !s)) return null
  const stops: TimedStop<S>[] = []
  let clock = sun[walk.anchor] + walk.offset
  let walked = 0
  let km = 0

  for (const [i, spot] of (list as S[]).entries()) {
    const prev = list[i - 1]
    const leg = prev ? walkMinutes(prev, spot) : 0
    if (prev) km += distanceKm(prev, spot) * 1.3
    let arrive = clock + leg
    const status = getStatusAt(spot.hours, { weekday, minutes: arrive })
    const waitedToOpen =
      (status.state === "closed" || status.state === "opening_soon") &&
      status.opensAt.dayOffset === 0
    if (waitedToOpen) arrive = status.opensAt.minutes
    stops.push({ spot, arrive, phase: phaseAt(arrive, sun), walk: leg, waitedToOpen })
    walked += leg
    clock = arrive + Math.min(spot.timeNeededMinutes ?? DEFAULT_DWELL, MAX_DWELL)
  }
  return {
    walk,
    start: stops[0].arrive,
    stops,
    walkMinutes: walked,
    km: Math.round(km * 10) / 10,
  }
}
