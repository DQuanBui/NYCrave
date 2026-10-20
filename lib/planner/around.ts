import { neighborhoodByName } from "@/data/neighborhoods"
import { toMinutes } from "@/lib/hours"
import type { Place } from "@/types/place"
import { estimateCost } from "./estimates"
import { defaultInput, planQuery } from "./params"
import type { Mood, Slot } from "./types"

/** What slotForPlace needs to know, so the slim place cards work too. */
type SlotPlace = Pick<Place, "category" | "hours" | "dishTypes" | "drinkTypes" | "vibeTags"> & {
  photoSpot?: Pick<NonNullable<Place["photoSpot"]>, "bestLight">
}

/** The part of the day a place fits best, used to pin it into a generated plan. */
export function slotForPlace(p: SlotPlace): Slot {
  switch (p.category) {
    case "restaurant": {
      const opens = Object.values(p.hours)
        .flat()
        .map((r) => toMinutes(r.open))
      const earliest = opens.length ? Math.min(...opens) : 12 * 60
      // Brunch and bakeries fit breakfast only when they open in time for it
      const morning = p.dishTypes?.some((d) => d === "bakery" || d === "brunch")
      if (morning && earliest <= 10.5 * 60) return "breakfast"
      return earliest >= 16 * 60 || p.vibeTags.includes("date_night") ? "dinner" : "lunch"
    }
    case "drink":
      return p.drinkTypes?.some((d) => ["cocktails", "rooftop_bar", "wine_bar"].includes(d))
        ? "night"
        : "coffee"
    case "photo_spot":
      return p.photoSpot?.bestLight.some((l) => l === "night" || l === "blue_hour")
        ? "night"
        : "morning"
    case "attraction":
      return "morning"
    default:
      return "afternoon"
  }
}

function moodFor(p: Place): Mood {
  if (p.category === "restaurant") return "foodie"
  if (p.vibeTags.includes("date_night")) return "romantic"
  if (p.vibeTags.includes("tourist_classic")) return "first_timer"
  return "chill"
}

/** A My Day query for today that starts nearby and keeps this place in its natural slot. */
export function planAroundQuery(p: Place, now = new Date()): Record<string, string> {
  const input = defaultInput(now)
  const hood = neighborhoodByName(p.neighborhood)
  const slot = slotForPlace(p)
  // Leave room for the rest of the day around a pricey pick
  const budget = Math.max(input.budget, Math.ceil((estimateCost(p, slot) + 80) / 10) * 10)
  return planQuery(
    {
      ...input,
      from: hood?.slug ?? input.from,
      mood: moodFor(p),
      budget,
      end: slot === "night" ? 24 * 60 : input.end,
    },
    { locks: { [slot]: p.id } },
  )
}

type PlannablePlace = SlotPlace &
  Pick<Place, "id" | "slug" | "neighborhood" | "isFree" | "ticketInfo" | "priceLevel">

/**
 * A My Day query that fits as many saved places as possible into today, each
 * pinned to its natural slot; when two want the same slot, the one saved first
 * wins. Starts in the first pinned place's neighborhood.
 */
export function planSavedQuery(
  places: PlannablePlace[],
  now = new Date(),
): { query: Record<string, string>; pinned: string[] } {
  const input = defaultInput(now)
  const locks: Partial<Record<Slot, string>> = {}
  const pinned: PlannablePlace[] = []
  for (const p of places) {
    const slot = slotForPlace(p)
    if (locks[slot]) continue
    locks[slot] = p.id
    pinned.push(p)
  }
  const cost = pinned.reduce((n, p) => n + estimateCost(p, slotForPlace(p)), 0)
  const hood = pinned[0] ? neighborhoodByName(pinned[0].neighborhood) : undefined
  return {
    query: planQuery(
      {
        ...input,
        from: hood?.slug ?? input.from,
        budget: Math.max(input.budget, Math.ceil((cost + 60) / 10) * 10),
        end: locks.night ? 24 * 60 : input.end,
      },
      { locks },
    ),
    pinned: pinned.map((p) => p.slug),
  }
}
