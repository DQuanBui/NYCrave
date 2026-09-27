import type { Category, Place, VibeTag } from "@/types/place"
import type { Interest, Mood, PlanInput, Slot } from "./types"

type Weights = Partial<Record<VibeTag, number>> & { categories?: Partial<Record<Category, number>> }

const MOOD_WEIGHTS: Record<Mood, Weights> = {
  first_timer: { tourist_classic: 2, instagrammable: 1 },
  foodie: { local_favorite: 1.5, cheap_eats: 0.5, categories: { restaurant: 0.5 } },
  romantic: { date_night: 2, instagrammable: 0.5, quiet: 0.5, kid_friendly: -1 },
  chill: {
    quiet: 1.5,
    local_favorite: 0.5,
    outdoor: 0.5,
    tourist_classic: -0.5,
    categories: { park_pier: 1 },
  },
  adventurous: { local_favorite: 1.5, cheap_eats: 0.5, late_night: 0.5, tourist_classic: -1 },
  artsy: { quiet: 0.5, instagrammable: 0.5, categories: { attraction: 1, photo_spot: 0.5 } },
}

/** Which categories each interest pulls toward. */
const INTEREST_CATEGORIES: Record<Interest, Category[]> = {
  food: ["restaurant"],
  coffee: ["drink"],
  museums: ["attraction"],
  art: ["attraction", "photo_spot"],
  shopping: ["shopping"],
  photos: ["photo_spot"],
  parks: ["park_pier"],
  views: ["photo_spot", "attraction"],
  nightlife: ["drink"],
}

export const ACTIVITY_SLOTS: Slot[] = ["morning", "afternoon", "afternoon2"]

function interestScore(p: Place, slot: Slot, interests: Interest[]): number {
  if (interests.length === 0) return 0
  let score = 0
  for (const interest of interests) {
    if (INTEREST_CATEGORIES[interest].includes(p.category)) score += 1.5
  }
  if (
    interests.includes("views") &&
    (p.drinkTypes?.includes("rooftop_bar") || p.vibeTags.includes("instagrammable"))
  )
    score += 1
  if (interests.includes("art") && p.shopTypes?.includes("vintage")) score += 0.5
  if (interests.includes("nightlife") && (slot === "night" || p.vibeTags.includes("late_night")))
    score += 1
  // Activity slots lean hard on interests: steer away from categories nobody asked for
  if (ACTIVITY_SLOTS.includes(slot) && score === 0) score -= 1
  return score
}

function slotFit(p: Place, slot: Slot): number {
  switch (slot) {
    case "breakfast":
      return p.dishTypes?.some((d) => d === "brunch" || d === "bakery") ||
        p.drinkTypes?.includes("coffee")
        ? 1
        : 0
    case "night":
      return (
        (p.vibeTags.includes("late_night") ? 1 : 0) +
        (p.drinkTypes?.includes("rooftop_bar") ? 0.5 : 0)
      )
    case "coffee":
      return p.drinkTypes?.includes("coffee") || p.drinkTypes?.includes("matcha") ? 0.5 : 0
    default:
      return 0
  }
}

function weatherScore(p: Place, rainLikely: boolean | undefined): number {
  if (rainLikely === undefined) return 0
  const outdoor =
    p.vibeTags.includes("outdoor") || p.category === "park_pier" || p.category === "photo_spot"
  if (rainLikely) return (p.vibeTags.includes("rainy_day") ? 1.5 : 0) - (outdoor ? 2.5 : 0)
  return outdoor ? 0.5 : 0
}

/** How well a place suits this slot for this person, before travel is considered. */
export function placeScore(
  p: Place,
  slot: Slot,
  input: PlanInput,
  rainLikely: boolean | undefined,
): number {
  const w = MOOD_WEIGHTS[input.mood]
  let score = (p.trendingScore ?? 50) / 100
  for (const tag of p.vibeTags) score += w[tag] ?? 0
  score += w.categories?.[p.category] ?? 0
  score += interestScore(p, slot, input.interests)
  score += slotFit(p, slot)
  if (input.weatherAware) score += weatherScore(p, rainLikely)
  return score
}
