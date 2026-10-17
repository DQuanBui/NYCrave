import { LINES } from "@/lib/lines"
import { guideBySlug } from "@/lib/guides"
import { sectionImage } from "@/lib/og"
import en from "@/messages/en.json"

export const alt = "A NYCrave guide"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const guide = guideBySlug((await params).slug) ?? guideBySlug("free")!
  const copy = en.guides.list[guide.key]
  return sectionImage({
    title: copy.title,
    kicker: copy.tagline,
    color: LINES[guide.line].hex,
    bullet: "G",
  })
}
