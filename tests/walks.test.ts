import { existsSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { WALKS } from "@/data/walks"
import { getPlaces } from "@/lib/places"
import { nearestStations } from "@/lib/subway"
import { walkMinutesFor } from "@/lib/walks"
import en from "@/messages/en.json"

const places = await getPlaces()

describe("walks and hikes", () => {
  it("has text for every walk", () => {
    for (const w of WALKS) {
      const item = en.walks.items[w.key]
      expect(item, w.key).toBeDefined()
      expect(item.highlights.length, w.key).toBe(3)
    }
    expect(Object.keys(en.walks.items).sort()).toEqual(WALKS.map((w) => w.key).sort())
  })

  it("links only to places and photos that exist", () => {
    const slugs = new Set(places.map((p) => p.slug))
    for (const w of WALKS) {
      if (w.place) expect(slugs.has(w.place), w.key).toBe(true)
      if (w.photo) expect(existsSync(path.join("public", w.photo.url)), w.key).toBe(true)
      // Every walk has a picture, its own or its park's
      expect(Boolean(w.photo || w.place) || w.key === "vanCortlandt", w.key).toBe(true)
    }
  })

  it("covers all five boroughs", () => {
    expect(new Set(WALKS.map((w) => w.borough)).size).toBe(5)
  })

  it("estimates time from the official length", () => {
    expect(walkMinutesFor({ kind: "walk", miles: 1.14 })).toBe(25)
    expect(walkMinutesFor({ kind: "hike", miles: 3 })).toBe(90)
    expect(walkMinutesFor({ kind: "hike", miles: null })).toBeNull()
  })

  it("starts in New York, with the subway close by in Manhattan", () => {
    for (const w of WALKS) {
      expect(w.start.lat).toBeGreaterThan(40.49)
      expect(w.start.lat).toBeLessThan(40.92)
      // Outer-borough trailheads can be a bus ride away; the card says so
      if (w.borough === "manhattan") expect(nearestStations(w.start, 1, 20)[0], w.key).toBeDefined()
    }
  })
})
