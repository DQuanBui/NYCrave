import { describe, expect, it } from "vitest"
import { getPlaces } from "@/lib/places"
import {
  badgeProgress,
  BADGES,
  newlyEarned,
  parseStamps,
  stampFor,
  type Stamps,
} from "@/lib/passport"
import { nearestStations } from "@/lib/subway"

const places = await getPlaces()
// Stamped the way the place page does it, with the trains at the nearest stations
const stampOf = (slug: string, at: number) => {
  const place = places.find((p) => p.slug === slug)!
  const routes = [...new Set(nearestStations(place).flatMap((s) => s.routes))]
  return stampFor({ ...place, routes }, at)
}
const stampsOf = (slugs: string[]): Stamps =>
  Object.fromEntries(slugs.map((slug, i) => [slug, stampOf(slug, 1000 + i)]))
const earned = (stamps: Stamps) =>
  badgeProgress(stamps)
    .filter((b) => b.earned)
    .map((b) => b.badge.key)

describe("passport badges", () => {
  it("starts with nothing earned", () => {
    expect(earned({})).toEqual([])
    expect(badgeProgress({}).every((b) => b.count === 0)).toBe(true)
  })

  it("earns the first stop with the first stamp", () => {
    const one = stampsOf(["katzs-delicatessen"])
    expect(earned(one)).toEqual(["firstStop"])
    expect(newlyEarned({}, one)).toEqual(["firstStop"])
    // Stamping again unlocks nothing new
    expect(newlyEarned(one, one)).toEqual([])
  })

  it("needs a stamp in every borough for all five boroughs", () => {
    const byBorough = (b: string) => places.find((p) => p.borough === b)!.slug
    const four = stampsOf(["manhattan", "brooklyn", "queens", "bronx"].map(byBorough))
    expect(earned(four)).not.toContain("fiveBoroughs")
    const five = { ...four, ...stampsOf([byBorough("staten_island")]) }
    expect(earned(five)).toContain("fiveBoroughs")
    expect(newlyEarned(four, five)).toContain("fiveBoroughs")
  })

  it("counts categories, cuisines and vibes", () => {
    const parks = places.filter((p) => p.category === "park_pier").slice(0, 3)
    expect(earned(stampsOf(parks.map((p) => p.slug)))).toContain("greenSpace")
    const pizza = places.filter((p) => p.dishTypes?.includes("pizza")).slice(0, 3)
    expect(pizza).toHaveLength(3)
    expect(earned(stampsOf(pizza.map((p) => p.slug)))).toContain("pizzaPilgrim")
    const late = places.filter((p) => p.vibeTags.includes("late_night")).slice(0, 3)
    expect(earned(stampsOf(late.map((p) => p.slug)))).toContain("nightOwl")
  })

  it("every badge can be earned with the places on the site", () => {
    const all = stampsOf(places.map((p) => p.slug))
    expect(earned(all)).toEqual(BADGES.map((b) => b.key))
  })

  it("caps progress at the goal", () => {
    const all = stampsOf(places.map((p) => p.slug))
    for (const b of badgeProgress(all)) expect(b.count).toBe(b.badge.goal)
  })

  it("reads stored stamps defensively", () => {
    expect(parseStamps(null)).toEqual({})
    expect(parseStamps([1, 2])).toEqual({})
    expect(parseStamps({ a: { at: "x" }, b: null })).toEqual({})
    const ok = parseStamps({ a: { at: 1, borough: "queens", category: "restaurant" } })
    expect(ok.a).toMatchObject({ borough: "queens", cuisines: [], lateNight: false, free: false })
  })
})

describe("sweet tooth and line hopper", () => {
  it("counts bakeries and dessert spots", () => {
    const sweets = stampsOf([
      "ferrara-bakery",
      "venieros-pasticceria",
      "levain-bakery-west-74th-street",
    ])
    expect(earned(sweets)).toContain("sweetTooth")
  })

  it("counts the different trains near stamped places", () => {
    const at = (routes: string[], i: number) =>
      stampFor({ ...places.find((p) => p.slug === "katzs-delicatessen")!, routes }, i)
    const stamps: Stamps = {
      a: at(["1", "2", "3"], 1),
      b: at(["4", "5", "6", "7"], 2),
      c: at(["A", "C", "E", "1"], 3),
    }
    expect(badgeProgress(stamps).find((b) => b.badge.key === "lineHopper")!.count).toBe(10)
    stamps.d = at(["N", "Q"], 4)
    expect(earned(stamps)).toContain("lineHopper")
  })

  it("reads stamps saved before trains were recorded", () => {
    const old = parseStamps({ x: { at: 1, borough: "manhattan", category: "restaurant" } })
    expect(old.x.routes).toEqual([])
  })
})
