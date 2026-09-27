import { findNeighborhood, NEIGHBORHOODS } from "@/data/neighborhoods"
import type { LatLng } from "@/lib/geo"
import { isOpenForWindow } from "@/lib/hours"
import type { Place } from "@/types/place"
import { estimateCost, estimateTravel, SUBWAY_FARE } from "./estimates"
import { placeScore } from "./scoring"
import type { Pace, Plan, PlanAdjustments, PlanInput, Slot, Stop } from "./types"

const h = (hours: number) => Math.round(hours * 60)
/** People arrive at 9:30, not 9:27. */
const roundUp5 = (minutes: number) => Math.ceil(minutes / 5) * 5

type SlotDef = {
  slot: Slot
  /** Arrival window, minutes after midnight of the plan date. */
  earliest: number
  latest: number
  /** Food and drink stops must satisfy dietary needs. */
  food: boolean
  /** Extra stops (packed pace) are not reported when nothing fits. */
  optional?: boolean
  eligible: (p: Place) => boolean
  minutes: (p: Place, pace: Pace) => number
}

const isActivity = (p: Place) =>
  p.category === "attraction" ||
  p.category === "shopping" ||
  p.category === "photo_spot" ||
  p.category === "park_pier"

const isCafe = (p: Place) =>
  p.category === "drink" &&
  (p.drinkTypes ?? []).some((d) => ["coffee", "tea", "bubble_tea", "matcha", "juice"].includes(d))

const isNightStop = (p: Place) =>
  (p.category === "drink" &&
    (p.drinkTypes ?? []).some((d) => ["cocktails", "rooftop_bar", "wine_bar"].includes(d))) ||
  (p.category === "restaurant" && p.vibeTags.includes("late_night")) ||
  (p.category === "photo_spot" &&
    (p.photoSpot?.bestLight ?? []).some((l) => l === "night" || l === "blue_hour"))

const paced = (minutes: number, pace: Pace) =>
  Math.round(minutes * (pace === "relaxed" ? 1.15 : 0.85))

const activityMinutes = (p: Place, pace: Pace) =>
  paced(Math.min(Math.max(p.timeNeededMinutes ?? 60, 30), pace === "relaxed" ? 150 : 120), pace)

/** The shape of a day. Slots outside the chosen start/end are dropped. */
const SLOT_DEFS: SlotDef[] = [
  {
    slot: "breakfast",
    earliest: h(7),
    latest: h(10.5),
    food: true,
    eligible: (p) => p.category === "restaurant" || isCafe(p),
    minutes: (_, pace) => paced(45, pace),
  },
  {
    slot: "morning",
    earliest: h(9),
    latest: h(12),
    food: false,
    eligible: isActivity,
    minutes: activityMinutes,
  },
  {
    slot: "lunch",
    earliest: h(11.5),
    latest: h(14.5),
    food: true,
    eligible: (p) => p.category === "restaurant",
    minutes: (_, pace) => paced(60, pace),
  },
  {
    slot: "afternoon",
    earliest: h(13),
    latest: h(17),
    food: false,
    eligible: isActivity,
    minutes: activityMinutes,
  },
  {
    slot: "afternoon2",
    earliest: h(14.5),
    latest: h(18),
    food: false,
    optional: true,
    eligible: isActivity,
    minutes: activityMinutes,
  },
  {
    slot: "coffee",
    earliest: h(14),
    latest: h(17.5),
    food: true,
    eligible: isCafe,
    minutes: (_, pace) => paced(30, pace),
  },
  {
    slot: "dinner",
    earliest: h(17.5),
    latest: h(21.5),
    food: true,
    eligible: (p) => p.category === "restaurant",
    minutes: (_, pace) => paced(75, pace),
  },
  {
    slot: "night",
    earliest: h(20),
    latest: h(25),
    food: true,
    eligible: isNightStop,
    minutes: (_, pace) => paced(90, pace),
  },
]

export function weekdayOf(date: string): number {
  return new Date(`${date}T12:00:00Z`).getUTCDay()
}

export function originOf(slug: string): LatLng {
  return findNeighborhood(slug) ?? NEIGHBORHOODS.find((n) => n.slug === "midtown")!
}

export function slotsFor(input: PlanInput): SlotDef[] {
  return SLOT_DEFS.filter(
    (d) =>
      (d.slot !== "afternoon2" || input.pace === "packed") &&
      d.latest >= input.start &&
      d.earliest < input.end,
  )
}

type State = {
  t: number
  loc: LatLng
  used: Set<string>
  stops: Stop[]
  unfilled: Slot[]
  spent: number
  score: number
}

type Option = Omit<Stop, "slot"> & { adjusted: number }

type Context = {
  input: PlanInput
  places: Place[]
  weekday: number
  adjustments: PlanAdjustments
  rainLikely?: boolean
}

function options(ctx: Context, state: State, def: SlotDef): Option[] {
  const { input } = ctx
  const excluded = new Set(ctx.adjustments.exclude?.[def.slot] ?? [])
  // Places pinned to other slots are reserved for them
  for (const [slot, id] of Object.entries(ctx.adjustments.locks ?? {})) {
    if (slot !== def.slot && id) excluded.add(id)
  }

  const evaluate = (pool: Place[]) => {
    const out: Option[] = []
    for (const place of pool) {
      if (!def.eligible(place) || state.used.has(place.id) || excluded.has(place.id)) continue
      if (def.food && input.dietary.some((d) => !place.dietary?.includes(d))) continue

      const travel = estimateTravel(state.loc, place)
      const ready = state.t + travel.minutes
      const start = roundUp5(Math.max(ready, def.earliest))
      if (start > def.latest) continue
      const end = start + def.minutes(place, input.pace)
      if (end > input.end) continue
      if (!isOpenForWindow(place.hours, ctx.weekday, start, end)) continue

      const fare = travel.mode === "subway" ? SUBWAY_FARE : 0
      const cost = estimateCost(place, def.slot)
      if (state.spent + cost + fare > input.budget) continue

      const score = placeScore(place, def.slot, input, ctx.rainLikely)
      const wait = start - ready
      const adjusted = score - travel.minutes / 10 - wait / 90 - cost / Math.max(input.budget, 1)
      out.push({ place, start, end, travel, cost, fare, score, adjusted })
    }
    return out.sort((a, b) => b.adjusted - a.adjusted || a.place.id.localeCompare(b.place.id))
  }

  const lockedId = ctx.adjustments.locks?.[def.slot]
  if (lockedId) {
    const locked = evaluate(ctx.places.filter((p) => p.id === lockedId))
    // A lock that no longer fits (hours, budget) falls back to a fresh pick
    if (locked.length) return locked
  }
  return evaluate(ctx.places)
}

function take(state: State, def: SlotDef, o: Option): State {
  return {
    t: o.end,
    loc: o.place,
    used: new Set(state.used).add(o.place.id),
    stops: [...state.stops, { slot: def.slot, ...o }],
    unfilled: state.unfilled,
    spent: state.spent + o.cost + o.fare,
    score: state.score + o.adjusted,
  }
}

function skip(state: State, def: SlotDef): State {
  return def.optional ? state : { ...state, unfilled: [...state.unfilled, def.slot] }
}

function greedy(ctx: Context, state: State, defs: SlotDef[]): State {
  let s = state
  for (const def of defs) {
    const best = options(ctx, s, def)[0]
    s = best ? take(s, def, best) : skip(s, def)
  }
  return s
}

/** Fuller days win ties; each stop is worth more than a little extra travel. */
const total = (s: State) => s.score + 2 * s.stops.length

/** How many openings to try for the first stop before committing greedily. */
const BRANCHES = 3

/**
 * Deterministic day planner. Walks the slots in order, keeping each stop open for
 * the whole visit, within budget and dietary needs, and prefers nearby places so
 * the day stays clustered. The first stop is branched to avoid a greedy dead end.
 */
export function planDay(
  input: PlanInput,
  places: Place[],
  opts: PlanAdjustments & { rainLikely?: boolean } = {},
): Plan {
  const ctx: Context = {
    input,
    places: [...places].sort((a, b) => a.id.localeCompare(b.id)),
    weekday: weekdayOf(input.date),
    adjustments: { locks: opts.locks, exclude: opts.exclude },
    rainLikely: input.weatherAware ? opts.rainLikely : undefined,
  }
  const defs = slotsFor(input)
  let state: State = {
    t: input.start,
    loc: originOf(input.from),
    used: new Set(),
    stops: [],
    unfilled: [],
    spent: 0,
    score: 0,
  }

  // Skip leading slots with nothing available, then branch on the first real choice
  let i = 0
  let first: Option[] = []
  for (; i < defs.length; i++) {
    first = options(ctx, state, defs[i])
    if (first.length) break
    state = skip(state, defs[i])
  }

  let best = state
  if (i < defs.length) {
    const rest = defs.slice(i + 1)
    const candidates = first
      .slice(0, BRANCHES)
      .map((o) => greedy(ctx, take(state, defs[i], o), rest))
    best = candidates.reduce((a, b) => (total(b) > total(a) ? b : a))
  }

  return {
    input,
    stops: best.stops,
    unfilled: best.unfilled,
    totalCost: best.spent,
    travelMinutes: best.stops.reduce((sum, s) => sum + s.travel.minutes, 0),
    rainLikely: ctx.rainLikely,
  }
}
