import { describe, expect, it } from "vitest"
import { seedPlaces } from "@/lib/places"
import { eveningWeekday, lateCandidates, openAt, statusAt } from "@/lib/tonight"

const places = seedPlaces()
const bySlug = (slug: string) => places.find((p) => p.slug === slug)!
const FRIDAY = 5

describe("open late", () => {
  it("treats the small hours as part of the night before", () => {
    expect(eveningWeekday({ weekday: 6, minutes: 90 })).toBe(5)
    expect(eveningWeekday({ weekday: 6, minutes: 20 * 60 })).toBe(6)
  })

  it("follows hours past midnight into the next day", () => {
    // McSorley's: open until 1 AM
    const mcsorleys = bySlug("mcsorleys-old-ale-house")
    expect(openAt(mcsorleys.hours, FRIDAY, 24 * 60)).toBe(true)
    expect(openAt(mcsorleys.hours, FRIDAY, 26 * 60)).toBe(false)
  })

  it("says when a place closes", () => {
    const status = statusAt(bySlug("mcsorleys-old-ale-house").hours, FRIDAY, 24 * 60)
    expect(status.state === "open" || status.state === "closing_soon").toBe(true)
    if (status.state === "open" || status.state === "closing_soon")
      expect(status.closesAt.minutes).toBe(60)
  })

  it("skips streets and parks, and places that close early", () => {
    const slugs = lateCandidates(places).map((p) => p.slug)
    expect(slugs).toContain("mcsorleys-old-ale-house")
    expect(slugs).not.toContain("times-square")
    expect(slugs).not.toContain("barney-greengrass")
  })
})
