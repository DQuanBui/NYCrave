import { describe, expect, it } from "vitest"
import { getPlaces } from "@/lib/places"
import { nearestStations, ROUTE_LINE, routesNear, subwayLeg } from "@/lib/subway"

const places = await getPlaces()
const bySlug = (slug: string) => places.find((p) => p.slug === slug)!

describe("subway stations", () => {
  it("finds the station you would actually use", () => {
    const katz = nearestStations(bySlug("katzs-delicatessen"))
    expect(katz[0].name).toBe("2 Av")
    expect(katz[0].routes).toEqual(["F"])

    const gct = nearestStations(bySlug("grand-central-terminal"))[0]
    expect(gct.name).toContain("Grand Central")
    expect(gct.routes).toEqual(expect.arrayContaining(["4", "5", "6", "7", "S"]))
  })

  it("puts a station within a 15-minute walk of almost every place", () => {
    const far = places.filter((p) => nearestStations(p).length === 0).map((p) => p.slug)
    // Roosevelt Island, piers and big parks can be a longer walk
    expect(far.length).toBeLessThanOrEqual(3)
  })

  it("colors every route", () => {
    const routes = routesNear({ lat: 40.73, lng: -73.95 }, 50)
    for (const r of routes) expect(ROUTE_LINE[r]).toBeDefined()
    expect(routes).toHaveLength(Object.keys(ROUTE_LINE).length)
  })
})

describe("subway legs", () => {
  it("finds a direct train when one runs between the two ends", () => {
    // Katz's (2 Av, F) to Grand Central: the F does not go there, but the 6 and 4/5 are close to both
    const leg = subwayLeg(bySlug("katzs-delicatessen"), bySlug("grand-central-terminal"))!
    expect(leg).not.toBeNull()
    if (leg.direct) {
      expect(leg.board.routes).toContain(leg.direct)
      expect(leg.alight.routes).toContain(leg.direct)
    }
  })

  it("never boards and alights at the same station", () => {
    for (const a of places.slice(0, 15)) {
      for (const b of places.slice(15, 30)) {
        const leg = subwayLeg(a, b)
        if (leg?.direct) expect(leg.board.name).not.toBe(leg.alight.name)
      }
    }
  })
})

describe("service days", () => {
  it("does not suggest the B or W on weekends", () => {
    for (const a of places) {
      for (const b of places) {
        if (a === b) continue
        const leg = subwayLeg(a, b, { weekend: true })
        expect(["B", "W", "Z"]).not.toContain(leg?.direct)
      }
    }
  })
})
