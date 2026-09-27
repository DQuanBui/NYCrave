import { describe, expect, it } from "vitest"
import {
  formatClockTime,
  formatRange,
  getOpenStatus,
  getStatusAt,
  isAlwaysOpen,
  isOpenForWindow,
  isOpenLaterToday,
  nycClock,
} from "@/lib/hours"
import type { WeeklyHours } from "@/types/place"

const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const
const every = (open: string, close: string): WeeklyHours =>
  Object.fromEntries(DAYS.map((d) => [d, [{ open, close }]])) as WeeklyHours
const closedAllWeek = (): WeeklyHours =>
  Object.fromEntries(DAYS.map((d) => [d, []])) as unknown as WeeklyHours

const SUN = 0
const MON = 1
const TUE = 2
const at = (weekday: number, hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number)
  return { weekday, minutes: h * 60 + m }
}

describe("nycClock", () => {
  it("converts UTC instants to New York wall time (EDT)", () => {
    // 2026-09-28T03:30Z is Sunday 11:30 PM in New York (UTC-4)
    expect(nycClock(new Date("2026-09-28T03:30:00Z"))).toEqual({
      weekday: SUN,
      minutes: 23 * 60 + 30,
    })
  })

  it("follows the DST switch back to EST", () => {
    // DST ends 2026-11-01; noon UTC is 7 AM EST
    expect(nycClock(new Date("2026-11-01T12:00:00Z"))).toEqual({ weekday: SUN, minutes: 7 * 60 })
  })

  it("reports midnight as 0, not 24", () => {
    expect(nycClock(new Date("2026-09-29T04:00:00Z"))).toEqual({ weekday: TUE, minutes: 0 })
  })
})

describe("getStatusAt", () => {
  const daily = every("10:00", "22:00")

  it("is open with the closing time mid-day", () => {
    expect(getStatusAt(daily, at(MON, "12:00"))).toEqual({
      state: "open",
      closesAt: { dayOffset: 0, minutes: 22 * 60 },
      minutesLeft: 600,
    })
  })

  it("flags closing soon inside the last hour", () => {
    expect(getStatusAt(daily, at(MON, "21:30"))).toMatchObject({
      state: "closing_soon",
      minutesLeft: 30,
    })
  })

  it("treats the closing minute as closed and points to tomorrow", () => {
    expect(getStatusAt(daily, at(MON, "22:00"))).toEqual({
      state: "closed",
      opensAt: { dayOffset: 1, minutes: 10 * 60 },
      minutesUntil: 12 * 60,
    })
  })

  it("flags opening soon", () => {
    expect(getStatusAt(daily, at(MON, "09:30"))).toMatchObject({
      state: "opening_soon",
      minutesUntil: 30,
    })
  })

  it("carries overnight hours into the next morning", () => {
    const ramen: WeeklyHours = { ...closedAllWeek(), mon: [{ open: "17:00", close: "01:00" }] }
    expect(getStatusAt(ramen, at(TUE, "00:30"))).toEqual({
      state: "closing_soon",
      closesAt: { dayOffset: 0, minutes: 60 },
      minutesLeft: 30,
    })
    expect(getStatusAt(ramen, at(TUE, "01:00")).state).toBe("closed")
  })

  it("uses late Saturday hours early on Sunday", () => {
    const bar: WeeklyHours = {
      ...closedAllWeek(),
      sat: [{ open: "17:00", close: "03:00" }],
      sun: [{ open: "17:00", close: "23:00" }],
    }
    expect(getStatusAt(bar, at(SUN, "02:00"))).toMatchObject({
      state: "closing_soon",
      minutesLeft: 60,
    })
    expect(getStatusAt(bar, at(SUN, "04:00"))).toMatchObject({
      state: "closed",
      opensAt: { dayOffset: 0, minutes: 17 * 60 },
    })
  })

  it("merges ranges that meet at midnight", () => {
    const hours: WeeklyHours = {
      ...closedAllWeek(),
      mon: [{ open: "18:00", close: "24:00" }],
      tue: [{ open: "00:00", close: "02:00" }],
    }
    expect(getStatusAt(hours, at(MON, "23:30"))).toEqual({
      state: "open",
      closesAt: { dayOffset: 1, minutes: 120 },
      minutesLeft: 150,
    })
  })

  it("handles split shifts", () => {
    const hours: WeeklyHours = {
      ...closedAllWeek(),
      mon: [
        { open: "11:00", close: "14:00" },
        { open: "17:00", close: "22:00" },
      ],
    }
    expect(getStatusAt(hours, at(MON, "15:00"))).toMatchObject({
      state: "closed",
      opensAt: { dayOffset: 0, minutes: 17 * 60 },
    })
  })

  it("recognizes 24/7 places", () => {
    expect(getStatusAt(every("00:00", "24:00"), at(MON, "03:00"))).toEqual({ state: "open_24h" })
    expect(getStatusAt(every("00:00", "00:00"), at(MON, "03:00"))).toEqual({ state: "open_24h" })
    expect(isAlwaysOpen(every("00:00", "24:00"))).toBe(true)
    expect(isAlwaysOpen(every("06:00", "01:00"))).toBe(false)
  })

  it("finds the next opening days away", () => {
    const saturdayOnly: WeeklyHours = {
      ...closedAllWeek(),
      sat: [{ open: "10:00", close: "18:00" }],
    }
    expect(getStatusAt(saturdayOnly, at(MON, "12:00"))).toMatchObject({
      state: "closed",
      opensAt: { dayOffset: 5, minutes: 600 },
    })
  })

  it("reports places with no hours", () => {
    expect(getStatusAt(closedAllWeek(), at(MON, "12:00"))).toEqual({
      state: "closed_indefinitely",
    })
  })

  it("works from a Date in New York time", () => {
    // Monday 2026-09-28 12:00 EDT
    expect(getOpenStatus(daily, new Date("2026-09-28T16:00:00Z")).state).toBe("open")
  })
})

describe("window helpers", () => {
  const ramen: WeeklyHours = { ...closedAllWeek(), mon: [{ open: "17:00", close: "01:00" }] }

  it("checks a visit fits inside opening hours, across midnight", () => {
    expect(isOpenForWindow(ramen, MON, 23 * 60, 24 * 60 + 45)).toBe(true)
    expect(isOpenForWindow(ramen, MON, 16 * 60 + 30, 18 * 60)).toBe(false)
    expect(isOpenForWindow(ramen, MON, 24 * 60 + 30, 25 * 60 + 30)).toBe(false)
  })

  it("knows whether a place still opens today", () => {
    expect(isOpenLaterToday(ramen, at(MON, "12:00"))).toBe(true)
    expect(isOpenLaterToday(ramen, at(TUE, "00:30"))).toBe(true)
    expect(isOpenLaterToday(ramen, at(TUE, "02:00"))).toBe(false)
  })
})

describe("formatting", () => {
  it("drops minutes on the hour", () => {
    expect(formatClockTime(17 * 60)).toBe("5 PM")
    expect(formatClockTime(22 * 60 + 30)).toBe("10:30 PM")
    expect(formatClockTime(24 * 60)).toBe("12 AM")
  })

  it("formats ranges", () => {
    expect(formatRange({ open: "17:00", close: "01:00" })).toBe("5 PM–1 AM")
    expect(formatRange({ open: "00:00", close: "24:00" })).toBe("24h")
  })
})
