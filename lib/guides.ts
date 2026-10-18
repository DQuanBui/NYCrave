import type { LineColor } from "@/lib/lines"
import { CATEGORIES } from "@/types/enums"
import type { Category, Place } from "@/types/place"

/**
 * Themed guides: every place on NYCrave that fits a kind of day, grouped by
 * what it is. Membership comes from each place's own data (free, vibe tags,
 * price), so a guide grows on its own as places are added.
 */

export type GuideKey =
  "free" | "rainyDay" | "withKids" | "lateNight" | "dateNight" | "cheapEats" | "solo" | "outdoors"

export type Guide = {
  key: GuideKey
  slug: string
  emoji: string
  line: LineColor
  matches: (p: Place) => boolean
}

const tagged = (tag: Place["vibeTags"][number]) => (p: Place) => p.vibeTags.includes(tag)

export const GUIDES: Guide[] = [
  { key: "free", slug: "free", emoji: "🎟️", line: "green", matches: (p) => p.isFree },
  { key: "rainyDay", slug: "rainy-day", emoji: "☔", line: "blue", matches: tagged("rainy_day") },
  {
    key: "withKids",
    slug: "with-kids",
    emoji: "🧸",
    line: "orange",
    matches: tagged("kid_friendly"),
  },
  {
    key: "lateNight",
    slug: "late-night",
    emoji: "🌙",
    line: "purple",
    matches: tagged("late_night"),
  },
  { key: "dateNight", slug: "date-night", emoji: "🕯️", line: "red", matches: tagged("date_night") },
  {
    key: "cheapEats",
    slug: "cheap-eats",
    emoji: "💸",
    line: "yellow",
    matches: (p) =>
      p.vibeTags.includes("cheap_eats") ||
      ((p.category === "restaurant" || p.category === "drink") && p.priceLevel === 1),
  },
  { key: "solo", slug: "solo", emoji: "🎧", line: "gray", matches: tagged("solo_friendly") },
  { key: "outdoors", slug: "outdoors", emoji: "🌳", line: "lime", matches: tagged("outdoor") },
]

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug)

/** Number of tips each guide has in the messages. */
export const GUIDE_TIPS = 3

/** A guide's places in category order, skipping empty categories. */
export function guideSections(guide: Guide, places: Place[]) {
  const mine = places.filter(guide.matches)
  return CATEGORIES.map((category: Category) => ({
    category,
    places: mine.filter((p) => p.category === category),
  })).filter((s) => s.places.length > 0)
}
