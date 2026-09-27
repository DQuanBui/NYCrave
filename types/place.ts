import { z } from "zod"
import {
  BOROUGHS,
  CATEGORIES,
  CUISINES,
  DIETARY_OPTIONS,
  DISH_TYPES,
  DRINK_TYPES,
  LIGHT_TIMES,
  SHOP_TYPES,
  VIBE_TAGS,
} from "./enums"

export * from "./enums"

/**
 * The zod schemas are the source of truth: TypeScript types are inferred from them,
 * and seed data / database rows are validated against them at load time.
 * Keep supabase/schema.sql in sync when changing this file.
 */

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
