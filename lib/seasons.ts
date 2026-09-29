import SunCalc from "suncalc"
import { iso, nthWeekday } from "@/lib/holidays"
import type { LineColor } from "@/lib/lines"
import { sunDay } from "@/lib/sun"

/**
 * New York's calendar of things worth planning a trip around. Dates come from
 * rules (the first Sunday in November, the fourth Thursday...) or from the sun,
 * so the page never goes stale. Nature's timing varies year to year, so those
 * windows are marked approximate.
 */

export type SeasonKey =
  | "cherryBlossoms"
  | "manhattanhengeMay"
  | "beachSeason"
  | "manhattanhengeJuly"
  | "fourthOfJuly"
  | "fallFoliage"
  | "marathon"
  | "thanksgivingParade"
  | "holidayWindows"
  | "newYearsEve"

export type Window = { start: string; end: string }

export type SeasonEvent = {
  key: SeasonKey
  emoji: string
  line: LineColor
  /** The dates move with nature or are only announced each year. */
  approximate: boolean
  /** Places on NYCrave where this happens, by slug. */
  places: string[]
  window: (year: number) => Window
}

const DAY_MS = 86_400_000
const toUTC = (date: string) => Date.parse(`${date}T00:00:00Z`)
const addDays = (date: string, n: number) =>
  new Date(toUTC(date) + n * DAY_MS).toISOString().slice(0, 10)
/** Whole days from `a` to `b` (both YYYY-MM-DD). */
export const daysBetween = (a: string, b: string) => Math.round((toUTC(b) - toUTC(a)) / DAY_MS)

// ---------- Manhattanhenge ----------

/** Manhattan's street grid runs about 29 degrees clockwise from true east-west. */
const GRID_AZIMUTH = 299.66
const MIDTOWN = { lat: 40.7505, lng: -73.9934 }

/** Compass bearing of the sun as it half-sets (center on the horizon), in degrees. */
function halfSunsetAzimuth(date: string): number {
  const times = SunCalc.getTimes(new Date(`${date}T16:00:00Z`), MIDTOWN.lat, MIDTOWN.lng)
  let t = times.sunset.getTime()
  // Walk back from sunset (upper limb) until the sun's center sits on the horizon
  for (let i = 0; i < 120; i++) {
    const p = SunCalc.getPosition(new Date(t), MIDTOWN.lat, MIDTOWN.lng)
    if ((p.altitude * 180) / Math.PI >= -0.56) {
      return ((p.azimuth * 180) / Math.PI + 180) % 360
    }
    t -= 15_000
  }
  return 0
}

/** The evening in a date range when the setting sun lines up best with the streets. */
function bestAligned(from: string, days: number): string {
  let best = from
  let bestGap = Infinity
  for (let i = 0; i < days; i++) {
    const d = addDays(from, i)
    const gap = Math.abs(halfSunsetAzimuth(d) - GRID_AZIMUTH)
    if (gap < bestGap) {
      bestGap = gap
      best = d
    }
  }
  return best
}

/**
 * Manhattanhenge's two evenings (full sun and half sun) around late May and
 * mid-July. An astronomical estimate: exact dates can differ by a day from the
 * ones the American Museum of Natural History announces.
 */
export function manhattanhenge(year: number): { may: Window; july: Window } {
  const may = bestAligned(iso(year, 5, 20), 20)
  const july = bestAligned(iso(year, 7, 1), 25)
  // In May the sun is moving north along the horizon, so the full-sun evening
  // follows the half-sun one; in July it comes first.
  return {
    may: { start: may, end: addDays(may, 1) },
    july: { start: addDays(july, -1), end: july },
  }
}

/** Estimated sunset in Midtown on a date, in minutes after midnight. */
export const sunsetMinutes = (date: string) => sunDay(date, MIDTOWN).sunset

/** Streets with a clear view west to New Jersey, as recommended for Manhattanhenge. */
export const HENGE_STREETS = ["14th", "23rd", "34th", "42nd", "57th"] as const

// ---------- The calendar ----------

const fixed =
  (month: number, day: number, toMonth = month, toDay = day) =>
  (year: number) => ({
    start: iso(year, month, day),
    end: iso(year, toMonth, toDay),
  })

export const SEASON_EVENTS: SeasonEvent[] = [
  {
    key: "cherryBlossoms",
    emoji: "🌸",
    line: "purple",
    approximate: true,
    places: ["brooklyn-botanic-garden", "central-park"],
    window: fixed(4, 5, 5, 5),
  },
  {
    key: "manhattanhengeMay",
    emoji: "🌇",
    line: "orange",
    approximate: true,
    places: ["tudor-city-bridge"],
    window: (year) => manhattanhenge(year).may,
  },
  {
    key: "beachSeason",
    emoji: "🏖️",
    line: "yellow",
    approximate: true,
    places: ["coney-island-beach-and-boardwalk", "pelham-bay-park"],
    // Memorial Day weekend to Labor Day
    window: (year) => ({
      start: addDays(nthWeekday(year, 5, 1, -1), -2),
      end: nthWeekday(year, 9, 1, 1),
    }),
  },
  {
    key: "manhattanhengeJuly",
    emoji: "🌆",
    line: "orange",
    approximate: true,
    places: ["tudor-city-bridge"],
    window: (year) => manhattanhenge(year).july,
  },
  {
    key: "fourthOfJuly",
    emoji: "🎆",
    line: "red",
    approximate: false,
    places: ["brooklyn-bridge-park", "gantry-plaza-state-park"],
    window: fixed(7, 4),
  },
  {
    key: "fallFoliage",
    emoji: "🍁",
    line: "brown",
    approximate: true,
    places: ["central-park", "fort-tryon-park", "gapstow-bridge-central-park", "wave-hill"],
    window: fixed(10, 20, 11, 20),
  },
  {
    key: "marathon",
    emoji: "🏃",
    line: "blue",
    approximate: false,
    places: ["central-park"],
    // The first Sunday in November
    window: (year) => {
      const d = nthWeekday(year, 11, 0, 1)
      return { start: d, end: d }
    },
  },
  {
    key: "thanksgivingParade",
    emoji: "🎈",
    line: "red",
    approximate: false,
    places: ["macys-herald-square"],
    // The fourth Thursday in November
    window: (year) => {
      const d = nthWeekday(year, 11, 4, 4)
      return { start: d, end: d }
    },
  },
  {
    key: "holidayWindows",
    emoji: "🎄",
    line: "green",
    approximate: true,
    places: ["macys-herald-square", "bryant-park"],
    // Thanksgiving through the first week of January
    window: (year) => ({ start: nthWeekday(year, 11, 4, 4), end: iso(year + 1, 1, 6) }),
  },
  {
    key: "newYearsEve",
    emoji: "🎉",
    line: "yellow",
    approximate: false,
    places: ["times-square"],
    window: fixed(12, 31),
  },
]

export type SeasonStatus = {
  event: SeasonEvent
  window: Window
  /** 0 while it is happening. */
  daysUntil: number
  happening: boolean
}

/** Where an event stands on a New York date: happening now, or its next window. */
export function seasonStatus(event: SeasonEvent, today: string): SeasonStatus {
  const year = Number(today.slice(0, 4))
  for (const y of [year - 1, year, year + 1]) {
    const window = event.window(y)
    if (window.end < today) continue
    const happening = window.start <= today
    return { event, window, happening, daysUntil: happening ? 0 : daysBetween(today, window.start) }
  }
  // Unreachable for yearly events; fall back to next year's window
  const window = event.window(year + 1)
  return { event, window, happening: false, daysUntil: daysBetween(today, window.start) }
}

/** Every event, what is on now first, then by how soon it starts. */
export function upcomingSeasons(today: string): SeasonStatus[] {
  return SEASON_EVENTS.map((e) => seasonStatus(e, today)).sort(
    (a, b) => Number(b.happening) - Number(a.happening) || a.daysUntil - b.daysUntil,
  )
}

/** "Oct 20 – Nov 20" in the visitor's language. */
export function formatWindow(window: Window, locale: string): string {
  const fmt = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", timeZone: "UTC" })
  const start = new Date(`${window.start}T00:00:00Z`)
  if (window.start === window.end) return fmt.format(start)
  return fmt.formatRange(start, new Date(`${window.end}T00:00:00Z`))
}
