import type { Category } from "@/types/place"

export type HeroScene = {
  key: "dumplings" | "rooftop" | "museum" | "vintage" | "skyline" | "pier"
  category: Category
  emoji: string
  query: string
  /** Licensed photo in /public/photos. Without one, the scene renders as line-color art. */
  image?: { src: string; alt: string; credit: string; creditUrl?: string }
}

// The first scene is a two-line phrase so the headline space is filled on load
export const HERO_SCENES: HeroScene[] = [
  { key: "dumplings", category: "restaurant", emoji: "🥟", query: "dumplings in Chinatown" },
  { key: "rooftop", category: "drink", emoji: "🍸", query: "rooftop" },
  { key: "museum", category: "attraction", emoji: "🖼️", query: "museums" },
  { key: "vintage", category: "shopping", emoji: "🧥", query: "vintage in Greenpoint" },
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
  "dumplings in Chinatown",
  "free things to do",
  "late night pizza",
  "boba in the East Village",
  "rooftop",
  "museums",
]
