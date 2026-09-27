import { describe, expect, it } from "vitest"
import { HERO_SCENES, MOODS, SEARCH_SUGGESTIONS } from "@/lib/home"
import { getPlaceBySlug, getPlaces } from "@/lib/places"
import { searchPlaces } from "@/lib/search"
import { CATEGORIES } from "@/types/enums"

const places = await getPlaces()

describe("seed data (real places)", () => {
  it("has at least six places in every section", () => {
    for (const category of CATEGORIES) {
      expect(places.filter((p) => p.category === category).length, category).toBeGreaterThanOrEqual(
        6,
      )
    }
  })

  it("uses unique ids and slugs", () => {
    expect(new Set(places.map((p) => p.id)).size).toBe(places.length)
    expect(new Set(places.map((p) => p.slug)).size).toBe(places.length)
  })

  it("records where every unverified detail came from", () => {
    for (const p of places.filter((p) => !p.verified)) {
      expect(p.verificationNotes, p.slug).toMatch(/Checked \d{4}-\d{2}-\d{2}/)
    }
  })

  it("keeps every place inside New York City", () => {
    for (const p of places) {
      expect(p.lat, p.slug).toBeGreaterThan(40.49)
      expect(p.lat, p.slug).toBeLessThan(40.92)
      expect(p.lng, p.slug).toBeGreaterThan(-74.26)
      expect(p.lng, p.slug).toBeLessThan(-73.7)
    }
  })

  it("has a take, and must-try items or tips, for every place", () => {
    for (const p of places) {
      expect(p.editorialTake.length, p.slug).toBeGreaterThan(40)
      if (p.category === "photo_spot") expect(p.photoSpot?.tips.length, p.slug).toBeGreaterThan(0)
      else if (p.category === "park_pier")
        expect(p.park?.activities.length, p.slug).toBeGreaterThan(0)
      else expect(p.mustTry.length, p.slug).toBeGreaterThan(0)
    }
  })

  it("finds places by slug", async () => {
    expect((await getPlaceBySlug("katzs-delicatessen"))?.name).toBe("Katz's Delicatessen")
  })
})

describe("home page links lead somewhere", () => {
  it.each([
    ...HERO_SCENES.map((s) => s.query),
    ...SEARCH_SUGGESTIONS.en,
    ...SEARCH_SUGGESTIONS.vi,
    ...MOODS.map((m) => m.query),
  ])("“%s” returns results", (query) => {
    // A Saturday afternoon, when most places are open
    expect(searchPlaces(places, query, { weekday: 6, minutes: 15 * 60 }).length).toBeGreaterThan(0)
  })

  it("sends the museum scene to museums only", () => {
    const results = searchPlaces(places, "museums")
    expect(results.length).toBeGreaterThanOrEqual(4)
    for (const p of results) {
      expect([p.name, ...p.mustTry].join(" ").toLowerCase(), p.slug).toContain("museum")
    }
  })
})
