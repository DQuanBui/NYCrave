import { describe, expect, it } from "vitest"
import { getPlaces } from "@/lib/places"
import {
  manhattanhenge,
  SEASON_EVENTS,
  seasonStatus,
  sunsetMinutes,
  upcomingSeasons,
} from "@/lib/seasons"

const places = await getPlaces()
const byKey = (key: string) => SEASON_EVENTS.find((e) => e.key === key)!

describe("Manhattanhenge", () => {
  it("matches the American Museum of Natural History's 2024 evenings", () => {
    // AMNH 2024: May 28 (half sun) and 29 (full sun); July 12 (full) and 13 (half)
    expect(manhattanhenge(2024)).toEqual({
      may: { start: "2024-05-28", end: "2024-05-29" },
      july: { start: "2024-07-12", end: "2024-07-13" },
    })
  })

  it("stays in late May and mid-July every year", () => {
    for (let year = 2025; year <= 2035; year++) {
      const { may, july } = manhattanhenge(year)
      expect(may.start >= `${year}-05-26` && may.end <= `${year}-06-01`, may.start).toBe(true)
      expect(july.start >= `${year}-07-09` && july.end <= `${year}-07-15`, july.start).toBe(true)
    }
  })

  it("happens around 8 PM", () => {
    const minutes = sunsetMinutes("2026-05-29")
    expect(minutes).toBeGreaterThan(20 * 60)
    expect(minutes).toBeLessThan(20 * 60 + 30)
  })
})

describe("the seasonal calendar", () => {
  it("links only to places on the site", () => {
    const slugs = new Set(places.map((p) => p.slug))
    for (const e of SEASON_EVENTS) for (const s of e.places) expect(slugs.has(s), s).toBe(true)
  })

  it("computes rule-based dates", () => {
    expect(byKey("marathon").window(2026)).toEqual({ start: "2026-11-01", end: "2026-11-01" })
    expect(byKey("thanksgivingParade").window(2026).start).toBe("2026-11-26")
    expect(byKey("beachSeason").window(2026)).toEqual({ start: "2026-05-23", end: "2026-09-07" })
  })

  it("counts down to the next window and knows what is on now", () => {
    const foliage = seasonStatus(byKey("fallFoliage"), "2026-09-29")
    expect(foliage).toMatchObject({ happening: false, daysUntil: 21 })
    expect(seasonStatus(byKey("fallFoliage"), "2026-11-01").happening).toBe(true)
    // Past this year's window, it looks ahead to next year
    expect(seasonStatus(byKey("newYearsEve"), "2027-01-02").window.start).toBe("2027-12-31")
  })

  it("carries the holiday windows over New Year", () => {
    const status = seasonStatus(byKey("holidayWindows"), "2027-01-03")
    expect(status.happening).toBe(true)
    expect(status.window.start).toBe("2026-11-26")
  })

  it("lists what is on first, then the soonest", () => {
    const list = upcomingSeasons("2026-11-01")
    expect(list[0].happening).toBe(true)
    const upcoming = list.filter((s) => !s.happening).map((s) => s.daysUntil)
    expect(upcoming).toEqual([...upcoming].sort((a, b) => a - b))
  })
})
