import { ImageResponse } from "next/og"

/** Brand colors for generated images (CSS variables are not available in ImageResponse). */
export const OG = {
  paper: "#f5f5f0",
  ink: "#1d1f21",
  taxi: "#fccc0a",
} as const

/**
 * Loads Anton for generated images, subset to the text drawn. Falls back to the
 * default font (returns null) if Google Fonts is unreachable at render time.
 */
export async function loadAnton(text: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=Anton&text=${encodeURIComponent(text)}`)
    ).text()
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1]
    if (!url) return null
    const res = await fetch(url)
    return res.ok ? await res.arrayBuffer() : null
  } catch {
    return null
  }
}

/** The app mark: "NY" on a taxi-yellow disc. `maskable` fills the square for adaptive icons. */
export function iconResponse(size: number, opts: { maskable?: boolean } = {}) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: opts.maskable ? OG.taxi : "transparent",
      }}
    >
      <div
        style={{
          width: opts.maskable ? size * 0.72 : size,
          height: opts.maskable ? size * 0.72 : size,
          borderRadius: "50%",
          background: OG.taxi,
          color: OG.ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size * (opts.maskable ? 0.34 : 0.46),
          fontWeight: 800,
          letterSpacing: -size * 0.02,
        }}
      >
        NY
      </div>
    </div>,
    { width: size, height: size },
  )
}
