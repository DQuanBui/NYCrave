import { describe, expect, it } from "vitest"
import { sunDay } from "@/lib/sun"

const hm = (h: number, m: number) => h * 60 + m

describe("sun times in New York", () => {
  // Reference: NOAA solar calculator for City Hall, rounded to the minute
  it("matches the summer solstice (EDT)", () => {
    const sun = sunDay("2026-06-21")
    expect(Math.abs(sun.sunrise - hm(5, 25))).toBeLessThanOrEqual(3)
    expect(Math.abs(sun.sunset - hm(20, 31))).toBeLessThanOrEqual(3)
  })

  it("matches the winter solstice (EST)", () => {
    const sun = sunDay("2026-12-21")
    expect(Math.abs(sun.sunrise - hm(7, 17))).toBeLessThanOrEqual(3)
    expect(Math.abs(sun.sunset - hm(16, 32))).toBeLessThanOrEqual(3)
  })

  it("orders the evening: golden hour, sunset, blue hour", () => {
    const sun = sunDay("2026-10-03")
    expect(sun.goldenEvening.start).toBeLessThan(sun.goldenEvening.end)
    expect(sun.goldenEvening.end).toBe(sun.sunset)
    expect(sun.blueEvening.start).toBeGreaterThan(sun.sunset)
    expect(sun.blueEvening.end).toBeGreaterThan(sun.blueEvening.start)
    expect(sun.goldenMorning.start).toBe(sun.sunrise)
  })
})
