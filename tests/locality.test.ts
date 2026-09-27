import { describe, expect, it } from "vitest"
import { distanceKm } from "@/lib/geo"
import { getPlaces } from "@/lib/places"
import { originOf, planDay } from "@/lib/planner/plan"
import { MOODS } from "@/lib/planner/types"

const places = await getPlaces()
const STARTS = ["midtown", "chinatown", "dumbo", "upper-east-side", "west-village", "williamsburg"]

describe("days stay in one part of town", () => {
  const stops = STARTS.flatMap((from) =>
    MOODS.flatMap((mood) =>
      ["2026-10-03", "2026-10-07"].flatMap(
        (date) =>
          planDay(
            {
              date,
              start: 9 * 60,
              end: 22 * 60,
              from,
              budget: 150,
              mood,
              interests: [],
              dietary: [],
              pace: "relaxed",
              weatherAware: false,
            },
            places,
          ).stops.map((s) => ({ ...s, from })),
      ),
    ),
  )

  it("walks between most stops", () => {
    const subway = stops.filter((s) => s.travel.mode === "subway").length
    expect(subway / stops.length).toBeLessThan(0.5)
  })

  it("keeps most stops within 5 km of the start", () => {
    const far = stops.filter((s) => distanceKm(originOf(s.from), s.place) > 5).length
    expect(far / stops.length).toBeLessThan(0.25)
  })
})
