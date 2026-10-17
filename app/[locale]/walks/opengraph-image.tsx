import { LINES } from "@/lib/lines"
import { sectionImage } from "@/lib/og"
import en from "@/messages/en.json"

export const alt = en.walks.title
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return sectionImage({
    title: en.walks.title,
    kicker: en.walks.tagline,
    color: LINES.green.hex,
    bullet: "W",
    band: `linear-gradient(90deg, #00692c, ${LINES.green.hex}, ${LINES.lime.hex}, ${LINES.brown.hex})`,
  })
}
