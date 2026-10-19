import { LINES } from "@/lib/lines"
import { sectionImage } from "@/lib/og"
import en from "@/messages/en.json"

export const alt = en.tonight.title
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return sectionImage({
    title: en.tonight.title,
    kicker: en.tonight.tagline,
    color: LINES.purple.hex,
    bullet: "N",
    // From dusk into the small hours
    band: "linear-gradient(90deg, #e8607a, #2456b8, #0d1b3d, #050b1c)",
  })
}
