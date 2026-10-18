import { describe, expect, it } from "vitest"
import { CRAWL_KINDS, crawlsFor, MAX_LEG, MIN_STOPS } from "@/lib/crawls"
import { seedPlaces } from "@/lib/places"

describe("crawls", () => {
  const places = seedPlaces()
  const all = CRAWL_KINDS.flatMap((kind) => crawlsFor(kind, places))

  it("finds at least one crawl for most cravings", () => {
    const kinds = new Set(all.map((c) => c.kind.key))
    expect(kinds.size).toBeGreaterThanOrEqual(5)
  })

  it("keeps every crawl short and on theme", () => {
    for (const crawl of all) {
      expect(crawl.stops.length).toBeGreaterThanOrEqual(MIN_STOPS)
      expect(crawl.stops[0].walk).toBe(0)
      for (const s of crawl.stops) {
        expect(s.walk).toBeLessThanOrEqual(MAX_LEG)
        expect(crawl.kind.matches(s.place)).toBe(true)
      }
    }
  })

  it("never repeats a place between two crawls for the same craving", () => {
    for (const kind of CRAWL_KINDS) {
      const slugs = crawlsFor(kind, places).flatMap((c) => c.stops.map((s) => s.place.slug))
      expect(new Set(slugs).size).toBe(slugs.length)
    }
  })
})
