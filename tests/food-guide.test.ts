import { describe, expect, it } from "vitest"
import { DISHES, placesServing } from "@/lib/food-guide"
import { getPlaces } from "@/lib/places"

const places = await getPlaces()

describe("the New York menu", () => {
  it("has places on the site for every dish", () => {
    for (const dish of DISHES) {
      expect(placesServing(dish, places).length, dish.key).toBeGreaterThan(0)
    }
  })

  it("lists places with photos first and at most four", () => {
    for (const dish of DISHES) {
      const where = placesServing(dish, places)
      expect(where.length).toBeLessThanOrEqual(4)
      const firstWithout = where.findIndex((p) => p.photos.length === 0)
      if (firstWithout >= 0)
        expect(where.slice(firstWithout).every((p) => !p.photos.length)).toBe(true)
    }
  })

  it("keeps the dish rules honest", () => {
    const serves = (key: string, slug: string) =>
      DISHES.find((d) => d.key === key)!.serves(places.find((p) => p.slug === slug)!)
    expect(serves("pastrami", "katzs-delicatessen")).toBe(true)
    expect(serves("pastrami", "redfarm-upper-west-side")).toBe(false)
    expect(serves("halalCart", "the-halal-guys-53rd-and-6th")).toBe(true)
    expect(serves("halalCart", "yemen-cafe-cobble-hill")).toBe(false)
    expect(serves("dumplings", "karczma-greenpoint")).toBe(true)
    expect(serves("slice", "joes-pizza-carmine-street")).toBe(true)
  })
})

describe("dish covers", () => {
  it("point at a real photo of a place that serves the dish", async () => {
    const { dishCover } = await import("@/lib/food-guide")
    for (const dish of DISHES) {
      const chosen = places.find((p) => p.slug === dish.cover.slug)
      expect(chosen, dish.key).toBeDefined()
      expect(chosen!.photos[dish.cover.photo], dish.key).toBeDefined()
      expect(dish.serves(chosen!), dish.key).toBe(true)
      expect(dishCover(dish, places)?.photos[0].url).toBe(chosen!.photos[dish.cover.photo].url)
    }
  })
})
