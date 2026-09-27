import { WEEKDAYS } from "@/types/enums"
import type { TimeRange, WeeklyHours } from "@/types/place"

export const NYC_TZ = "America/New_York"
const DAY = 1440

export type NycClock = {
  /** 0 = Sunday, matching WEEKDAYS. */
  weekday: number
  /** Minutes since local midnight in New York. */
  minutes: number
}

const clockFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: NYC_TZ,
  weekday: "short",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
})

const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const dateFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: NYC_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

/** The New York calendar date for an instant, as YYYY-MM-DD. */
export function nycDateString(date: Date): string {
  return dateFormat.format(date)
}

/** Wall-clock weekday and time in New York for an instant, DST-aware. */
export function nycClock(date: Date): NycClock {
  const parts = clockFormat.formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ""
  return {
    weekday: SHORT_DAYS.indexOf(get("weekday")),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  }
}

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

/** [start, end) in minutes relative to midnight of the reference day. */
type Interval = [number, number]

function rangeToInterval(range: TimeRange, dayOffset: number): Interval {
  const start = toMinutes(range.open)
  let end = toMinutes(range.close)
  if (end <= start) end += DAY // runs past midnight (00:00–00:00 is a full day)
  return [dayOffset * DAY + start, dayOffset * DAY + end]
}

/**
 * Opening intervals from the day before `weekday` through a week after, merged so
 * back-to-back ranges (e.g. Mon 18:00–24:00 + Tue 00:00–02:00) read as one stretch.
 */
function intervalsAround(hours: WeeklyHours, weekday: number): Interval[] {
  const raw: Interval[] = []
  for (let offset = -1; offset <= 7; offset++) {
    const key = WEEKDAYS[(((weekday + offset) % 7) + 7) % 7]
    for (const range of hours[key]) raw.push(rangeToInterval(range, offset))
  }
  raw.sort((a, b) => a[0] - b[0])

  const merged: Interval[] = []
  for (const interval of raw) {
    const last = merged.at(-1)
    if (last && interval[0] <= last[1]) last[1] = Math.max(last[1], interval[1])
    else merged.push([...interval])
  }
  return merged
}

const WINDOW_END = 8 * DAY

/** A point in time relative to the reference day: 0 = today, 1 = tomorrow. */
export type RelativeTime = { dayOffset: number; minutes: number }

function relative(abs: number): RelativeTime {
  const dayOffset = Math.floor(abs / DAY)
  return { dayOffset, minutes: abs - dayOffset * DAY }
}

export type OpenStatus =
  | { state: "open_24h" }
  | { state: "open" | "closing_soon"; closesAt: RelativeTime; minutesLeft: number }
  | { state: "closed" | "opening_soon"; opensAt: RelativeTime; minutesUntil: number }
  | { state: "closed_indefinitely" }

export const SOON_MINUTES = 60

export function getStatusAt(
  hours: WeeklyHours,
  clock: NycClock,
  soonMinutes = SOON_MINUTES,
): OpenStatus {
  const now = clock.minutes
  const intervals = intervalsAround(hours, clock.weekday)

  const current = intervals.find(([start, end]) => start <= now && now < end)
  if (current) {
    if (current[1] >= WINDOW_END) return { state: "open_24h" }
    const minutesLeft = current[1] - now
    return {
      state: minutesLeft <= soonMinutes ? "closing_soon" : "open",
      closesAt: relative(current[1]),
      minutesLeft,
    }
  }

  const next = intervals.find(([start]) => start > now)
  if (!next) return { state: "closed_indefinitely" }
  const minutesUntil = next[0] - now
  return {
    state: minutesUntil <= soonMinutes ? "opening_soon" : "closed",
    opensAt: relative(next[0]),
    minutesUntil,
  }
}

export function getOpenStatus(hours: WeeklyHours, now: Date = new Date()): OpenStatus {
  return getStatusAt(hours, nycClock(now))
}

export function isOpen(status: OpenStatus): boolean {
  return status.state === "open" || status.state === "closing_soon" || status.state === "open_24h"
}

/** True if the place is open for the whole visit window (minutes on `weekday`; may exceed 1440). */
export function isOpenForWindow(
  hours: WeeklyHours,
  weekday: number,
  startMinutes: number,
  endMinutes: number,
): boolean {
  return intervalsAround(hours, weekday).some(
    ([start, end]) => start <= startMinutes && endMinutes <= end,
  )
}

/** The earliest start at or after `fromMinutes` that keeps a visit of `duration` inside opening hours. */
export function earliestOpenStart(
  hours: WeeklyHours,
  weekday: number,
  fromMinutes: number,
  duration: number,
): number | null {
  let best: number | null = null
  for (const [start, end] of intervalsAround(hours, weekday)) {
    const at = Math.max(fromMinutes, start)
    if (at + duration <= end && (best === null || at < best)) best = at
  }
  return best
}

/** True if the place is open now or opens again before midnight. */
export function isOpenLaterToday(hours: WeeklyHours, clock: NycClock): boolean {
  return intervalsAround(hours, clock.weekday).some(
    ([start, end]) => end > clock.minutes && start < DAY,
  )
}

export function isAlwaysOpen(hours: WeeklyHours): boolean {
  return getStatusAt(hours, { weekday: 0, minutes: 0 }).state === "open_24h"
}

/** "5 PM", "10:30 PM", "17:00" — locale-aware, minutes dropped on the hour. */
export function formatClockTime(minutes: number, locale = "en-US"): string {
  const m = ((minutes % DAY) + DAY) % DAY
  const date = new Date(Date.UTC(2000, 0, 1, Math.floor(m / 60), m % 60))
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: m % 60 === 0 ? undefined : "2-digit",
    timeZone: "UTC",
  }).format(date)
}

export function formatRange(range: TimeRange, locale?: string): string {
  if (range.open === "00:00" && (range.close === "24:00" || range.close === "00:00")) return "24h"
  return `${formatClockTime(toMinutes(range.open), locale)}–${formatClockTime(toMinutes(range.close), locale)}`
}
