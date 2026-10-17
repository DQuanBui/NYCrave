import { LINES } from "@/lib/lines"
import { sectionImage, stripes } from "@/lib/og"
import en from "@/messages/en.json"

export const alt = en.guides.title
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const STRIPES = stripes(
  (["green", "blue", "orange", "purple", "red", "yellow"] as const).map((l) => LINES[l].hex),
  200,
)

export default function Image() {
  return sectionImage({
    title: en.guides.title,
    kicker: en.guides.tagline,
    color: LINES.purple.hex,
    bullet: "G",
    band: STRIPES,
  })
}
