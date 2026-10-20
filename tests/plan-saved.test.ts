import { describe, expect, it } from "vitest"
import { toCard } from "@/lib/card-place"
import { planSavedQuery, slotForPlace } from "@/lib/planner/around"
import { parsePlanParams } from "@/lib/planner/params"
import { planDay } from "@/lib/planner/plan"
import { seedPlaces } from "@/lib/places"

const places = seedPlaces()
const card = (slug: string) => toCard(places.find((p) => p.slug === slug)!)
const SATURDAY = new Date("2026-10-03T14:00:00Z")

describe("plan a day with saved places", () => {
  it("pins each saved place to its own slot, first saved wins", () => {
    const saved = ["katzs-delicatessen", "the-met-fifth-avenue", "death-and-co-east-village"].map(
      card,
    )
    const { pinned, query } = planSavedQuery(saved, SATURDAY)
    expect(pinned).toEqual(saved.map((p) => p.slug))
    expect(query.lock.split(",")).toHaveLength(3)
  })

  it("skips a place whose slot is already taken", () => {
    const a = card("the-met-fifth-avenue")
    const b = card("american-museum-of-natural-history")
    expect(slotForPlace(a)).toBe(slotForPlace(b))
    expect(planSavedQuery([a, b], SATURDAY).pinned).toEqual([a.slug])
  })

  it("produces a day that includes the pinned places", () => {
    const saved = ["katzs-delicatessen", "the-met-fifth-avenue"].map(card)
    const { query } = planSavedQuery(saved, SATURDAY)
    const { input, adjustments } = parsePlanParams(query, SATURDAY)
    const plan = planDay(input, places, adjustments)
    const ids = plan.stops.map((s) => s.place.id)
    for (const p of saved) expect(ids).toContain(p.id)
  })
})
