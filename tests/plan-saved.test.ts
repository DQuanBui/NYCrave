import { describe, expect, it } from "vitest"
import { toCard } from "@/lib/card-place"
import { planNearbyQuery, planSavedQuery, slotForPlace } from "@/lib/planner/around"
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

  it("moves a second sight to another daytime slot, and packs the day for a third", () => {
    const a = card("the-met-fifth-avenue")
    const b = card("american-museum-of-natural-history")
    const c = card("tenement-museum")
    expect(slotForPlace(a)).toBe(slotForPlace(b))
    const two = planSavedQuery([a, b], SATURDAY)
    expect(two.pinned).toEqual([a.slug, b.slug])
    expect(two.query.pace).not.toBe("packed")
    const three = planSavedQuery([a, b, c], SATURDAY)
    expect(three.pinned).toEqual([a.slug, b.slug, c.slug])
    expect(three.query.pace).toBe("packed")
  })

  it("skips a place whose meal slot is already taken", () => {
    const meals = places
      .filter((p) => p.category === "restaurant")
      .map(toCard)
      .filter((p) => slotForPlace(p) === "dinner")
    expect(planSavedQuery(meals.slice(0, 2), SATURDAY).pinned).toEqual([meals[0].slug])
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

describe("plan a day from a guide", () => {
  it("keeps the day in one part of town", () => {
    const spread = [
      "katzs-delicatessen",
      "tenement-museum",
      "museum-at-eldridge-street",
      "van-cortlandt-house-museum",
      "historic-richmond-town",
    ].map(card)
    const { pinned } = planNearbyQuery(spread, SATURDAY)
    expect(pinned).not.toContain("van-cortlandt-house-museum")
    expect(pinned).not.toContain("historic-richmond-town")
    expect(pinned.length).toBeGreaterThan(1)
  })
})
