import { LINES } from "@/lib/lines"
import { sectionImage, stripes } from "@/lib/og"
import en from "@/messages/en.json"

export const alt = en.food.title
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return sectionImage({
    title: en.food.title,
    kicker: en.food.tagline,
    color: LINES.red.hex,
    bullet: "E",
    band: stripes([LINES.red.hex, "#ffffff"], 60),
  })
}
