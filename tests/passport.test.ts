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

const places = await getPlaces()
const stampsOf = (slugs: string[]): Stamps =>
  Object.fromEntries(
    slugs.map((slug, i) => [
      slug,
      stampFor(
        places.find((p) => p.slug === slug)!,
        1000 + i,
      ),
    ]),
  )
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
