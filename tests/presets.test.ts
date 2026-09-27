import { describe, expect, it } from "vitest"
import { NEIGHBORHOODS } from "@/data/neighborhoods"
import { getPlaces } from "@/lib/places"
import { parsePlanParams } from "@/lib/planner/params"
import { planDay } from "@/lib/planner/plan"
import { DAY_PRESETS, presetInput, presetQuery } from "@/lib/planner/presets"

const places = await getPlaces()

describe("ready-made days", () => {
  it("start from real neighborhoods", () => {
    for (const p of DAY_PRESETS) expect(NEIGHBORHOODS.some((n) => n.slug === p.from)).toBe(true)
  })

  it("link to exactly the plan they preview", () => {
    for (const p of DAY_PRESETS) {
      const { input, submitted } = parsePlanParams(presetQuery(p, "2026-10-03"))
      expect(submitted).toBe(true)
      expect(input).toEqual(presetInput(p, "2026-10-03"))
    }
  })

  it.each(["2026-10-03", "2026-10-07"])("plan a full day within budget on %s", (date) => {
    for (const p of DAY_PRESETS) {
      const plan = planDay(presetInput(p, date), places)
      expect(plan.stops.length, p.id).toBeGreaterThanOrEqual(4)
      expect(plan.totalCost, p.id).toBeLessThanOrEqual(p.budget)
    }
  })
})
