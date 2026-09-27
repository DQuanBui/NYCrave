import { findNeighborhood, NEIGHBORHOODS } from "@/data/neighborhoods"
import { holidayOn } from "@/lib/holidays"
import {
  formatClockTime,
  formatRange,
  getOpenStatus,
  nycClock,
  nycDateString,
  type OpenStatus,
} from "@/lib/hours"
import { parsePlanParams, planQuery } from "@/lib/planner/params"
import { planDay } from "@/lib/planner/plan"
import { INTERESTS, MOODS, type Interest, type Mood } from "@/lib/planner/types"
import { searchPlaces } from "@/lib/search"
import { nearestStations } from "@/lib/subway"
import { WEEKDAYS } from "@/types/enums"
import type { Place } from "@/types/place"

/**
 * What the assistant can look up. Every fact it states about a place comes from
 * these results, so it can recommend only places that are on NYCrave.
 */

const time = (m: number) => formatClockTime(m)
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function describeStatus(status: OpenStatus): string {
  const when = (t: { dayOffset: number; minutes: number }) =>
    t.dayOffset === 0
      ? time(t.minutes)
      : t.dayOffset === 1
        ? `tomorrow ${time(t.minutes)}`
        : time(t.minutes)
  switch (status.state) {
    case "open_24h":
      return "open 24 hours"
    case "open":
    case "closing_soon":
      return `open now, until ${when(status.closesAt)}`
    case "opening_soon":
    case "closed":
      return `closed now, opens ${when(status.opensAt)}`
    case "closed_indefinitely":
      return "closed indefinitely"
  }
}

const summary = (p: Place, now: Date) => ({
  slug: p.slug,
  url: `/place/${p.slug}`,
  name: p.name,
  category: p.category,
  neighborhood: p.neighborhood,
  borough: p.borough,
  status: describeStatus(getOpenStatus(p.hours, now)),
  priceLevel: p.isFree ? "free" : "$".repeat(p.priceLevel),
  tags: [
    ...(p.cuisines ?? []),
    ...(p.dishTypes ?? []),
    ...(p.drinkTypes ?? []),
    ...(p.shopTypes ?? []),
    ...p.vibeTags,
  ],
  take: p.editorialTake,
})

export function searchTool(places: Place[], query: string, now: Date, limit = 6) {
  const results = searchPlaces(places, query, nycClock(now)).slice(0, limit)
  return {
    query,
    results: results.map((p) => summary(p, now)),
    note: results.length
      ? undefined
      : "No NYCrave places match. Try a broader query, or say NYCrave does not list one yet.",
  }
}

export function placeTool(places: Place[], slug: string, now: Date) {
  const p = places.find((x) => x.slug === slug || x.id === slug)
  if (!p) return { error: `No NYCrave place with slug "${slug}". Use search_places first.` }
  const hours = Object.fromEntries(
    WEEKDAYS.map((d, i) => [
      DAY_NAMES[i],
      p.hours[d].length ? p.hours[d].map((r) => formatRange(r)).join(", ") : "closed",
    ]),
  )
  return {
    ...summary(p, now),
    address: p.address,
    hours,
    hoursNote: p.verified
      ? undefined
      : "Researched from official sources but not yet confirmed with the venue; suggest checking before going.",
    holidayToday: holidayOn(nycDateString(now))?.key,
    mustTry: p.mustTry,
    bestTimeToVisit: p.bestTimeToVisit,
    timeNeededMinutes: p.timeNeededMinutes,
    tickets: p.ticketInfo
      ? {
          fromUsd: p.ticketInfo.priceRange.min,
          toUsd: p.ticketInfo.priceRange.max,
          notes: p.ticketInfo.notes,
        }
      : undefined,
    photoTips: p.photoSpot,
    park: p.park,
    nearestSubway: nearestStations(p).map((s) => ({
      station: s.name,
      trains: s.routes.join(" "),
      walkMinutes: s.walkMinutes,
    })),
    website: p.website,
  }
}

export type PlanToolInput = {
  from: string
  mood?: Mood
  date?: string
  start?: string
  end?: string
  budget?: number
  interests?: Interest[]
  /** Put indoor stops first, as the planner does when rain is likely. */
  indoors?: boolean
}

export function planTool(places: Place[], input: PlanToolInput, now: Date) {
  const from = findNeighborhood(input.from)?.slug
  if (!from) {
    return {
      error: `Unknown neighborhood "${input.from}". Known: ${NEIGHBORHOODS.map((n) => n.slug).join(", ")}`,
    }
  }
  const raw: Record<string, string> = {
    d: input.date ?? nycDateString(now),
    from,
    m: input.mood && MOODS.includes(input.mood) ? input.mood : "first_timer",
  }
  if (!input.indoors) raw.w = "0"
  if (input.start) raw.s = input.start
  if (input.end) raw.e = input.end
  if (input.budget !== undefined) raw.b = String(input.budget)
  const interests = (input.interests ?? []).filter((i) => INTERESTS.includes(i))
  if (interests.length) raw.i = interests.join(",")

  const { input: planInput } = parsePlanParams(raw, now)
  const plan = planDay(planInput, places, { rainLikely: input.indoors })
  return {
    link: `/my-day?${new URLSearchParams(planQuery(planInput)).toString()}`,
    date: planInput.date,
    stops: plan.stops.map((s) => ({
      time: time(s.start),
      slot: s.slot,
      slug: s.place.slug,
      url: `/place/${s.place.slug}`,
      name: s.place.name,
      neighborhood: s.place.neighborhood,
      travel: `${s.travel.minutes} min ${s.travel.mode === "walk" ? "walk" : "by subway"}`,
      costUsd: s.cost,
    })),
    totalCostUsd: plan.totalCost,
    unfilled: plan.unfilled,
  }
}

/** Plain facts for general questions; mirrors the Tourist tips page. */
export const TIPS = {
  subway:
    "Pay with a contactless card, phone or watch at OMNY readers; the base fare is $3. After 12 paid rides in 7 days on the same card, the rest of that week is free. Subway-bus transfers within two hours are free. Uptown = north, downtown = south. Local trains stop everywhere, express trains skip stops. Service changes are common at nights and weekends: check mta.info.",
  tipping:
    "Sit-down restaurants: 18–22% of the pre-tax bill. Bars: $1–2 per drink or about 20%. Counter service and coffee: optional. Taxis and rideshares: 15–20%. NYC sales tax is 8.875% and usually is not included in listed prices. The Tourist tips page has a tip calculator.",
  safety:
    "Let riders off before boarding. Stand right, walk left on escalators. Keep bags zipped and phones in hand in crowds. Avoid an empty car on a busy train. Emergencies: 911. City services: 311.",
  airports:
    "JFK: AirTrain to Jamaica (E, J, Z or LIRR) or Howard Beach (A); AirTrain fare is paid on exit. Yellow taxis have a flat fare between JFK and Manhattan plus tolls and tip. LaGuardia: Q70 LaGuardia Link bus to Jackson Heights–Roosevelt Av or the LIRR at Woodside. Newark: AirTrain Newark to the airport rail station, then NJ Transit or Amtrak to Penn Station. Use official taxi lines only. Details: panynj.gov.",
  seasons:
    "Spring: cherry blossoms. Summer: free outdoor concerts and movies; public beaches Memorial Day to Labor Day. Fall: foliage, the Village Halloween Parade (Oct 31), the NYC Marathon (early November). Winter: holiday windows and lights, ice rinks, New Year's Eve in Times Square. Dates change yearly.",
} as const

export type TipTopic = keyof typeof TIPS
