import { toMinutes } from "@/lib/hours"
import { WEEKDAYS } from "@/types/enums"
import type { WeeklyHours } from "@/types/place"

export type Span = { start: number; end: number; carried: boolean }

/**
 * Each weekday's open stretches as minute spans within that calendar day, for a
 * week-at-a-glance chart. Hours that run past midnight are cut at midnight and
 * carried into the next morning (marked `carried`), the way the place is open.
 */
export function weekSpans(hours: WeeklyHours): Span[][] {
  const days: Span[][] = WEEKDAYS.map(() => [])
  WEEKDAYS.forEach((day, i) => {
    for (const r of hours[day]) {
      const start = toMinutes(r.open)
      let end = toMinutes(r.close)
      if (end <= start) end += 1440
      days[i].push({ start, end: Math.min(end, 1440), carried: false })
      if (end > 1440) days[(i + 1) % 7].push({ start: 0, end: end - 1440, carried: true })
    }
  })
  return days.map((spans) => spans.sort((a, b) => a.start - b.start))
}
