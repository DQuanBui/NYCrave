import type { DietaryOption, Place } from "@/types/place"

export const MOODS = ["first_timer", "foodie", "romantic", "chill", "adventurous", "artsy"] as const
export const INTERESTS = [
  "food",
  "coffee",
  "museums",
  "art",
  "shopping",
  "photos",
  "parks",
  "views",
  "nightlife",
] as const
export const PACES = ["relaxed", "packed"] as const
export const SLOTS = [
  "breakfast",
  "morning",
  "lunch",
  "afternoon",
  "afternoon2",
  "coffee",
  "dinner",
  "night",
] as const

export type Mood = (typeof MOODS)[number]
export type Interest = (typeof INTERESTS)[number]
export type Pace = (typeof PACES)[number]
export type Slot = (typeof SLOTS)[number]

export type PlanInput = {
  /** YYYY-MM-DD, New York local date. */
  date: string
  /** Minutes after midnight. */
  start: number
  /** Minutes after midnight of `date`; may exceed 1440 for late nights. */
  end: number
  /** Neighborhood slug the day starts from. */
  from: string
  /** Per-person budget in USD, including subway fares. */
  budget: number
  mood: Mood
  interests: Interest[]
  dietary: DietaryOption[]
  pace: Pace
  weatherAware: boolean
}

/** Pin a place to a slot, or rule places out of one (used by "swap this stop"). */
export type PlanAdjustments = {
  locks?: Partial<Record<Slot, string>>
  exclude?: Partial<Record<Slot, string[]>>
}

export type Travel = { mode: "walk" | "subway"; minutes: number; km: number }

export type Stop = {
  slot: Slot
  place: Place
  /** Arrival and departure, minutes after midnight of the plan date. */
  start: number
  end: number
  /** How to get here from the previous stop (or the starting neighborhood). */
  travel: Travel
  /** Estimated spend at this stop, per person, USD. */
  cost: number
  /** Subway fare paid to get here, if any. */
  fare: number
  score: number
}

export type Plan = {
  input: PlanInput
  stops: Stop[]
  /** Slots inside the day that had no open, affordable match. */
  unfilled: Slot[]
  totalCost: number
  travelMinutes: number
  rainLikely?: boolean
}
