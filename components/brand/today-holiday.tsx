"use client"

import { HolidayNote } from "@/components/brand/holiday-note"
import { useNow } from "@/hooks/use-now"
import { holidayOn } from "@/lib/holidays"
import { nycDateString } from "@/lib/hours"

/**
 * The holiday note for today in New York, worked out in the browser so a
 * cached page never shows yesterday's holiday (or misses today's).
 */
export function TodayHoliday({ className }: { className?: string }) {
  const now = useNow()
  const holiday = now ? holidayOn(nycDateString(now)) : undefined
  return holiday ? <HolidayNote holiday={holiday} className={className} /> : null
}
