import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { placeToRow } from "@/lib/place-row"
import { invalidatePlaces, seedPlaces } from "@/lib/places"
import { supabaseWriter } from "@/lib/supabase"
import type { Category, Place } from "@/types/place"

/**
 * Admin writes. Supabase (service role) when configured; otherwise, in local
 * development only, the JSON seed files are edited in place.
 */

export type WriteBackend = "supabase" | "json" | "readonly"

export function writeBackend(): WriteBackend {
  if (supabaseWriter()) return "supabase"
  return process.env.NODE_ENV === "development" ? "json" : "readonly"
}

const FILES: Record<Category, string> = {
  restaurant: "restaurants.json",
  drink: "drinks.json",
  attraction: "attractions.json",
  shopping: "shopping.json",
  photo_spot: "photo-spots.json",
  park_pier: "parks-piers.json",
}

const dataPath = (file: string) => path.join(process.cwd(), "data", file)

async function saveToJson(place: Place) {
  // Remove from every file first, so a category change moves the entry
  for (const file of Object.values(FILES)) {
    const list = JSON.parse(await readFile(dataPath(file), "utf8")) as Place[]
    const next = list.filter((p) => p.id !== place.id)
    if (file === FILES[place.category]) next.push(place)
    if (next.length !== list.length || file === FILES[place.category]) {
      await writeFile(dataPath(file), `${JSON.stringify(next, null, 2)}\n`)
    }
  }
}

export async function savePlace(place: Place): Promise<void> {
  const backend = writeBackend()
  if (backend === "readonly") throw new Error("No writable backend: configure Supabase")
  if (backend === "supabase") {
    const { error } = await supabaseWriter()!.from("places").upsert(placeToRow(place))
    if (error) throw new Error(error.message)
  } else {
    await saveToJson(place)
  }
  invalidatePlaces()
}

/** Upserts every JSON seed entry into Supabase. Returns how many were written. */
export async function syncSeedToSupabase(): Promise<number> {
  const writer = supabaseWriter()
  if (!writer) throw new Error("Supabase service role key is not configured")
  const rows = seedPlaces().map(placeToRow)
  const { error } = await writer.from("places").upsert(rows)
  if (error) throw new Error(error.message)
  invalidatePlaces()
  return rows.length
}
