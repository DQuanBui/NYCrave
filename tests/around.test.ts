import { describe, expect, it } from "vitest"
import { getPlaces } from "@/lib/places"
import { planAroundQuery, slotForPlace } from "@/lib/planner/around"
import { parsePlanParams } from "@/lib/planner/params"
import { planDay } from "@/lib/planner/plan"

const places = await getPlaces()
// Saturday 2026-10-03, noon in New York: most places are open on Saturdays
const SATURDAY = new Date("2026-10-03T16:00:00Z")

describe("plan a day around a place", () => {
  it("picks sensible slots", () => {
    const bySlug = (slug: string) => places.find((p) => p.slug === slug)!
    expect(slotForPlace(bySlug("levain-bakery-west-74th-street"))).toBe("breakfast")
    expect(slotForPlace(bySlug("death-and-co-east-village"))).toBe("night")
    expect(slotForPlace(bySlug("devocion-williamsburg"))).toBe("coffee")
    expect(slotForPlace(bySlug("the-met-fifth-avenue"))).toBe("morning")
  })

  it("keeps the chosen place in most generated days", () => {
    let kept = 0
    for (const place of places) {
      const { input, adjustments } = parsePlanParams(planAroundQuery(place, SATURDAY))
      const plan = planDay(input, places, adjustments)
      if (plan.stops.some((s) => s.place.id === place.id)) kept++
    }
    // A few places cannot fit (e.g. open only at other times or over budget)
    expect(kept / places.length).toBeGreaterThan(0.75)
  })
})
