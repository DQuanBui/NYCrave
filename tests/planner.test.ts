import { describe, expect, it } from "vitest"
import { isOpenForWindow } from "@/lib/hours"
import { fixturePlaces } from "./fixtures"
import { estimateTravel } from "@/lib/planner/estimates"
import { fold, localStamp, planToIcs } from "@/lib/planner/ics"
import { parsePlanParams, planQuery, swapQuery } from "@/lib/planner/params"
import { planDay, weekdayOf } from "@/lib/planner/plan"
import type { PlanInput } from "@/lib/planner/types"

const places = fixturePlaces
const MONDAY = "2026-09-28"

const base: PlanInput = {
  date: MONDAY,
  start: 9 * 60,
  end: 22 * 60,
  from: "midtown",
  budget: 150,
  mood: "first_timer",
  interests: [],
  dietary: [],
  pace: "relaxed",
  weatherAware: false,
}

const ids = (input: PlanInput, opts?: Parameters<typeof planDay>[2]) =>
  planDay(input, places, opts).stops.map((s) => `${s.slot}:${s.place.slug}`)

describe("planDay", () => {
  const plan = planDay(base, places)

  it("fills a day", () => {
    expect(plan.stops.length).toBeGreaterThanOrEqual(4)
  })

  it("keeps every stop open for the whole visit", () => {
    const weekday = weekdayOf(MONDAY)
    for (const s of plan.stops) {
      expect(isOpenForWindow(s.place.hours, weekday, s.start, s.end), s.place.slug).toBe(true)
    }
    // Both of these are closed on Mondays in the seed data
    const slugs = plan.stops.map((s) => s.place.slug)
    expect(slugs).not.toContain("sample-taco-window")
    expect(slugs).not.toContain("sample-history-museum")
  })

  it("runs in order inside the chosen hours, leaving time to travel", () => {
    let t = base.start
    for (const s of plan.stops) {
      expect(s.start).toBeGreaterThanOrEqual(t + s.travel.minutes)
      expect(s.end).toBeGreaterThan(s.start)
      t = s.end
    }
    expect(t).toBeLessThanOrEqual(base.end)
  })

  it("never visits a place twice", () => {
    const slugs = plan.stops.map((s) => s.place.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it("stays within budget, counting fares", () => {
    const tight = planDay({ ...base, budget: 20 }, places)
    const spent = tight.stops.reduce((sum, s) => sum + s.cost + s.fare, 0)
    expect(spent).toBe(tight.totalCost)
    expect(tight.totalCost).toBeLessThanOrEqual(20)
  })

  it("respects dietary needs at food and drink stops", () => {
    const vegan = planDay({ ...base, dietary: ["vegan"] }, places)
    for (const s of vegan.stops) {
      if (s.place.category === "restaurant" || s.place.category === "drink") {
        expect(s.place.dietary).toContain("vegan")
      }
    }
  })

  it("is deterministic", () => {
    expect(ids(base)).toEqual(ids(base))
  })

  it("favors indoor stops when rain is likely", () => {
    const outdoor = (rain: boolean) =>
      planDay({ ...base, weatherAware: true, interests: ["photos", "parks", "museums"] }, places, {
        rainLikely: rain,
      }).stops.filter((s) => s.place.category === "park_pier" || s.place.category === "photo_spot")
        .length
    expect(outdoor(true)).toBeLessThan(outdoor(false))
  })

  it("plans past midnight", () => {
    const late = planDay({ ...base, start: 20 * 60, end: 26 * 60 }, places)
    expect(late.stops.length).toBeGreaterThan(0)
    expect(late.stops.at(-1)!.end).toBeLessThanOrEqual(26 * 60)
  })

  it("adds a second afternoon stop at a packed pace", () => {
    const packed = planDay({ ...base, pace: "packed", start: 8 * 60 }, places)
    expect(packed.stops.length).toBeGreaterThanOrEqual(plan.stops.length)
  })
})

describe("swap", () => {
  it("replaces one stop and keeps the rest", () => {
    const plan = planDay(base, places)
    const target = plan.stops.find((s) => s.slot === "lunch") ?? plan.stops[0]
    const { input, adjustments } = parsePlanParams(swapQuery(plan, target.slot, {}))
    const swapped = planDay(input, places, adjustments)

    const next = swapped.stops.find((s) => s.slot === target.slot)
    expect(next?.place.id).not.toBe(target.place.id)
    for (const s of plan.stops.filter((s) => s.slot !== target.slot)) {
      expect(swapped.stops.find((x) => x.slot === s.slot)?.place.id).toBe(s.place.id)
    }
  })
})

describe("params", () => {
  it("round-trips a plan through the URL", () => {
    const input: PlanInput = {
      ...base,
      interests: ["food", "views"],
      dietary: ["vegetarian"],
      pace: "packed",
      end: 25 * 60,
    }
    expect(parsePlanParams(planQuery(input)).input).toEqual(input)
  })

  it("falls back to defaults for bad values", () => {
    const { input, submitted } = parsePlanParams({
      b: "-5",
      m: "grumpy",
      from: "atlantis",
      s: "99:99",
    })
    expect(submitted).toBe(false)
    expect(input.mood).toBe("first_timer")
    expect(input.from).toBe("midtown")
    expect(input.start).toBe(9 * 60)
    expect(input.budget).toBe(120)
  })
})

describe("estimateTravel", () => {
  it("walks short hops and rides the subway for long ones", () => {
    const soho = { lat: 40.7233, lng: -74.003 }
    // SoHo to Chinatown is about a 15-minute walk
    expect(estimateTravel(soho, { lat: 40.7158, lng: -73.997 }).mode).toBe("walk")
    expect(estimateTravel(soho, { lat: 40.758, lng: -73.8303 }).mode).toBe("subway")
  })
})

describe("ics", () => {
  const plan = planDay(base, places)
  const ics = planToIcs(plan, {
    siteUrl: "https://nycrave.example",
    slotLabel: (s) => s,
    now: new Date("2026-09-26T12:00:00Z"),
  })

  it("has one event per stop in New York time", () => {
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(plan.stops.length)
    expect(ics).toContain("BEGIN:VTIMEZONE")
    expect(ics).toMatch(/DTSTART;TZID=America\/New_York:20260928T\d{6}/)
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true)
  })

  it("rolls times past midnight into the next day", () => {
    expect(localStamp("2026-09-28", 25 * 60 + 30)).toBe("20260929T013000")
    expect(localStamp("2026-12-31", 24 * 60)).toBe("20270101T000000")
  })

  it("folds long lines to 75 octets", () => {
    const folded = fold(`DESCRIPTION:${"phở ".repeat(40)}`)
    for (const line of folded.split("\r\n")) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
    }
  })
})
