"use client"

import { useLocale } from "next-intl"
import { useNow } from "@/hooks/use-now"
import { formatClockTime, nycClock } from "@/lib/hours"
import { LINES, type LineColor } from "@/lib/lines"
import { cn } from "@/lib/utils"
import { weekSpans } from "@/lib/week-chart"
import type { WeeklyHours } from "@/types/place"

/** Monday-first, like the hours table below it. */
const ORDER = [1, 2, 3, 4, 5, 6, 0]
const pct = (minutes: number) => `${(minutes / 1440) * 100}%`

/**
 * The week at a glance: a bar per day with the open hours filled in the line's
 * color, late nights carried into the next morning, and a mark for right now.
 * Decorative: the hours table next to it says the same in words.
 */
export function WeekChart({ hours, line }: { hours: WeeklyHours; line: LineColor }) {
  const locale = useLocale()
  const now = useNow()
  const clock = now ? nycClock(now) : null
  const days = weekSpans(hours)
  const initial = new Intl.DateTimeFormat(locale, { weekday: "narrow", timeZone: "UTC" })

  return (
    <div aria-hidden className="space-y-1.5">
      {ORDER.map((index) => {
        const today = clock?.weekday === index
        return (
          <div key={index} className="flex items-center gap-2">
            <span
              className={cn(
                "w-4 shrink-0 text-center text-xs font-semibold text-muted-foreground",
                today && "text-foreground",
              )}
            >
              {initial.format(new Date(Date.UTC(2023, 0, 1 + index)))}
            </span>
            <div
              className={cn(
                "relative h-3 flex-1 overflow-hidden rounded-full bg-muted",
                today && "ring-2 ring-foreground/70",
              )}
            >
              {days[index].map((span) => (
                <span
                  key={`${span.start}-${span.end}`}
                  className={cn(
                    "absolute inset-y-0 rounded-full",
                    LINES[line].bg,
                    span.carried && "opacity-60",
                  )}
                  style={{ left: pct(span.start), width: pct(span.end - span.start) }}
                />
              ))}
              {today && clock ? (
                <span
                  className="absolute inset-y-0 w-0.5 bg-foreground"
                  style={{ left: pct(clock.minutes) }}
                />
              ) : null}
            </div>
          </div>
        )
      })}
      <div className="flex justify-between pl-6 text-[0.65rem] font-semibold text-muted-foreground tabular-nums">
        {[0, 6, 12, 18, 24].map((h) => (
          <span key={h}>{formatClockTime((h % 24) * 60, locale)}</span>
        ))}
      </div>
    </div>
  )
}
