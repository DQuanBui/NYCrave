import { LINES } from "@/lib/lines"
import { sectionImage, stripes } from "@/lib/og"
import { rideLine, routeFromSlug } from "@/lib/ride"
import { ROUTE_LINE } from "@/lib/subway"
import en from "@/messages/en.json"

export const alt = "A subway line on NYCrave"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ route: string }> }) {
  const route = routeFromSlug((await params).route) ?? "7"
  const ride = rideLine(route, [])
  const hex = LINES[ROUTE_LINE[route]].hex
  return sectionImage({
    title: en.ride.lineTitle.replace("{route}", route),
    kicker: en.ride.fromTo
      .replace("{from}", ride.stops[0].station.name)
      .replace("{to}", ride.stops.at(-1)!.station.name),
    color: hex,
    bullet: route,
    // A platform edge: the line's color with the yellow safety strip
    band: stripes([hex, hex, hex, hex, hex, "#fccc0a"], 40),
  })
}
