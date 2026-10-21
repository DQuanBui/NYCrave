import { readdirSync } from "node:fs"
import { describe, expect, it } from "vitest"
import imageLoader from "@/lib/image-loader"
import { PHOTO_WIDTHS } from "@/lib/photo-widths.mjs"

describe("imageLoader", () => {
  it("serves local photos from the pre-sized WebP copies", () => {
    expect(imageLoader({ src: "/photos/central-park-1.jpg", width: 640 })).toBe(
      "/img/640/central-park-1.webp",
    )
  })

  it("rounds up to the next width made, and caps at the largest", () => {
    expect(imageLoader({ src: "/photos/a.jpg", width: 200 })).toBe("/img/384/a.webp")
    expect(imageLoader({ src: "/photos/a.jpg", width: 3840 })).toBe(
      `/img/${PHOTO_WIDTHS.at(-1)}/a.webp`,
    )
  })

  it("leaves other images alone", () => {
    const url = "https://places.googleapis.com/v1/places/x/photos/y/media?maxWidthPx=800"
    expect(imageLoader({ src: url, width: 640 })).toBe(url)
    expect(imageLoader({ src: "/icon.png", width: 64 })).toBe("/icon.png")
  })

  it("only asks for widths the build makes", () => {
    for (const width of [16, 160, 384, 640, 1080, 1100, 2048])
      expect(PHOTO_WIDTHS).toContain(
        Number(/\/img\/(\d+)\//.exec(imageLoader({ src: "/photos/a.jpg", width }))![1]),
      )
  })

  it("handles every photo file name", () => {
    for (const file of readdirSync("public/photos"))
      expect(imageLoader({ src: `/photos/${file}`, width: 640 })).toMatch(/^\/img\/640\/.+\.webp$/)
  })
})
