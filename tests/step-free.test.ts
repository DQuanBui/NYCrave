import { describe, expect, it } from "vitest"
import { listingQuery, parseListingParams } from "@/lib/place-filters"
import { seedPlaces } from "@/lib/places"
import { hasStepFreeStation } from "@/lib/step-free"

const places = seedPlaces()
const bySlug = (slug: string) => places.find((p) => p.slug === slug)!

describe("step-free subway filter", () => {
  it("finds the elevators at Times Square and none on Staten Island's shore", () => {
    expect(hasStepFreeStation(bySlug("times-square"))).toBe(true)
    expect(hasStepFreeStation(bySlug("alice-austen-house"))).toBe(false)
  })

  it("narrows the list but keeps plenty of places", () => {
    const count = places.filter(hasStepFreeStation).length
    expect(count).toBeGreaterThan(30)
    expect(count).toBeLessThan(places.length)
  })

  it("round-trips through the URL", () => {
    const params = parseListingParams({ step: "1" })
    expect(params.step).toBe(true)
    expect(listingQuery(params)).toMatchObject({ step: "1" })
    expect(listingQuery(parseListingParams({}))).not.toHaveProperty("step")
  })
})
