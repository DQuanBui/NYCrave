import { LINES } from "@/lib/lines"
import { sectionImage, stripes } from "@/lib/og"
import en from "@/messages/en.json"

export const alt = en.passport.title
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return sectionImage({
    title: en.passport.title,
    kicker: en.passport.tagline,
    color: LINES.yellow.hex,
    bullet: "P",
    band: stripes([LINES.yellow.hex, "#1d1f21"], 48),
  })
}
