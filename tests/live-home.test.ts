import { describe, expect, it } from "vitest"
import { LIVE_CANDIDATES, liveHome } from "@/lib/home"
import { getOpenStatus, isOpen } from "@/lib/hours"
import { sortPlaces } from "@/lib/place-filters"
import { seedPlaces } from "@/lib/places"

const all = sortPlaces(seedPlaces(), "trending")
const SATURDAY_NOON = new Date("2026-10-24T16:00:00Z")
const TUESDAY_4AM = new Date("2026-10-27T08:00:00Z")

describe("liveHome", () => {
  it("counts what is open and caps each row", () => {
    const live = liveHome(all, SATURDAY_NOON)
    expect(live.openCount).toBe(
      all.filter((p) => isOpen(getOpenStatus(p.hours, SATURDAY_NOON))).length,
    )
    expect(live.open.length).toBeLessThanOrEqual(LIVE_CANDIDATES)
    expect(live.free.every((p) => p.isFree)).toBe(true)
  })

  it("leads each row with places the trending row has not shown", () => {
    const trending = new Set(all.slice(0, 8).map((p) => p.slug))
    const { open } = liveHome(all, SATURDAY_NOON)
    expect(trending.has(open[0].slug)).toBe(false)
  })

  it("has far fewer places open in the small hours", () => {
    expect(liveHome(all, TUESDAY_4AM).openCount).toBeLessThan(
      liveHome(all, SATURDAY_NOON).openCount,
    )
  })
})
