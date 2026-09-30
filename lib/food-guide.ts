import { toCard, type CardPlace } from "@/lib/card-place"
import type { LineColor } from "@/lib/lines"
import type { Place } from "@/types/place"

/**
 * "The New York menu": the city's signature foods, each linked to places on
 * NYCrave that serve it. Descriptions live in the message files; which places
 * qualify is worked out from the data, so the guide grows with the site.
 */

export type DishKey =
  | "slice"
  | "pastrami"
  | "bagel"
  | "halalCart"
  | "dumplings"
  | "pho"
  | "ramen"
  | "tacos"
  | "koreanBbq"
  | "bubbleTea"
  | "sweets"

export type Dish = {
  key: DishKey
  emoji: string
  line: LineColor
  serves: (p: Place) => boolean
  /** The photo that shows the dish best: a place's slug and photo index. */
  cover: { slug: string; photo: number }
}

const has = <T>(list: T[] | undefined, value: T) => (list ?? []).includes(value)
const words = (p: Place) => [p.name, ...p.mustTry, p.editorialTake].join(" ").toLowerCase()

export const DISHES: Dish[] = [
  {
    key: "slice",
    cover: { slug: "joes-pizza-carmine-street", photo: 1 },
    emoji: "🍕",
    line: "red",
    serves: (p) => has(p.dishTypes, "pizza"),
  },
  {
    key: "pastrami",
    cover: { slug: "2nd-ave-deli-murray-hill", photo: 0 },
    emoji: "🥪",
    line: "orange",
    serves: (p) => has(p.cuisines, "jewish_deli") && /pastrami/.test(words(p)),
  },
  {
    key: "bagel",
    cover: { slug: "russ-and-daughters", photo: 1 },
    emoji: "🥯",
    line: "yellow",
    serves: (p) => has(p.dishTypes, "bagels") || /\bbagels?\b|\blox\b/.test(words(p)),
  },
  {
    key: "halalCart",
    cover: { slug: "the-halal-guys-53rd-and-6th", photo: 0 },
    emoji: "🍗",
    line: "green",
    serves: (p) =>
      has(p.cuisines, "halal") &&
      has(p.dishTypes, "street_food") &&
      has(p.dishTypes, "rice_dishes"),
  },
  {
    key: "dumplings",
    cover: { slug: "nan-xiang-xiao-long-bao-flushing", photo: 0 },
    emoji: "🥟",
    line: "blue",
    serves: (p) =>
      has(p.dishTypes, "dumplings") || /dumpling|xiao long|pierogi|khinkali|momo/.test(words(p)),
  },
  {
    key: "pho",
    cover: { slug: "madame-vo-east-village", photo: 0 },
    emoji: "🍜",
    line: "purple",
    serves: (p) => /\bpho\b|phở/.test(words(p)),
  },
  {
    key: "ramen",
    cover: { slug: "ippudo-east-village", photo: 0 },
    emoji: "🍥",
    line: "red",
    serves: (p) => has(p.dishTypes, "ramen"),
  },
  {
    key: "tacos",
    cover: { slug: "los-tacos-no-1-chelsea-market", photo: 0 },
    emoji: "🌮",
    line: "orange",
    serves: (p) => has(p.dishTypes, "tacos"),
  },
  {
    key: "koreanBbq",
    cover: { slug: "jongro-bbq-koreatown", photo: 0 },
    emoji: "🥩",
    line: "brown",
    serves: (p) => has(p.cuisines, "korean") && has(p.dishTypes, "bbq"),
  },
  {
    key: "bubbleTea",
    cover: { slug: "xing-fu-tang-east-village", photo: 0 },
    emoji: "🧋",
    line: "lime",
    serves: (p) => has(p.drinkTypes, "bubble_tea") || has(p.drinkTypes, "matcha"),
  },
  {
    key: "sweets",
    cover: { slug: "dominique-ansel-bakery-soho", photo: 0 },
    emoji: "🍰",
    line: "purple",
    serves: (p) => /cheesecake|cookie|cronut|babka|knafeh/.test(words(p)),
  },
]

/** Places that serve a dish, best known first, ones with photos ahead of the rest. */
export function placesServing(dish: Dish, places: Place[], limit = 4): Place[] {
  return places
    .filter(dish.serves)
    .sort(
      (a, b) =>
        Number(b.photos.length > 0) - Number(a.photos.length > 0) ||
        (b.trendingScore ?? 0) - (a.trendingScore ?? 0) ||
        a.slug.localeCompare(b.slug),
    )
    .slice(0, limit)
}

/** Etiquette notes shown under the menu, in this order. */
export const LOCAL_TIPS = ["fold", "counter", "bodega", "walkIns", "cash", "late"] as const

/** The dish's cover as a card showing its chosen photo, or any photo of a place serving it. */
export function dishCover(dish: Dish, places: Place[]): CardPlace | null {
  const chosen = places.find((p) => p.slug === dish.cover.slug)
  const photo = chosen?.photos[dish.cover.photo]
  if (chosen && photo)
    return { ...toCard(chosen), photos: [toCard({ ...chosen, photos: [photo] }).photos[0]] }
  const fallback = placesServing(dish, places).find((p) => p.photos.length > 0)
  return fallback ? toCard(fallback) : null
}
