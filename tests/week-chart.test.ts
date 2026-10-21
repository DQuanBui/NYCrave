import { describe, expect, it } from "vitest"
import { weekSpans } from "@/lib/week-chart"
import type { WeeklyHours } from "@/types/place"

const closed = { sun: [], mon: [], tue: [], wed: [], thu: [], fri: [], sat: [] }

describe("week at a glance", () => {
  it("cuts late nights at midnight and carries them into the next morning", () => {
    const hours: WeeklyHours = { ...closed, fri: [{ open: "18:00", close: "02:00" }] }
    const days = weekSpans(hours)
    expect(days[5]).toEqual([{ start: 1080, end: 1440, carried: false }])
    expect(days[6]).toEqual([{ start: 0, end: 120, carried: true }])
  })

  it("wraps Saturday night into Sunday", () => {
    const hours: WeeklyHours = { ...closed, sat: [{ open: "20:00", close: "04:00" }] }
    expect(weekSpans(hours)[0]).toEqual([{ start: 0, end: 240, carried: true }])
  })

  it("treats 00:00 to 24:00 as the whole day", () => {
    const hours: WeeklyHours = { ...closed, mon: [{ open: "00:00", close: "24:00" }] }
    expect(weekSpans(hours)[1]).toEqual([{ start: 0, end: 1440, carried: false }])
  })
})
