import type { LineColor } from "@/lib/lines"

/**
 * Subway routes and their line colors, with no station data, so browser code
 * can show route bullets without pulling the station list into its bundle.
 */
/** Official MTA trunk-line colors. */
export const ROUTE_LINE: Record<string, LineColor> = {
  "1": "red",
  "2": "red",
  "3": "red",
  "4": "green",
  "5": "green",
  "6": "green",
  "7": "purple",
  A: "blue",
  C: "blue",
  E: "blue",
  B: "orange",
  D: "orange",
  F: "orange",
  M: "orange",
  G: "lime",
  J: "brown",
  Z: "brown",
  L: "gray",
  N: "yellow",
  Q: "yellow",
  R: "yellow",
  W: "yellow",
  S: "gray",
}

/** The shuttles are three separate lines, and the Z only runs at rush hour. */
export const RIDE_ROUTES = Object.keys(ROUTE_LINE).filter((r) => r !== "S" && r !== "Z")

export const routeSlug = (route: string) => route.toLowerCase()
export const routeFromSlug = (slug: string) =>
  RIDE_ROUTES.find((r) => routeSlug(r) === slug.toLowerCase())
