import { describe, expect, it } from "vitest"
import { applyListing, filterOptions, hasActiveFilters } from "@/lib/listing"
import { fromSlug, listingQuery, parseListingParams, toSlug } from "@/lib/place-filters"
import { getPlaces } from "@/lib/places"
import { countByType } from "@/lib/type-browse"
import { CUISINES } from "@/types/place"

const all = await getPlaces()

describe("listing params", () => {
  it("parses known values and drops junk", () => {
    const p = parseListingParams({
      borough: "queens",
      price: "9",
      open: "1",
      vibe: "not_a_vibe",
      sort: "name",
      view: "map",
    })
    expect(p).toMatchObject({ borough: "queens", open: true, sort: "name", view: "map" })
    expect(p.price).toBeUndefined()
    expect(p.vibe).toBeUndefined()
  })

  it("round-trips through the query string without defaults", () => {
    const p = parseListingParams({ hood: "Flushing", diet: "vegan", price: "2" })
    expect(listingQuery(p)).toEqual({ hood: "Flushing", diet: "vegan", price: "2" })
    expect(listingQuery(parseListingParams({}))).toEqual({})
    expect(hasActiveFilters(parseListingParams({ sort: "name" }))).toBe(false)
  })

  it("maps enum values to URL slugs and back", () => {
    expect(toSlug("middle_eastern")).toBe("middle-eastern")
    expect(fromSlug(CUISINES, "middle-eastern")).toBe("middle_eastern")
    expect(fromSlug(CUISINES, "martian")).toBeUndefined()
  })
})

describe("applyListing", () => {
  const restaurants = all.filter((p) => p.category === "restaurant")

  it("filters by borough, price and dietary", () => {
    const res = applyListing(restaurants, parseListingParams({ borough: "queens", price: "1" }))
    expect(res.every((p) => p.borough === "queens" && p.priceLevel === 1)).toBe(true)
    expect(res.length).toBeGreaterThan(0)
    const veg = applyListing(restaurants, parseListingParams({ diet: "vegetarian" }))
    expect(veg.every((p) => p.dietary?.includes("vegetarian"))).toBe(true)
  })

  it("filters open now against New York time", () => {
    // Monday 2026-09-28 12:00 EDT: the ramen bar opens at 5 PM
    const noon = new Date("2026-09-28T16:00:00Z")
    const open = applyListing(restaurants, parseListingParams({ open: "1" }), noon)
    expect(open.map((p) => p.slug)).not.toContain("sample-ramen-bar")
    expect(open.map((p) => p.slug)).toContain("sample-pho-house")
  })

  it("sorts", () => {
    const byName = applyListing(restaurants, parseListingParams({ sort: "name" }))
    expect(byName.map((p) => p.name)).toEqual([...byName.map((p) => p.name)].sort())
  })
})

describe("filterOptions", () => {
  it("offers only choices that lead somewhere", () => {
    const opts = filterOptions(all.filter((p) => p.category === "attraction"))
    expect(opts.showFree).toBe(true)
    expect(opts.boroughs).toEqual(["manhattan"])
    expect(opts.dietary).toEqual([])
    expect(opts.neighborhoods.map((n) => n.name)).toEqual(["Chelsea", "Midtown", "Upper West Side"])
  })

  it("hides the free toggle when everything is free", () => {
    expect(filterOptions(all.filter((p) => p.category === "photo_spot")).showFree).toBe(false)
  })
})

describe("countByType", () => {
  it("counts places per cuisine, most first", () => {
    const counts = countByType("cuisine", all)
    expect(counts).toHaveLength(CUISINES.length)
    expect(counts[0].count).toBeGreaterThan(0)
    expect(counts.find((c) => c.value === "vietnamese")?.count).toBe(1)
  })
})
