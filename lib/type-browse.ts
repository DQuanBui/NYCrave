import type { PlaceFilter } from "@/lib/place-filters"
import { CUISINE_EMOJI, DISH_EMOJI, DRINK_EMOJI } from "@/lib/taxonomy"
import {
  CUISINES,
  DISH_TYPES,
  DRINK_TYPES,
  SHOP_TYPES,
  type Category,
  type Place,
  type ShopType,
} from "@/types/place"

export const SHOP_EMOJI: Record<ShopType, string> = {
  flagship: "🏬",
  vintage: "🧥",
  thrift: "♻️",
  market: "🧺",
  boutique: "👗",
  bookstore: "📚",
  department_store: "🛍️",
}

type TypeKindConfig = {
  values: readonly string[]
  category: Category
  base: string
  emoji: Record<string, string>
  field: (p: Place) => readonly string[] | undefined
  filter: (value: string) => PlaceFilter
}

/**
 * Every "browse by type" axis in one place: which enum it walks, where its pages
 * live, which place field it reads and which filter it sets.
 */
export const TYPE_KINDS = {
  cuisine: {
    values: CUISINES,
    category: "restaurant",
    base: "/eat/cuisine",
    emoji: CUISINE_EMOJI as Record<string, string>,
    field: (p: Place): readonly string[] | undefined => p.cuisines,
    filter: (v: string): PlaceFilter => ({ cuisine: v as PlaceFilter["cuisine"] }),
  },
  dish: {
    values: DISH_TYPES,
    category: "restaurant",
    base: "/eat/dish",
    emoji: DISH_EMOJI as Record<string, string>,
    field: (p: Place): readonly string[] | undefined => p.dishTypes,
    filter: (v: string): PlaceFilter => ({ dishType: v as PlaceFilter["dishType"] }),
  },
  drink: {
    values: DRINK_TYPES,
    category: "drink",
    base: "/sip",
    emoji: DRINK_EMOJI as Record<string, string>,
    field: (p: Place): readonly string[] | undefined => p.drinkTypes,
    filter: (v: string): PlaceFilter => ({ drinkType: v as PlaceFilter["drinkType"] }),
  },
  shop: {
    values: SHOP_TYPES,
    category: "shopping",
    base: "/shop",
    emoji: SHOP_EMOJI as Record<string, string>,
    field: (p: Place): readonly string[] | undefined => p.shopTypes,
    filter: (v: string): PlaceFilter => ({ shopType: v as PlaceFilter["shopType"] }),
  },
} satisfies Record<string, TypeKindConfig>

export type TypeKind = keyof typeof TYPE_KINDS

/** Browse grids shown on each category page. */
export const CATEGORY_TYPE_KINDS: Partial<Record<Category, TypeKind[]>> = {
  restaurant: ["cuisine", "dish"],
  drink: ["drink"],
  shopping: ["shop"],
}

/**
 * Message key for a type value, e.g. ("drink", "bubble_tea") -> "drinkType.bubble_tea".
 * The return type is narrowed to one valid key shape so typed `t()` accepts it;
 * every kind's keys exist in messages/en.json (enforced by the enums).
 */
export function typeMessageKey(kind: TypeKind, value: string) {
  const ns = { cuisine: "cuisine", dish: "dish", drink: "drinkType", shop: "shopType" }[kind]
  return `${ns}.${value}` as `cuisine.${(typeof CUISINES)[number]}`
}

export function countByType(kind: TypeKind, pool: Place[]) {
  const k = TYPE_KINDS[kind]
  return k.values
    .map((value, order) => ({
      value,
      order,
      count: pool.filter((p) => k.field(p)?.includes(value)).length,
    }))
    .sort((a, b) => b.count - a.count || a.order - b.order)
}
