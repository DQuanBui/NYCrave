import type { Borough, Category, Cuisine, DishType, DrinkType } from "@/types/place"

/**
 * The NYC Passport: places a visitor has been to, and the badges they earn.
 * Each stamp keeps the few facts badges need, so badges can be worked out on
 * the device without loading every place.
 */

export type Stamp = {
  at: number
  borough: Borough
  category: Category
  cuisines: Cuisine[]
  dishTypes: DishType[]
  drinkTypes: DrinkType[]
  lateNight: boolean
  free: boolean
}

export type Stamps = Record<string, Stamp>

export type BadgeKey =
  | "firstStop"
  | "fiveStops"
  | "regular"
  | "local"
  | "fiveBoroughs"
  | "worldTour"
  | "museumGoer"
  | "greenSpace"
  | "shutterbug"
  | "nightOwl"
  | "freeSpirit"
  | "pizzaPilgrim"

export type Badge = {
  key: BadgeKey
  emoji: string
  goal: number
  /** How far along a visitor is (can exceed the goal). */
  count: (stamps: Stamp[]) => number
}

const places = (s: Stamp[]) => s.length
const distinct = <T>(values: T[]) => new Set(values).size
const where = (test: (s: Stamp) => boolean) => (s: Stamp[]) => s.filter(test).length

export const BADGES: Badge[] = [
  { key: "firstStop", emoji: "🎟️", goal: 1, count: places },
  { key: "fiveStops", emoji: "🚇", goal: 5, count: places },
  { key: "regular", emoji: "🗽", goal: 15, count: places },
  { key: "local", emoji: "🏙️", goal: 40, count: places },
  { key: "fiveBoroughs", emoji: "🌉", goal: 5, count: (s) => distinct(s.map((x) => x.borough)) },
  { key: "worldTour", emoji: "🌍", goal: 8, count: (s) => distinct(s.flatMap((x) => x.cuisines)) },
  { key: "museumGoer", emoji: "🏛️", goal: 3, count: where((x) => x.category === "attraction") },
  { key: "greenSpace", emoji: "🌳", goal: 3, count: where((x) => x.category === "park_pier") },
  { key: "shutterbug", emoji: "📸", goal: 3, count: where((x) => x.category === "photo_spot") },
  { key: "nightOwl", emoji: "🦉", goal: 3, count: where((x) => x.lateNight) },
  { key: "freeSpirit", emoji: "🎈", goal: 3, count: where((x) => x.free) },
  { key: "pizzaPilgrim", emoji: "🍕", goal: 3, count: where((x) => x.dishTypes.includes("pizza")) },
]

export type BadgeProgress = { badge: Badge; count: number; earned: boolean }

export function badgeProgress(stamps: Stamps): BadgeProgress[] {
  const list = Object.values(stamps)
  return BADGES.map((badge) => {
    const count = badge.count(list)
    return { badge, count: Math.min(count, badge.goal), earned: count >= badge.goal }
  })
}

/** Badges a new stamp would unlock, for the celebration after stamping. */
export function newlyEarned(before: Stamps, after: Stamps): BadgeKey[] {
  const had = new Set(
    badgeProgress(before)
      .filter((b) => b.earned)
      .map((b) => b.badge.key),
  )
  return badgeProgress(after)
    .filter((b) => b.earned && !had.has(b.badge.key))
    .map((b) => b.badge.key)
}

/** The facts a stamp keeps about a place. */
export function stampFor(
  place: {
    borough: Borough
    category: Category
    cuisines?: Cuisine[]
    dishTypes?: DishType[]
    drinkTypes?: DrinkType[]
    vibeTags: string[]
    isFree: boolean
  },
  at: number,
): Stamp {
  return {
    at,
    borough: place.borough,
    category: place.category,
    cuisines: place.cuisines ?? [],
    dishTypes: place.dishTypes ?? [],
    drinkTypes: place.drinkTypes ?? [],
    lateNight: place.vibeTags.includes("late_night"),
    free: place.isFree,
  }
}

/** Reads stored stamps defensively: storage can hold anything. */
export function parseStamps(raw: unknown): Stamps {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {}
  const out: Stamps = {}
  for (const [slug, v] of Object.entries(raw as Record<string, unknown>)) {
    const s = v as Partial<Stamp> | null
    if (!s || typeof s.at !== "number" || typeof s.borough !== "string") continue
    if (typeof s.category !== "string") continue
    out[slug] = {
      at: s.at,
      borough: s.borough,
      category: s.category,
      cuisines: Array.isArray(s.cuisines) ? s.cuisines : [],
      dishTypes: Array.isArray(s.dishTypes) ? s.dishTypes : [],
      drinkTypes: Array.isArray(s.drinkTypes) ? s.drinkTypes : [],
      lateNight: s.lateNight === true,
      free: s.free === true,
    }
  }
  return out
}
