import { neighborhoodByName } from "@/data/neighborhoods"
import { toMinutes } from "@/lib/hours"
import type { Place } from "@/types/place"
import { defaultInput, planQuery } from "./params"
import type { Mood, Slot } from "./types"

/** The part of the day a place fits best, used to pin it into a generated plan. */
export function slotForPlace(p: Place): Slot {
  switch (p.category) {
    case "restaurant": {
      if (p.dishTypes?.some((d) => d === "bakery" || d === "brunch")) return "breakfast"
      const opens = Object.values(p.hours)
        .flat()
        .map((r) => toMinutes(r.open))
      const earliest = opens.length ? Math.min(...opens) : 12 * 60
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
  return planQuery(
    {
      ...input,
      from: hood?.slug ?? input.from,
      mood: moodFor(p),
      end: slotForPlace(p) === "night" ? 24 * 60 : input.end,
    },
    { locks: { [slotForPlace(p)]: p.id } },
  )
}
