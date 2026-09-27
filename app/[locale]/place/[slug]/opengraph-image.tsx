import { ImageResponse } from "next/og"
import { LINES } from "@/lib/lines"
import { loadAnton, OG } from "@/lib/og"
import { getPlaceBySlug } from "@/lib/places"
import { CATEGORY_META } from "@/lib/taxonomy"

export const alt = "A place on NYCrave"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const place = await getPlaceBySlug((await params).slug)
  const name = place?.name ?? "NYCrave"
  const meta = place ? CATEGORY_META[place.category] : CATEGORY_META.restaurant
  const color = LINES[meta.line].hex
  const font = await loadAnton(`${name}NYCrave`)

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: OG.paper,
        color: OG.ink,
        borderTop: `24px solid ${color}`,
        padding: 72,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 48,
            background: color,
            color: meta.line === "yellow" ? OG.ink : "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 52,
            fontWeight: 800,
          }}
        >
          {meta.bullet}
        </div>
        <div style={{ fontSize: 34, fontWeight: 600 }}>
          {place ? `${place.neighborhood}, New York` : "New York"}
        </div>
      </div>
      <div style={{ fontSize: 120, lineHeight: 0.95, fontFamily: font ? "Anton" : undefined }}>
        {name}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 32 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            background: OG.taxi,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 800,
          }}
        >
          NY
        </div>
        <div style={{ fontFamily: font ? "Anton" : undefined }}>NYCrave</div>
      </div>
    </div>,
    { ...size, fonts: font ? [{ name: "Anton", data: font, style: "normal" }] : undefined },
  )
}
