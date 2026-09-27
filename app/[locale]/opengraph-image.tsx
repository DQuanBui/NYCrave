import { ImageResponse } from "next/og"
import { LINES } from "@/lib/lines"
import { loadAnton, OG } from "@/lib/og"
import { CATEGORY_META } from "@/lib/taxonomy"

export const alt = "NYCrave: New York, by craving"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const BULLETS = Object.values(CATEGORY_META)

export default async function Image() {
  const headline = "New York, by craving"
  const font = await loadAnton(`NYCrave${headline}`)
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
        padding: 72,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            background: OG.taxi,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            fontWeight: 800,
          }}
        >
          NY
        </div>
        <div style={{ fontSize: 60, fontFamily: font ? "Anton" : undefined }}>Crave</div>
      </div>
      <div style={{ fontSize: 132, lineHeight: 0.95, fontFamily: font ? "Anton" : undefined }}>
        {headline}
      </div>
      <div
        style={{
          display: "flex",
          gap: 14,
          background: OG.ink,
          borderRadius: 12,
          padding: "18px 24px",
        }}
      >
        {BULLETS.map((b) => (
          <div
            key={b.bullet}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              background: LINES[b.line].hex,
              color: b.line === "yellow" ? OG.ink : "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            {b.bullet}
          </div>
        ))}
      </div>
    </div>,
    { ...size, fonts: font ? [{ name: "Anton", data: font, style: "normal" }] : undefined },
  )
}
