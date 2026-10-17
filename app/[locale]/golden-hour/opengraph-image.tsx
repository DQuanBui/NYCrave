import { LINES } from "@/lib/lines"
import { sectionImage } from "@/lib/og"
import en from "@/messages/en.json"

export const alt = en.goldenHour.title
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return sectionImage({
    title: en.goldenHour.title,
    kicker: en.goldenHour.tagline,
    color: LINES.yellow.hex,
    bullet: "☀",
    // A day of light: night, blue hour, golden hour, daylight and back
    band: "linear-gradient(90deg, #0d1b3d, #2456b8, #f27d72, #f7b538, #8fd0f5, #f7b538, #e8607a, #2456b8, #0d1b3d)",
  })
}
