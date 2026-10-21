// Resizes every photo in public/photos to WebP at the widths lib/image-loader.ts
// asks for, so pages never need an on-demand image optimizer (Vercel's is
// metered, and a free project gets paused when it runs out).
// Files already newer than their source are skipped, so reruns are quick.
import { mkdirSync, readdirSync, statSync } from "node:fs"
import { availableParallelism } from "node:os"
import sharp from "sharp"
import { PHOTO_WIDTHS } from "../lib/photo-widths.mjs"

const from = "public/photos"
const to = "public/img"

const jobs = []
for (const width of PHOTO_WIDTHS) {
  mkdirSync(`${to}/${width}`, { recursive: true })
  for (const file of readdirSync(from)) {
    if (!/\.(jpe?g|png|webp)$/i.test(file)) continue
    const src = `${from}/${file}`
    const out = `${to}/${width}/${file.replace(/\.\w+$/, ".webp")}`
    try {
      if (statSync(out).mtimeMs >= statSync(src).mtimeMs) continue
    } catch {}
    jobs.push({ src, out, width })
  }
}

let next = 0
async function worker() {
  while (next < jobs.length) {
    const { src, out, width } = jobs[next++]
    await sharp(src)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 74, effort: 4 })
      .toFile(out)
  }
}
const started = Date.now()
await Promise.all(Array.from({ length: Math.max(2, availableParallelism()) }, worker))
if (jobs.length)
  console.log(
    `photo-variants: ${jobs.length} files in ${((Date.now() - started) / 1000).toFixed(1)}s`,
  )
