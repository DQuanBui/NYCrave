import { LINES } from "@/lib/lines"
import { sectionImage } from "@/lib/og"
import en from "@/messages/en.json"

export const alt = en.seasons.title
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return sectionImage({
    title: en.seasons.title,
    kicker: en.seasons.tagline,
    color: LINES.orange.hex,
    bullet: "S",
    // Spring blossom, summer sun, fall leaves, winter night
    band: "linear-gradient(90deg, #f7a1c4, #fccc0a, #ff6319, #996633, #0d1b3d)",
  })
}
