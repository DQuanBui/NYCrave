import type { Category } from "@/types/place"

export type HeroScene = {
  key: "pho" | "rooftop" | "gallery" | "vintage" | "skyline" | "pier"
  category: Category
  emoji: string
  query: string
  /** Licensed photo in /public/hero. Until one exists, the scene renders as line-color art. */
  image?: { src: string; alt: string; credit: string }
}

export const HERO_SCENES: HeroScene[] = [
  { key: "pho", category: "restaurant", emoji: "🍜", query: "pho in Flushing" },
  { key: "rooftop", category: "drink", emoji: "🍸", query: "rooftop" },
  { key: "gallery", category: "attraction", emoji: "🖼️", query: "free Chelsea" },
  { key: "vintage", category: "shopping", emoji: "🧥", query: "vintage in Williamsburg" },
  { key: "skyline", category: "photo_spot", emoji: "🌃", query: "photo spots" },
  { key: "pier", category: "park_pier", emoji: "🌅", query: "piers" },
]

export type Mood = {
  key:
    | "dateNight"
    | "cheapEats"
    | "lateNight"
    | "rainyDay"
    | "kidFriendly"
    | "instagrammable"
    | "freeToday"
    | "openNow"
  emoji: string
  query: string
}

export const MOODS: Mood[] = [
  { key: "openNow", emoji: "🟢", query: "open now" },
  { key: "dateNight", emoji: "🕯️", query: "date night" },
  { key: "cheapEats", emoji: "💸", query: "cheap eats" },
  { key: "lateNight", emoji: "🌙", query: "late night" },
  { key: "rainyDay", emoji: "☔", query: "rainy day" },
  { key: "freeToday", emoji: "🎟️", query: "free today" },
  { key: "kidFriendly", emoji: "🧸", query: "kid friendly" },
  { key: "instagrammable", emoji: "📸", query: "instagrammable" },
]

export const SEARCH_SUGGESTIONS = [
  "pho in Queens",
  "free things to do",
  "late night ramen",
  "boba in Flushing",
  "rooftop",
  "vintage",
]
