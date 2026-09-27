import { NEIGHBORHOODS } from "@/data/neighborhoods"
import { nycDateString, toMinutes } from "@/lib/hours"
import { DIETARY_OPTIONS } from "@/types/enums"
import type { DietaryOption } from "@/types/place"
import {
  INTERESTS,
  MOODS,
  PACES,
  SLOTS,
  type Interest,
  type Plan,
  type PlanAdjustments,
  type PlanInput,
  type Slot,
} from "./types"

/**
 * A plan is fully described by its URL: the planner is deterministic, so the same
 * query always rebuilds the same day. That makes share links and swaps stateless.
 */

type RawParams = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)
const list = <T extends string>(allowed: readonly T[], v: string | undefined): T[] =>
  (v ?? "").split(",").filter((x): x is T => allowed.includes(x as T))
const hhmm = (v: string | undefined, fallback: string) =>
  v && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : fallback
export const formatHHMM = (minutes: number) => {
  const m = ((minutes % 1440) + 1440) % 1440
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`
}

export function defaultInput(now = new Date()): PlanInput {
  return {
    date: nycDateString(now),
    start: 9 * 60,
    end: 22 * 60,
    from: "midtown",
    budget: 120,
    mood: "first_timer",
    interests: [],
    dietary: [],
    pace: "relaxed",
    weatherAware: true,
  }
}

function pairs(v: string | undefined): [Slot, string][] {
  return (v ?? "")
    .split(",")
    .map((pair) => pair.split(":") as [string, string])
    .filter((p): p is [Slot, string] => SLOTS.includes(p[0] as Slot) && Boolean(p[1]))
}

export function parsePlanParams(raw: RawParams, now = new Date()) {
  const d = defaultInput(now)
  const date = first(raw.d)
  const start = toMinutes(hhmm(first(raw.s), "09:00"))
  let end = toMinutes(hhmm(first(raw.e), "22:00"))
  // An end at or before the start means "past midnight"
  if (end <= start) end += 1440
  const budget = Number(first(raw.b))
  const from = first(raw.from)

  const input: PlanInput = {
    date: date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : d.date,
    start,
    end: Math.min(end, start + 20 * 60),
    from: NEIGHBORHOODS.some((n) => n.slug === from) ? from! : d.from,
    budget: Number.isFinite(budget) && budget >= 0 ? Math.min(budget, 2000) : d.budget,
    mood: MOODS.find((m) => m === first(raw.m)) ?? d.mood,
    interests: list<Interest>(INTERESTS, first(raw.i)),
    dietary: list<DietaryOption>(DIETARY_OPTIONS, first(raw.diet)),
    pace: PACES.find((p) => p === first(raw.pace)) ?? d.pace,
    weatherAware: first(raw.w) !== "0",
  }

  const exclude: Partial<Record<Slot, string[]>> = {}
  for (const [slot, id] of pairs(first(raw.x))) (exclude[slot] ??= []).push(id)
  const adjustments: PlanAdjustments = {
    locks: Object.fromEntries(pairs(first(raw.lock))),
    exclude,
  }

  return { input, adjustments, submitted: date !== undefined }
}

export function planQuery(input: PlanInput, adj: PlanAdjustments = {}): Record<string, string> {
  const q: Record<string, string> = {
    d: input.date,
    s: formatHHMM(input.start),
    e: formatHHMM(input.end),
    from: input.from,
    b: String(input.budget),
    m: input.mood,
    pace: input.pace,
  }
  if (input.interests.length) q.i = input.interests.join(",")
  if (input.dietary.length) q.diet = input.dietary.join(",")
  if (!input.weatherAware) q.w = "0"
  const locks = Object.entries(adj.locks ?? {}).map(([s, id]) => `${s}:${id}`)
  if (locks.length) q.lock = locks.join(",")
  const excludes = Object.entries(adj.exclude ?? {}).flatMap(([s, ids]) =>
    (ids ?? []).map((id) => `${s}:${id}`),
  )
  if (excludes.length) q.x = excludes.join(",")
  return q
}

/** Keep every other stop, rule out the current pick for this slot, and re-plan. */
export function swapQuery(plan: Plan, slot: Slot, adj: PlanAdjustments): Record<string, string> {
  const current = plan.stops.find((s) => s.slot === slot)
  const locks = Object.fromEntries(
    plan.stops.filter((s) => s.slot !== slot).map((s) => [s.slot, s.place.id]),
  )
  const exclude = { ...adj.exclude }
  if (current) exclude[slot] = [...(exclude[slot] ?? []), current.place.id]
  return planQuery(plan.input, { locks, exclude })
}
