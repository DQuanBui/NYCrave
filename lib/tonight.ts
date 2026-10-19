import { getStatusAt, isOpen, type NycClock, type OpenStatus } from "@/lib/hours"
import type { Category, WeeklyHours } from "@/types/place"

/**
 * Open late: what is still open at a given hour tonight. Times are minutes from
 * the midnight that starts the evening's day, so 2 AM is 26 * 60.
 */
export const LATE_SLOTS = [22 * 60, 24 * 60, 26 * 60, 28 * 60] as const
export type LateSlot = (typeof LATE_SLOTS)[number]

/** Streets and parks are open all night or close at 1 AM: not what "open late" means. */
export const LATE_CATEGORIES: Category[] = ["restaurant", "drink", "attraction", "shopping"]

/** Before 5 AM, "tonight" is the night already under way, which began the day before. */
export function eveningWeekday(clock: NycClock): number {
  return clock.minutes < 5 * 60 ? (clock.weekday + 6) % 7 : clock.weekday
}

export function statusAt(hours: WeeklyHours, evening: number, slot: number): OpenStatus {
  return getStatusAt(hours, {
    weekday: (evening + Math.floor(slot / 1440)) % 7,
    minutes: slot % 1440,
  })
}

export const openAt = (hours: WeeklyHours, evening: number, slot: number) =>
  isOpen(statusAt(hours, evening, slot))

/** Places worth listing at all: open at 10 PM on at least one night of the week. */
export function lateCandidates<P extends { category: Category; hours: WeeklyHours }>(
  places: P[],
): P[] {
  return places.filter(
    (p) =>
      LATE_CATEGORIES.includes(p.category) &&
      [0, 1, 2, 3, 4, 5, 6].some((d) => openAt(p.hours, d, LATE_SLOTS[0])),
  )
}
