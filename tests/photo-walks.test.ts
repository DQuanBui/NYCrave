import { describe, expect, it } from "vitest"
import photoSpots from "@/data/photo-spots.json"
import { lightBands, PHOTO_WALKS, phaseAt, timeWalk, type WalkSpot } from "@/lib/photo-walks"
import { sunDay } from "@/lib/sun"

const spots = new Map(
  (photoSpots as unknown as (WalkSpot & { slug: string })[]).map((p) => [p.slug, p]),
)

describe("light phases", () => {
  const sun = sunDay("2026-10-03")

  it("covers the day with back-to-back bands", () => {
    const bands = lightBands(sun)
    expect(bands[0].start).toBe(0)
    expect(bands.at(-1)?.end).toBe(1440)
    for (let i = 1; i < bands.length; i++) expect(bands[i].start).toBe(bands[i - 1].end)
    expect(bands.map((b) => b.phase)).toEqual([
      "night",
      "blue",
      "dawn",
      "golden",
      "day",
      "golden",
      "dusk",
      "blue",
      "night",
    ])
  })

  it("names the light around sunset", () => {
    expect(phaseAt(sun.sunset - 10, sun)).toBe("golden")
    expect(phaseAt(sun.sunset + 1, sun)).toBe("dusk")
    expect(phaseAt(12 * 60, sun)).toBe("day")
    expect(phaseAt(23 * 60, sun)).toBe("night")
  })
})

describe("photo walks", () => {
  it("only uses photo spots that exist", () => {
    for (const walk of PHOTO_WALKS)
      for (const slug of walk.stops) expect(spots.has(slug)).toBe(true)
  })

  it("keeps every leg a short walk", () => {
    const sun = sunDay("2026-10-03")
    for (const walk of PHOTO_WALKS) {
      const timed = timeWalk(walk, sun, 6, spots)
      expect(timed).not.toBeNull()
      for (const stop of timed!.stops) expect(stop.walk).toBeLessThanOrEqual(30)
    }
  })

  it("lands the sunrise walk in sunrise light all year", () => {
    const walk = PHOTO_WALKS.find((w) => w.key === "dumboSunrise")!
    for (const date of ["2026-03-20", "2026-06-21", "2026-12-21"]) {
      const timed = timeWalk(walk, sunDay(date), 0, spots)!
      expect(["dawn", "golden"]).toContain(timed.stops[1].phase)
    }
  })

  it("waits for Central Park to open on summer mornings", () => {
    const walk = PHOTO_WALKS.find((w) => w.key === "centralParkMorning")!
    const timed = timeWalk(walk, sunDay("2026-06-21"), 0, spots)!
    expect(timed.start).toBe(6 * 60)
    expect(timed.stops[0].waitedToOpen).toBe(true)
  })

  it("brings the Midtown walk to Times Square after dark", () => {
    const walk = PHOTO_WALKS.find((w) => w.key === "midtownBlueHour")!
    const timed = timeWalk(walk, sunDay("2026-10-03"), 6, spots)!
    expect(timed.stops[0].phase).toBe("golden")
    expect(["blue", "night"]).toContain(timed.stops.at(-1)!.phase)
  })
})
