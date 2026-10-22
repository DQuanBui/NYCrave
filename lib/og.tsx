import { ImageResponse } from "next/og"

/** Brand colors for generated images (CSS variables are not available in ImageResponse). */
export const OG = {
  paper: "#f5f5f0",
  ink: "#1d1f21",
  taxi: "#fccc0a",
} as const

/**
 * Social images are drawn on request, which costs function time. These headers
 * let the CDN keep each one after the first request (Vercel clears its cache
 * on every deploy, so a changed image shows up with the next deploy).
 */
export const OG_HEADERS = {
  "Cache-Control": "public, max-age=86400",
  "CDN-Cache-Control": "public, max-age=31536000, immutable",
}

/**
 * Loads a Google font for generated images, subset to the text drawn. Returns
 * null if Google Fonts is unreachable at render time, so the default font is used.
 */
export async function loadGoogleFont(
  family: string,
  text: string,
  weight = 400,
): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(
        `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}&text=${encodeURIComponent(text)}`,
      )
    ).text()
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1]
    if (!url) return null
    const res = await fetch(url)
    return res.ok ? await res.arrayBuffer() : null
  } catch {
    return null
  }
}

export const loadAnton = (text: string) => loadGoogleFont("Anton", text)

type Font = { name: string; data: ArrayBuffer; weight: 400 | 600; style: "normal" }

/** Anton for headlines and the site's body font for everything else. */
export async function ogFonts(display: string, body: string) {
  const [anton, sans] = await Promise.all([
    loadAnton(display),
    loadGoogleFont("Be Vietnam Pro", body, 600),
  ])
  const fonts: Font[] = []
  if (anton) fonts.push({ name: "Anton", data: anton, weight: 400, style: "normal" })
  if (sans) fonts.push({ name: "Be Vietnam Pro", data: sans, weight: 600, style: "normal" })
  return { fonts, display: anton ? "Anton" : undefined, body: sans ? "Be Vietnam Pro" : undefined }
}

/** Hard-edged stripes as a gradient (repeating gradients blur in generated images). */
export function stripes(colors: string[], width: number, total = 1200): string {
  const stops: string[] = []
  for (let x = 0, i = 0; x < total; x += width, i++) {
    const c = colors[i % colors.length]
    stops.push(`${c} ${x}px`, `${c} ${x + width}px`)
  }
  return `linear-gradient(90deg, ${stops.join(", ")})`
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
    { width: size, height: size, headers: OG_HEADERS },
  )
}

const BRAND_MARK = (display?: string) => (
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
    <div style={{ fontFamily: display }}>NYCrave</div>
  </div>
)

/**
 * Share image for a section page: the line's color rule and bullet, a poster
 * headline and an optional strip of color (a CSS gradient) along the bottom.
 */
export async function sectionImage({
  title,
  kicker,
  color,
  bullet,
  band,
}: {
  title: string
  kicker: string
  /** Hex color of the page's line. */
  color: string
  bullet: string
  band?: string
}) {
  const { fonts, display, body } = await ogFonts(`${title}${bullet}NYCrave`, kicker)
  const long = title.length > 14
  const dark = color.toLowerCase() === "#fccc0a"
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: OG.paper,
        color: OG.ink,
        borderTop: `24px solid ${color}`,
        fontFamily: body,
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              background: color,
              color: dark ? OG.ink : "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 52,
              fontWeight: 800,
              fontFamily: display,
            }}
          >
            {bullet}
          </div>
          <div style={{ fontSize: 34, fontWeight: 600, maxWidth: 900 }}>{kicker}</div>
        </div>
        <div style={{ fontSize: long ? 112 : 140, lineHeight: 0.95, fontFamily: display }}>
          {title}
        </div>
        {BRAND_MARK(display)}
      </div>
      {band ? <div style={{ height: 56, display: "flex", backgroundImage: band }} /> : null}
    </div>,
    { width: 1200, height: 630, fonts, headers: OG_HEADERS },
  )
}
