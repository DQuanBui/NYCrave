import { describe, expect, it } from "vitest"
import { seedPlaces } from "@/lib/places"
import { correctQuery, editDistance, searchWithCorrection } from "@/lib/search"

const places = seedPlaces()
const slugs = (q: string) => searchWithCorrection(places, q).places.map((p) => p.slug)

describe("typo-tolerant search", () => {
  it("counts a swap of neighboring letters as one edit", () => {
    expect(editDistance("chinatwon", "chinatown")).toBe(1)
    expect(editDistance("rammen", "ramen")).toBe(1)
    expect(editDistance("pizza", "pizza")).toBe(0)
  })

  it("fixes misspelled dishes, places and areas", () => {
    expect(correctQuery("dumplins in chinatwon", places)).toBe("dumplings in chinatown")
    expect(slugs("dumplins in chinatwon")).toContain("nom-wah-tea-parlor")
    expect(slugs("guggenhiem")).toContain("guggenheim-museum")
    expect(slugs("brooklin muesum")).toContain("brooklyn-museum")
  })

  it("leaves queries that already match alone", () => {
    expect(searchWithCorrection(places, "lucali").correctedQuery).toBeUndefined()
    expect(searchWithCorrection(places, "ramen").correctedQuery).toBeUndefined()
  })

  it("does not rewrite Chinese or Korean queries", () => {
    expect(correctQuery("唐人街 饺子", places)).toBeNull()
    expect(correctQuery("차이나타운 만두", places)).toBeNull()
  })
})
