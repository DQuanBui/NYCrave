import { CATEGORY_META, CUISINE_EMOJI, DISH_EMOJI, DRINK_EMOJI } from "@/lib/taxonomy"
import type { CardPlace } from "@/lib/card-place"

/** The most specific emoji for a place, used on placeholder art. */
export function placeEmoji(p: CardPlace): string {
  if (p.dishTypes?.[0]) return DISH_EMOJI[p.dishTypes[0]]
  if (p.cuisines?.[0]) return CUISINE_EMOJI[p.cuisines[0]]
  if (p.drinkTypes?.[0]) return DRINK_EMOJI[p.drinkTypes[0]]
  return CATEGORY_META[p.category].emoji
}

/** Message keys for the short descriptors shown on a card, most specific first. */
export function placeTagKeys(p: CardPlace, max = 2) {
  const keys = [
    ...(p.cuisines ?? []).map((c) => `cuisine.${c}` as const),
    ...(p.dishTypes ?? []).map((d) => `dish.${d}` as const),
    ...(p.drinkTypes ?? []).map((d) => `drinkType.${d}` as const),
    ...(p.shopTypes ?? []).map((s) => `shopType.${s}` as const),
    ...(p.photoSpot?.bestLight ?? []).map((l) => `light.${l}` as const),
    ...p.vibeTags.map((v) => `vibe.${v}` as const),
  ]
  return keys.slice(0, max)
}
