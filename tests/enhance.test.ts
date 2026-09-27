import { describe, expect, it } from "vitest"
import { getPlaces } from "@/lib/places"
import { buildCandidates, describeSlots, validateSelection } from "@/lib/planner/enhance"
import { planDay } from "@/lib/planner/plan"
import type { PlanInput } from "@/lib/planner/types"

const places = await getPlaces()
const input: PlanInput = {
  date: "2026-09-28",
  start: 9 * 60,
  end: 22 * 60,
  from: "midtown",
  budget: 200,
  mood: "foodie",
  interests: [],
  dietary: [],
  pace: "relaxed",
  weatherAware: false,
}
const plan = planDay(input, places)
const slots = buildCandidates(plan, places)

describe("buildCandidates", () => {
  it("offers only open, slot-appropriate places that no other stop uses", () => {
    for (const s of slots) {
      expect(s.candidates.map((p) => p.id)).toContain(s.current)
      const others = plan.stops.filter((x) => x.slot !== s.slot).map((x) => x.place.id)
      for (const p of s.candidates) expect(others).not.toContain(p.id)
    }
  })

  it("describes candidates with facts from our data only", () => {
    const described = describeSlots(plan, slots)
    const ids = new Set(places.map((p) => p.id))
    for (const slot of described) {
      for (const c of slot.candidates) expect(ids.has(c.id)).toBe(true)
    }
  })
})

describe("validateSelection", () => {
  const first = slots[0]

  it("drops invented ids, unknown slots and duplicates", () => {
    const picks = validateSelection(
      {
        picks: [
          { slot: first.slot, placeId: "made-up-place", note: "x" },
          { slot: "night", placeId: first.current, note: "wrong slot" },
          { slot: first.slot, placeId: first.current, note: "  keep it  " },
          { slot: first.slot, placeId: first.current, note: "duplicate" },
        ],
      },
      slots,
    )
    expect(picks).toEqual([{ slot: first.slot, placeId: first.current, note: "keep it" }])
  })

  it("feeds valid picks back through the planner as locks", () => {
    const alt = slots.find((s) => s.candidates.length > 1)
    if (!alt) return
    const other = alt.candidates.find((p) => p.id !== alt.current)!
    const picks = validateSelection(
      { picks: [{ slot: alt.slot, placeId: other.id, note: "" }] },
      slots,
    )
    const locks = Object.fromEntries(plan.stops.map((s) => [s.slot, s.place.id]))
    for (const p of picks) locks[p.slot] = p.placeId
    const refined = planDay(input, places, { locks })
    expect(refined.stops.find((s) => s.slot === alt.slot)?.place.id).toBe(other.id)
  })
})
