import { z } from "zod"

/**
 * The zod schemas are the source of truth: TypeScript types are inferred from them,
 * and seed data / database rows are validated against them at load time.
 * Keep supabase/schema.sql in sync when changing this file.
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

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$|^24:00$/, "Expected HH:MM (24h), or 24:00")

/** A close time at or before the open time means the range runs past midnight. */
export const timeRangeSchema = z.object({ open: hhmm, close: hhmm })

export const weeklyHoursSchema = z.object({
  sun: z.array(timeRangeSchema),
  mon: z.array(timeRangeSchema),
  tue: z.array(timeRangeSchema),
  wed: z.array(timeRangeSchema),
  thu: z.array(timeRangeSchema),
  fri: z.array(timeRangeSchema),
  sat: z.array(timeRangeSchema),
})

export const photoSchema = z.object({
  url: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  source: z.enum(["local", "google_places", "other"]),
  /** Required for third-party photos (e.g. Google Places author attributions). */
  attribution: z.object({ text: z.string(), url: z.url().optional() }).optional(),
})

export const ticketInfoSchema = z.object({
  /** USD per adult. */
  priceRange: z.object({ min: z.number().min(0), max: z.number().min(0) }),
  bookingUrl: z.url().optional(),
  notes: z.string().optional(),
})

export const photoSpotInfoSchema = z.object({
  bestLight: z.array(z.enum(LIGHT_TIMES)).min(1),
  tips: z.array(z.string()),
})

export const parkInfoSchema = z.object({
  activities: z.array(z.string()),
  amenities: z.array(z.string()),
  seasonalNotes: z.string().optional(),
})

export const placeSchema = z.object({
  id: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1),
  category: z.enum(CATEGORIES),
  cuisines: z.array(z.enum(CUISINES)).optional(),
  dishTypes: z.array(z.enum(DISH_TYPES)).optional(),
  drinkTypes: z.array(z.enum(DRINK_TYPES)).optional(),
  shopTypes: z.array(z.enum(SHOP_TYPES)).optional(),
  dietary: z.array(z.enum(DIETARY_OPTIONS)).optional(),
  borough: z.enum(BOROUGHS),
  neighborhood: z.string().min(1),
  address: z.string().min(1),
  lat: z.number().min(40.4).max(41),
  lng: z.number().min(-74.3).max(-73.6),
  priceLevel: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  isFree: z.boolean(),
  ticketInfo: ticketInfoSchema.optional(),
  hours: weeklyHoursSchema,
  mustTry: z.array(z.string()),
  editorialTake: z.string(),
  vibeTags: z.array(z.enum(VIBE_TAGS)),
  bestTimeToVisit: z.string().optional(),
  timeNeededMinutes: z.number().int().positive().optional(),
  photos: z.array(photoSchema),
  photoSpot: photoSpotInfoSchema.optional(),
  park: parkInfoSchema.optional(),
  /** Editorial signal (0–100) until real engagement data exists. */
  trendingScore: z.number().min(0).max(100).optional(),
  googlePlaceId: z.string().optional(),
  website: z.url().optional(),
  phone: z.string().optional(),
  verified: z.boolean(),
  /** What still needs checking before `verified` can flip to true. */
  verificationNotes: z.string().optional(),
  updatedAt: z.iso.datetime(),
})

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

export type TimeRange = z.infer<typeof timeRangeSchema>
export type WeeklyHours = z.infer<typeof weeklyHoursSchema>
export type Photo = z.infer<typeof photoSchema>
export type TicketInfo = z.infer<typeof ticketInfoSchema>
export type Place = z.infer<typeof placeSchema>

/** A review snippet returned by an official API. Never stored from scraping. */
export type ApiReview = {
  source: "google_places"
  authorName: string
  authorUrl?: string
  rating: number
  text: string
  relativeTime: string
}
