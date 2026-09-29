import { describe, expect, it } from "vitest"
import { toCard } from "@/lib/card-place"
import { getStatusAt, nycClock } from "@/lib/hours"
import { getPlaces } from "@/lib/places"
import { afterFor, whatsNext, type NextPlace } from "@/lib/whats-next"

const all = await getPlaces()
const places: NextPlace[] = all.map((p) => ({ ...toCard(p), trendingScore: p.trendingScore }))
const at = (slug: string) => places.find((p) => p.slug === slug)!

// Saturday, October 3, 2026 (New York is on daylight time: UTC-4)
const SAT_7PM = new Date("2026-10-03T23:00:00Z")
const SAT_1130PM = new Date("2026-10-04T03:30:00Z")
const SAT_10AM = new Date("2026-10-03T14:00:00Z")

function expectSound(lanes: ReturnType<typeof whatsNext>, leave: Date, exclude: string[] = []) {
  const seen = new Set<string>()
  for (const lane of lanes) {
    expect(lane.picks.length).toBeGreaterThan(0)
    for (const s of lane.picks) {
      expect(seen.has(s.place.slug), s.place.slug).toBe(false)
      seen.add(s.place.slug)
      expect(exclude).not.toContain(s.place.slug)
      expect(s.walkMinutes).toBeLessThanOrEqual(25)
      const arrive = nycClock(new Date(leave.getTime() + s.walkMinutes * 60_000))
      const status = getStatusAt(s.place.hours, arrive)
      if (status.state !== "open_24h") {
        expect(status.state === "open" || status.state === "closing_soon", s.place.slug).toBe(true)
        if ("minutesLeft" in status) expect(status.minutesLeft).toBeGreaterThanOrEqual(30)
      }
    }
  }
}

describe("what's next", () => {
  it("after dinner on the Lower East Side: dessert, coffee, drinks or a walk", () => {
    const katz = at("katzs-delicatessen")
    const lanes = whatsNext(places, {
      from: katz,
      after: "ate",
      leaveAt: SAT_7PM,
      exclude: [katz.slug],
    })
    expect(lanes.length).toBeGreaterThanOrEqual(2)
    for (const l of lanes) expect(["sweet", "coffee", "drinks", "stroll"]).toContain(l.key)
    expectSound(lanes, SAT_7PM, [katz.slug])
  })

  it("late at night, only late food, bars and places that stay open", () => {
    const deathAndCo = at("death-and-co-east-village")
    const lanes = whatsNext(places, { from: deathAndCo, after: "drinks", leaveAt: SAT_1130PM })
    expect(lanes.length).toBeGreaterThan(0)
    for (const l of lanes) expect(["lateBite", "drinks", "stroll"]).toContain(l.key)
    expectSound(lanes, SAT_1130PM)
  })

  it("just exploring in the morning starts with coffee and breakfast", () => {
    const lanes = whatsNext(places, {
      from: at("washington-square-park"),
      after: "exploring",
      leaveAt: SAT_10AM,
    })
    for (const l of lanes) expect(["coffee", "eat", "stroll", "see"]).toContain(l.key)
    expectSound(lanes, SAT_10AM)
  })

  it("keeps each lane short and prefers closer places", () => {
    const lanes = whatsNext(places, {
      from: at("the-met-fifth-avenue"),
      after: "museum",
      leaveAt: SAT_10AM,
      perLane: 2,
    })
    for (const l of lanes) expect(l.picks.length).toBeLessThanOrEqual(2)
    expectSound(lanes, SAT_10AM)
  })

  it("suggests nothing in the middle of the harbor", () => {
    expect(
      whatsNext(places, { from: { lat: 40.58, lng: -74.08 }, after: "ate", leaveAt: SAT_7PM }),
    ).toEqual([])
  })

  it("reads what you just did from the place", () => {
    expect(afterFor(at("katzs-delicatessen"))).toBe("ate")
    expect(afterFor(at("death-and-co-east-village"))).toBe("drinks")
    expect(afterFor(at("devocion-williamsburg"))).toBe("coffee")
    expect(afterFor(at("moma"))).toBe("museum")
    expect(afterFor(at("bow-bridge-central-park"))).toBe("park")
    expect(afterFor(at("strand-bookstore"))).toBe("shopping")
  })
})
