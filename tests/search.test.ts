import { describe, expect, it } from "vitest"
import type { NycClock } from "@/lib/hours"
import { fixturePlaces } from "./fixtures"
import { hasIntent, parseQuery, searchPlaces } from "@/lib/search"

const places = fixturePlaces
const slugs = (q: string, clock?: NycClock) => searchPlaces(places, q, clock).map((p) => p.slug)

describe("parseQuery", () => {
  it("reads dish, cuisine and borough from natural phrasing", () => {
    const i = parseQuery("Phở in Queens")
    expect(i.cuisines).toEqual(["vietnamese"])
    expect(i.dishTypes).toEqual(["noodle_soup"])
    expect(i.borough).toBe("queens")
    expect(i.terms).toEqual([])
  })

  it("prefers the longest phrase", () => {
    const i = parseQuery("bubble tea in Park Slope")
    expect(i.drinkTypes).toEqual(["bubble_tea"])
    expect(i.neighborhood).toBe("Park Slope")
    expect(i.categories).toEqual([])
  })

  it("understands nicknames, flags and leftover words", () => {
    const i = parseQuery("free things to do in LIC open now, anything spicy")
    expect(i.isFree).toBe(true)
    expect(i.openNow).toBe(true)
    expect(i.neighborhood).toBe("Long Island City")
    expect(i.categories).toEqual(expect.arrayContaining(["attraction", "park_pier", "photo_spot"]))
    expect(i.terms).toEqual(["anything", "spicy"])
  })

  it("has no intent for empty or filler queries", () => {
    expect(hasIntent(parseQuery(""))).toBe(false)
    expect(hasIntent(parseQuery("the best places near me"))).toBe(false)
  })
})

describe("searchPlaces", () => {
  it("finds pho in Queens", () => {
    expect(slugs("pho in Queens")[0]).toBe("sample-pho-house")
  })

  it("returns only free, non-food places for free things to do", () => {
    const results = searchPlaces(places, "free things to do")
    expect(results.length).toBeGreaterThan(0)
    for (const p of results) {
      expect(p.isFree).toBe(true)
      expect(["attraction", "park_pier", "photo_spot"]).toContain(p.category)
    }
  })

  it("applies dietary needs as hard filters", () => {
    expect(slugs("vegan boba")).toEqual(["sample-boba-shop"])
  })

  it("ranks by matched tags", () => {
    expect(slugs("late night ramen")[0]).toBe("sample-ramen-bar")
  })

  it("filters by open now when a clock is given", () => {
    expect(slugs("ramen open now", { weekday: 1, minutes: 12 * 60 })).toEqual([])
    expect(slugs("ramen open now", { weekday: 1, minutes: 20 * 60 })).toEqual(["sample-ramen-bar"])
  })

  it("returns nothing when nothing matches", () => {
    expect(slugs("korean bbq")).toEqual([])
    expect(slugs("xyzzy")).toEqual([])
  })

  it("matches names as free text", () => {
    expect(slugs("sample taco")).toContain("sample-taco-window")
  })
})
