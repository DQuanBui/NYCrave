import type { LineColor } from "@/lib/lines"
import type { Category, Cuisine, DishType, DrinkType } from "@/types/place"

export type CategoryMeta = {
  line: LineColor
  /** Letter shown in the route bullet. */
  bullet: string
  href: string
  emoji: string
}

/** Each category rides its own subway line color. */
export const CATEGORY_META: Record<Category, CategoryMeta> = {
  restaurant: { line: "red", bullet: "E", href: "/eat", emoji: "🍜" },
  drink: { line: "orange", bullet: "S", href: "/sip", emoji: "🧋" },
  attraction: { line: "blue", bullet: "X", href: "/explore", emoji: "🗽" },
  shopping: { line: "purple", bullet: "$", href: "/shop", emoji: "🛍️" },
  photo_spot: { line: "yellow", bullet: "P", href: "/photo-spots", emoji: "📸" },
  park_pier: { line: "green", bullet: "G", href: "/parks", emoji: "🌳" },
}

export const CUISINE_EMOJI: Record<Cuisine, string> = {
  vietnamese: "🍜",
  korean: "🥘",
  japanese: "🍣",
  chinese: "🥟",
  thai: "🌶️",
  indian: "🍛",
  american: "🍔",
  italian: "🍝",
  mexican: "🌮",
  french: "🥐",
  greek: "🥙",
  middle_eastern: "🧆",
  caribbean: "🍗",
  ethiopian: "🫓",
  filipino: "🍢",
  malaysian: "🍤",
  taiwanese: "🧋",
  spanish: "🥘",
  turkish: "🫖",
  peruvian: "🐟",
  jewish_deli: "🥪",
  halal: "🥙",
  colombian: "🫔",
  dominican: "🍌",
  polish: "🥟",
  georgian: "🧀",
  west_african: "🍲",
  nepali: "🥟",
}

export const DISH_EMOJI: Record<DishType, string> = {
  bbq: "🍖",
  noodle_soup: "🍜",
  dry_noodles: "🍝",
  dumplings: "🥟",
  rice_dishes: "🍚",
  hot_pot: "🍲",
  sushi: "🍣",
  ramen: "🍜",
  curry: "🍛",
  sandwiches: "🥪",
  pizza: "🍕",
  bagels: "🥯",
  tacos: "🌮",
  brunch: "🍳",
  bakery: "🥐",
  desserts: "🍰",
  street_food: "🌭",
  seafood: "🦞",
  burgers: "🍔",
  fried_chicken: "🍗",
  vegetarian_plates: "🥗",
}

export const DRINK_EMOJI: Record<DrinkType, string> = {
  coffee: "☕",
  bubble_tea: "🧋",
  tea: "🍵",
  matcha: "🍵",
  cocktails: "🍸",
  rooftop_bar: "🌆",
  wine_bar: "🍷",
  juice: "🧃",
}

/** Rough per-person spend by price level, for planner cost estimates (USD). */
export const PRICE_LEVEL_ESTIMATE: Record<1 | 2 | 3 | 4, number> = { 1: 15, 2: 35, 3: 70, 4: 140 }
