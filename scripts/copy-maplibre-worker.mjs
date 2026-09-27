// Copies the MapLibre module worker into public/ so it is served same-origin.
// MapLibre resolves its worker relative to import.meta.url, which bundlers rewrite.
import { copyFileSync, mkdirSync } from "node:fs"

const from = "node_modules/maplibre-gl/dist"
const to = "public/maplibre"
mkdirSync(to, { recursive: true })
for (const file of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(`${from}/${file}`, `${to}/${file}`)
}
