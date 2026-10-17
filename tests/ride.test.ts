import { describe, expect, it } from "vitest"
import { seedPlaces } from "@/lib/places"
import { MAX_WALK, RIDE_ROUTES, rideLine, routeFromSlug } from "@/lib/ride"

describe("ride a train", () => {
  const places = seedPlaces()

  const ends = (route: string) => {
    const stops = rideLine(route, places).stops
    return [stops[0].station.name, stops.at(-1)!.station.name]
  }

  it("rides straight lines end to end", () => {
    expect(ends("7")).toEqual(["34 St-Hudson Yards", "Flushing-Main St"])
    expect(ends("L")[0]).toBe("8 Av")
    expect(ends("L")[1]).toMatch(/Canarsie/)
    expect(ends("G")[0]).toBe("Court Sq")
  })

  it("orders the 1 from the Bronx down to South Ferry", () => {
    const stops = rideLine("1", places).stops
    expect(stops[0].station.lat).toBeGreaterThan(stops.at(-1)!.station.lat)
    expect(stops.at(-1)!.station.name).toMatch(/South Ferry/)
  })

  it("lists each place once per line, within a short walk", () => {
    for (const route of RIDE_ROUTES) {
      const ride = rideLine(route, places)
      const slugs = ride.stops.flatMap((s) => s.places.map((p) => p.place.slug))
      expect(new Set(slugs).size).toBe(slugs.length)
      for (const stop of ride.stops)
        for (const p of stop.places) expect(p.walk).toBeLessThanOrEqual(MAX_WALK)
    }
  })

  it("finds places along every line", () => {
    for (const route of RIDE_ROUTES)
      expect(rideLine(route, places).placeCount, route).toBeGreaterThanOrEqual(5)
  })

  it("reads routes from lowercase slugs", () => {
    expect(routeFromSlug("a")).toBe("A")
    expect(routeFromSlug("7")).toBe("7")
    expect(routeFromSlug("s")).toBeUndefined()
  })
})
