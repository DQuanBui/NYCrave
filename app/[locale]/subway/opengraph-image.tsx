import { LINES } from "@/lib/lines"
import { sectionImage, stripes } from "@/lib/og"
import en from "@/messages/en.json"

export const alt = en.ride.title
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const TRUNKS = (
  ["red", "green", "purple", "blue", "orange", "lime", "brown", "gray", "yellow"] as const
).map((l) => LINES[l].hex)

export default function Image() {
  return sectionImage({
    title: en.ride.title,
    kicker: en.ride.tagline,
    color: LINES.blue.hex,
    bullet: "M",
    band: stripes(TRUNKS, 1200 / TRUNKS.length),
  })
}
