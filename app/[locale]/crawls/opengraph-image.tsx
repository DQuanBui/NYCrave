import { LINES } from "@/lib/lines"
import { sectionImage, stripes } from "@/lib/og"
import en from "@/messages/en.json"

export const alt = en.crawls.title
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return sectionImage({
    title: en.crawls.title,
    kicker: en.crawls.tagline,
    color: LINES.red.hex,
    bullet: "C",
    // Checked like a pizzeria tablecloth
    band: stripes([LINES.red.hex, "#ffffff"], 28),
  })
}
