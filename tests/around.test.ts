import { describe, expect, it } from "vitest"
import { getPlaces } from "@/lib/places"
import { planAroundQuery, slotForPlace } from "@/lib/planner/around"
import { parsePlanParams } from "@/lib/planner/params"
import { planDay } from "@/lib/planner/plan"
import { MOODS } from "@/lib/planner/types"

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

describe("breakfast", () => {
  it("is breakfast food or a cafe, never pizza, tacos or a pastrami sandwich", () => {
    const ok = new Set(["bakery", "brunch", "bagels", "dumplings", "noodle_soup"])
    for (const date of ["2026-10-03", "2026-10-05", "2026-10-07"]) {
      for (const mood of MOODS) {
        const plan = planDay(
          {
            date,
            start: 8 * 60,
            end: 22 * 60,
            from: "midtown",
            budget: 200,
            mood,
            interests: [],
            dietary: [],
            pace: "relaxed",
            weatherAware: false,
          },
          places,
        )
        const breakfast = plan.stops.find((s) => s.slot === "breakfast")
        if (!breakfast) continue
        const p = breakfast.place
        expect(p.category === "drink" || (p.dishTypes ?? []).some((d) => ok.has(d)), p.slug).toBe(
          true,
        )
      }
    }
  })
})
