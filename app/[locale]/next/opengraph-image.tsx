import { LINES } from "@/lib/lines"
import { sectionImage } from "@/lib/og"
import en from "@/messages/en.json"

export const alt = en.next.title
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return sectionImage({
    title: en.next.title,
    kicker: en.next.tagline,
    color: LINES.green.hex,
    bullet: "N",
  })
}
