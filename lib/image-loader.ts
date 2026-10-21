import { PHOTO_WIDTHS } from "./photo-widths.mjs"

/**
 * next/image loader: local photos come from the WebP copies made at build
 * time by scripts/photo-variants.mjs; anything else is used as is.
 */
export default function imageLoader({ src, width }: { src: string; width: number }): string {
  const match = /^\/photos\/([^/?#]+)\.\w+$/.exec(src)
  if (!match) return src
  const size = PHOTO_WIDTHS.find((w) => w >= width) ?? PHOTO_WIDTHS.at(-1)
  return `/img/${size}/${match[1]}.webp`
}
