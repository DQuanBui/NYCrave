import { describe, expect, it } from "vitest"
import { periodsToHours } from "@/lib/google-places"
import { placeToRow, rowToPlace } from "@/lib/place-row"
import { seedPlaces } from "@/lib/places"
import { placeSchema, type Place } from "@/types/place"

/** Optional tag lists: absent and empty mean the same thing. */
const normalize = (p: Place) => ({
  ...p,
  cuisines: p.cuisines ?? [],
  dishTypes: p.dishTypes ?? [],
  drinkTypes: p.drinkTypes ?? [],
  shopTypes: p.shopTypes ?? [],
  dietary: p.dietary ?? [],
})

describe("Supabase row mapping", () => {
  it("round-trips every seed place through a database row", () => {
    for (const place of seedPlaces()) {
      const row = placeToRow(place)
      // Postgres hands timestamps back with an explicit offset
      const back = placeSchema.parse(
        rowToPlace({ ...row, updated_at: row.updated_at.replace("Z", "+00:00") }),
      )
      expect(normalize(back)).toEqual(normalize(place))
    }
  })

  it("uses snake_case columns and nulls for missing optionals", () => {
    const row = placeToRow(seedPlaces()[0])
    expect(row).toHaveProperty("price_level")
    expect(row).toHaveProperty("is_free")
    expect(row.google_place_id).toBeNull()
  })
})

describe("Google opening hours", () => {
  it("converts periods, including past midnight", () => {
    const hours = periodsToHours([
      { open: { day: 5, hour: 17, minute: 0 }, close: { day: 6, hour: 2, minute: 0 } },
      { open: { day: 1, hour: 11, minute: 30 }, close: { day: 1, hour: 22, minute: 0 } },
    ])
    expect(hours.fri).toEqual([{ open: "17:00", close: "02:00" }])
    expect(hours.mon).toEqual([{ open: "11:30", close: "22:00" }])
    expect(hours.sun).toEqual([])
  })

  it("treats a period without a close as open 24/7", () => {
    const hours = periodsToHours([{ open: { day: 0, hour: 0, minute: 0 } }])
    expect(hours.wed).toEqual([{ open: "00:00", close: "24:00" }])
  })
})
