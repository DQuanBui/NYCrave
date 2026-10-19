import { describe, expect, it } from "vitest"
import { GUIDES, guideBySlug, guideSections } from "@/lib/guides"
import { MOODS } from "@/lib/home"
import { seedPlaces } from "@/lib/places"

describe("guides", () => {
  const places = seedPlaces()

  it("has enough places in every guide to be worth a page", () => {
    for (const guide of GUIDES) {
      const count = guideSections(guide, places).reduce((n, s) => n + s.places.length, 0)
      expect(count, guide.key).toBeGreaterThanOrEqual(10)
    }
  })

  it("only puts free places in the free guide", () => {
    const free = guideSections(guideBySlug("free")!, places).flatMap((s) => s.places)
    expect(free.every((p) => p.isFree)).toBe(true)
  })

  it("points every mood chip at a real guide", () => {
    for (const mood of MOODS) if (mood.guide) expect(guideBySlug(mood.guide)).toBeDefined()
  })
})

describe("related pages", () => {
  it("has a link text in every language for each guide that links somewhere", async () => {
    for (const locale of ["en", "vi", "es", "zh", "ko"]) {
      const messages = (await import(`@/messages/${locale}.json`)).default
      for (const guide of GUIDES)
        if (guide.related)
          expect(messages.guides.related[guide.key], `${locale} ${guide.key}`).toBeTruthy()
    }
  })
})
