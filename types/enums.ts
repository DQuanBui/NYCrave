/**
 * Enum values shared by server and client code. Kept free of zod so that client
 * components can import them without pulling the schema library into the bundle.
 */

export const CATEGORIES = [
  "restaurant",
  "drink",
  "attraction",
  "shopping",
  "photo_spot",
  "park_pier",
] as const

export const CUISINES = [
  "vietnamese",
  "korean",
  "japanese",
  "chinese",
  "thai",
  "indian",
  "american",
  "italian",
  "mexican",
  "french",
  "greek",
  "middle_eastern",
  "caribbean",
  "ethiopian",
  "filipino",
  "malaysian",
  "taiwanese",
  "spanish",
  "turkish",
  "peruvian",
  "jewish_deli",
  "halal",
  "colombian",
  "dominican",
  "polish",
  "georgian",
  "west_african",
  "nepali",
] as const

export const DISH_TYPES = [
  "bbq",
  "noodle_soup",
  "dry_noodles",
  "dumplings",
  "rice_dishes",
  "hot_pot",
  "sushi",
  "ramen",
  "curry",
  "sandwiches",
  "pizza",
  "bagels",
  "tacos",
  "brunch",
  "bakery",
  "desserts",
  "street_food",
  "seafood",
  "burgers",
  "fried_chicken",
  "vegetarian_plates",
  "pasta",
] as const

export const DRINK_TYPES = [
  "coffee",
  "bubble_tea",
  "tea",
  "matcha",
  "cocktails",
  "rooftop_bar",
  "wine_bar",
  "juice",
] as const

export const BOROUGHS = ["manhattan", "brooklyn", "queens", "bronx", "staten_island"] as const

export const VIBE_TAGS = [
  "date_night",
  "cheap_eats",
  "late_night",
  "rainy_day",
  "kid_friendly",
  "instagrammable",
  "local_favorite",
  "tourist_classic",
  "group_friendly",
  "solo_friendly",
  "outdoor",
  "quiet",
] as const

export const DIETARY_OPTIONS = ["vegetarian", "vegan", "halal", "kosher", "gluten_free"] as const

export const SHOP_TYPES = [
  "flagship",
  "vintage",
  "thrift",
  "market",
  "boutique",
  "bookstore",
  "department_store",
] as const

export const LIGHT_TIMES = [
  "sunrise",
  "morning",
  "midday",
  "golden_hour",
  "blue_hour",
  "night",
] as const

/** Index matches Date#getDay(): 0 = Sunday. */
export const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const

export type Category = (typeof CATEGORIES)[number]
export type Cuisine = (typeof CUISINES)[number]
export type DishType = (typeof DISH_TYPES)[number]
export type DrinkType = (typeof DRINK_TYPES)[number]
export type Borough = (typeof BOROUGHS)[number]
export type VibeTag = (typeof VIBE_TAGS)[number]
export type DietaryOption = (typeof DIETARY_OPTIONS)[number]
export type ShopType = (typeof SHOP_TYPES)[number]
export type LightTime = (typeof LIGHT_TIMES)[number]
export type Weekday = (typeof WEEKDAYS)[number]
