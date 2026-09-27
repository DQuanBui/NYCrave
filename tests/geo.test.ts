import { describe, expect, it } from "vitest"
import { routeDirectionsUrl } from "@/lib/geo"

describe("routeDirectionsUrl", () => {
  it("runs from the start through every stop to the last one", () => {
    const url = new URL(
      routeDirectionsUrl({ lat: 40.7, lng: -74 }, [
        { lat: 1, lng: 2, name: "Katz's Delicatessen", address: "205 E Houston St, New York, NY 10002" },
        { lat: 3, lng: 4, name: "Washington Square Park" },
        { lat: 5, lng: 6, name: "Joe's Pizza", address: "7 Carmine St, New York, NY 10014" },
      ]),
    )
    expect(url.searchParams.get("origin")).toBe("40.7,-74")
    expect(url.searchParams.get("destination")).toBe("Joe's Pizza, 7 Carmine St, New York, NY 10014")
    expect(url.searchParams.get("waypoints")).toBe(
      "Katz's Delicatessen, 205 E Houston St, New York, NY 10002|3,4",
    )
    expect(url.searchParams.get("travelmode")).toBe("walking")
  })
})
