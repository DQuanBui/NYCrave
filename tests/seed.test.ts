import { describe, expect, it } from "vitest"
import { getPlaceBySlug, getPlaces } from "@/lib/places"
import { CATEGORIES } from "@/types/place"

describe("seed data", () => {
  it("parses against the place schema and covers every category", async () => {
    const places = await getPlaces()
    for (const category of CATEGORIES) {
      expect(places.some((p) => p.category === category)).toBe(true)
    }
  })

  it("keeps placeholder entries unverified and flagged for review", async () => {
    const places = await getPlaces()
    for (const p of places.filter((p) => !p.verified)) {
      expect(p.verificationNotes).toMatch(/TODO: verify/)
    }
  })

  it("filters and sorts", async () => {
    const free = await getPlaces({ isFree: true }, { sort: "name" })
    expect(free.every((p) => p.isFree)).toBe(true)
    expect(free.map((p) => p.name)).toEqual(
      [...free.map((p) => p.name)].sort((a, b) => a.localeCompare(b)),
    )

    const top = await getPlaces({ category: "restaurant" }, { sort: "trending", limit: 1 })
    expect(top).toHaveLength(1)
    expect(await getPlaceBySlug(top[0].slug)).toEqual(top[0])
  })
})
