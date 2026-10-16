import { describe, expect, it } from "vitest"
import { getPlaces } from "@/lib/places"
import { searchPlaces } from "@/lib/search"

const places = await getPlaces()
const slugs = (q: string) => searchPlaces(places, q).map((p) => p.slug)

describe("beer", () => {
  it("finds taverns and breweries in every language", () => {
    for (const q of ["beer", "brewery", "bia", "cerveza", "啤酒", "맥주"]) {
      const found = slugs(q)
      expect(found, q).toContain("mcsorleys-old-ale-house")
      expect(found, q).toContain("threes-brewing-gowanus")
    }
  })
})
