import type { CardPlace } from "@/lib/card-place"
import type { LatLng } from "@/lib/geo"
import { getStatusAt, nycClock, type RelativeTime } from "@/lib/hours"
import type { LineColor } from "@/lib/lines"
import { walkMinutes } from "@/lib/planner/estimates"

/**
 * "What's next": places near you, open when you would get there, picked for what
 * you just did. Runs in the browser, so the visitor's location never leaves it.
 */

export const AFTER = ["ate", "coffee", "drinks", "museum", "park", "shopping", "exploring"] as const
export type After = (typeof AFTER)[number]

export type LaneKey = "sweet" | "coffee" | "drinks" | "stroll" | "see" | "eat" | "lateBite" | "shop"

type Lane = { key: LaneKey; emoji: string; line: LineColor; match: (p: NextPlace) => boolean }

/** A card plus the editorial ranking signal. */
export type NextPlace = CardPlace & { trendingScore?: number }

const COFFEE = new Set(["coffee", "tea", "matcha", "bubble_tea", "juice"])
const BAR = new Set(["cocktails", "wine_bar", "rooftop_bar"])
const PASTRY = new Set(["bakery", "desserts", "brunch"])
/** Dessert places and pure bakeries; a restaurant that bakes its own bread does not count. */
const isSweet = (p: NextPlace) => {
  const dishes = p.dishTypes ?? []
  return (
    dishes.includes("desserts") || (dishes.includes("bakery") && dishes.every((d) => PASTRY.has(d)))
  )
}

export const LANES: Record<LaneKey, Lane> = {
  sweet: { key: "sweet", emoji: "🍰", line: "purple", match: isSweet },
  coffee: {
    key: "coffee",
    emoji: "☕",
    line: "brown",
    match: (p) => p.category === "drink" && (p.drinkTypes ?? []).some((d) => COFFEE.has(d)),
  },
  drinks: {
    key: "drinks",
    emoji: "🍸",
    line: "orange",
    match: (p) => p.category === "drink" && (p.drinkTypes ?? []).some((d) => BAR.has(d)),
  },
  stroll: {
    key: "stroll",
    emoji: "🌳",
    line: "green",
    match: (p) => p.category === "park_pier" || p.category === "photo_spot",
  },
  see: { key: "see", emoji: "🏛️", line: "blue", match: (p) => p.category === "attraction" },
  eat: {
    key: "eat",
    emoji: "🍜",
    line: "red",
    match: (p) => p.category === "restaurant" && !isSweet(p),
  },
  lateBite: {
    key: "lateBite",
    emoji: "🌙",
    line: "yellow",
    match: (p) => p.category === "restaurant" && p.vibeTags.includes("late_night"),
  },
  shop: { key: "shop", emoji: "🛍️", line: "purple", match: (p) => p.category === "shopping" },
}

/** What tends to come next, by what you just did. */
const FOLLOWS: Record<Exclude<After, "exploring">, LaneKey[]> = {
  ate: ["sweet", "coffee", "drinks", "stroll"],
  coffee: ["see", "stroll", "shop", "eat"],
  drinks: ["lateBite", "drinks", "stroll"],
  museum: ["eat", "coffee", "stroll", "see"],
  park: ["coffee", "eat", "see", "drinks"],
  shopping: ["coffee", "eat", "sweet", "see"],
}

/** Just exploring: whatever suits the hour. */
function byHour(minutes: number): LaneKey[] {
  const h = minutes / 60
  if (h >= 4 && h < 11) return ["coffee", "eat", "stroll", "see"]
  if (h >= 11 && h < 17) return ["eat", "see", "coffee", "stroll", "shop"]
  if (h >= 17 && h < 22) return ["eat", "drinks", "stroll", "sweet"]
  return ["lateBite", "drinks"]
}

/** Late at night, daytime ideas give way to bars and late food. */
function forTheHour(lanes: LaneKey[], minutes: number): LaneKey[] {
  const late = minutes >= 22 * 60 || minutes < 4 * 60
  if (!late) return lanes
  const out = lanes.filter((l) => l !== "see" && l !== "shop" && l !== "sweet" && l !== "coffee")
  for (const l of ["lateBite", "drinks"] as const) if (!out.includes(l)) out.push(l)
  return out
}

/** The category a place page implies you just did. */
export function afterFor(p: Pick<CardPlace, "category" | "drinkTypes">): After {
  switch (p.category) {
    case "restaurant":
      return "ate"
    case "drink":
      return (p.drinkTypes ?? []).some((d) => BAR.has(d)) ? "drinks" : "coffee"
    case "attraction":
      return "museum"
    case "park_pier":
    case "photo_spot":
      return "park"
    case "shopping":
      return "shopping"
  }
}

export type Suggestion = {
  place: NextPlace
  walkMinutes: number
  /** When it closes, relative to arrival; null when open around the clock. */
  closesAt: RelativeTime | null
}

export type NextLane = { key: LaneKey; emoji: string; line: LineColor; picks: Suggestion[] }

export type NextOptions = {
  from: LatLng
  after: After
  /** When you will set off (default: now). */
  leaveAt?: Date
  /** Places to leave out, e.g. the one you are at. */
  exclude?: string[]
  perLane?: number
}

/** Enough time to make a stop worth it. */
const MIN_STAY = 30
const WALKS = [15, 25]

export function whatsNext(places: NextPlace[], opts: NextOptions): NextLane[] {
  const leave = opts.leaveAt ?? new Date()
  const perLane = opts.perLane ?? 3
  const exclude = new Set(opts.exclude ?? [])
  const start = nycClock(leave).minutes
  const lanes = forTheHour(opts.after === "exploring" ? byHour(start) : FOLLOWS[opts.after], start)

  // Walkable places open on arrival; widen the circle if the neighborhood is quiet
  let nearby: Suggestion[] = []
  for (const limit of WALKS) {
    nearby = []
    for (const place of places) {
      if (exclude.has(place.slug)) continue
      const walk = walkMinutes(opts.from, place)
      if (walk > limit) continue
      const status = getStatusAt(place.hours, nycClock(new Date(leave.getTime() + walk * 60_000)))
      if (status.state === "open_24h") nearby.push({ place, walkMinutes: walk, closesAt: null })
      else if (
        (status.state === "open" || status.state === "closing_soon") &&
        status.minutesLeft >= MIN_STAY
      )
        nearby.push({ place, walkMinutes: walk, closesAt: status.closesAt })
    }
    if (nearby.length >= 6) break
  }

  const score = (s: Suggestion) => (s.place.trendingScore ?? 50) / 100 - s.walkMinutes / 12
  const used = new Set<string>()
  const out: NextLane[] = []
  for (const key of lanes) {
    const lane = LANES[key]
    const picks = nearby
      .filter((s) => lane.match(s.place) && !used.has(s.place.slug))
      .sort((a, b) => score(b) - score(a) || a.place.slug.localeCompare(b.place.slug))
      .slice(0, perLane)
    if (!picks.length) continue
    picks.forEach((s) => used.add(s.place.slug))
    out.push({ key, emoji: lane.emoji, line: lane.line, picks })
  }
  return out
}
