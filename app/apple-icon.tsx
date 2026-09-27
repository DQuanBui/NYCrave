import { iconResponse } from "@/lib/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

/** iOS masks corners itself, so the icon fills the square. */
export default function AppleIcon() {
  return iconResponse(180, { maskable: true })
}
