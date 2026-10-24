import { getOpenStatus, isOpen, isOpenLaterToday, nycClock } from "@/lib/hours"
import type { Category, Place } from "@/types/place"

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
  {
    key: "dumplings",
    category: "restaurant",
    emoji: "🥟",
    query: "dumplings in Chinatown",
    image: {
      src: "/photos/hero-dumplings-1.jpg",
      alt: "Illustrative photo: shrimp dumplings in a bamboo steamer",
      credit: "Mshuang2, CC0",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Three_dim_sum_in_steamer_basket.jpg",
    },
  },
  {
    key: "rooftop",
    category: "drink",
    emoji: "🍸",
    query: "rooftop",
    image: {
      src: "/photos/hero-rooftop-1.jpg",
      alt: "Illustrative photo: Manhattan rooftops and towers at dusk",
      credit: "Oliver Kienzi, CC BY-SA 4.0",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Azul_Rooftop_Bar_1.jpg",
    },
  },
  {
    key: "museum",
    category: "attraction",
    emoji: "🖼️",
    query: "museums",
    image: {
      src: "/photos/hero-museum-1.jpg",
      alt: "The Temple of Dendur inside the Metropolitan Museum of Art",
      credit: "颐园居, CC BY 4.0",
      creditUrl:
        "https://commons.wikimedia.org/wiki/File:Dendur_Temple_in_Metropolitan_Museum_of_Art_20240523.jpg",
    },
  },
  {
    key: "vintage",
    category: "shopping",
    emoji: "🧥",
    query: "vintage in Greenpoint",
    image: {
      src: "/photos/hero-vintage-1.jpg",
      alt: "Illustrative photo: racks of secondhand plaid shirts",
      credit: "Ewan Munro from London, UK, CC BY-SA 2.0",
      creditUrl: "https://commons.wikimedia.org/wiki/File:Too_Much_Plaid_(4394365739).jpg",
    },
  },
  {
    key: "skyline",
    category: "photo_spot",
    emoji: "🌃",
    query: "photo spots",
    image: {
      src: "/photos/hero-skyline-1.jpg",
      alt: "Lower Manhattan's skyline lit up at blue hour",
      credit: "King of Hearts, CC BY-SA 4.0",
      creditUrl:
        "https://commons.wikimedia.org/wiki/File:Lower_Manhattan_from_Governors_Island_August_2017_panorama.jpg",
    },
  },
  {
    key: "pier",
    category: "park_pier",
    emoji: "🌅",
    query: "piers",
    image: {
      src: "/photos/hero-pier-1.jpg",
      alt: "Pier 45 in Hudson River Park with the sun low over the river",
      credit: "Tdorante10, CC BY-SA 4.0",
      creditUrl:
        "https://commons.wikimedia.org/wiki/File:Hudson_River_Park_td_(2019-04-24)_108_-_Pier_45_Sunset_Salsa.jpg",
    },
  },
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
  /** Opens this themed guide instead of a search. */
  guide?: string
}

export const MOODS: Mood[] = [
  { key: "openNow", emoji: "🟢", query: "open now" },
  { key: "dateNight", emoji: "🕯️", query: "date night", guide: "date-night" },
  { key: "cheapEats", emoji: "💸", query: "cheap eats", guide: "cheap-eats" },
  { key: "lateNight", emoji: "🌙", query: "late night", guide: "late-night" },
  { key: "rainyDay", emoji: "☔", query: "rainy day", guide: "rainy-day" },
  { key: "freeToday", emoji: "🎟️", query: "free today" },
  { key: "kidFriendly", emoji: "🧸", query: "kid friendly", guide: "with-kids" },
  { key: "instagrammable", emoji: "📸", query: "instagrammable" },
]

/** Search chips per language; each one must find places (see tests/seed.test.ts). */
export const SEARCH_SUGGESTIONS: Record<"en" | "vi" | "es" | "zh" | "ko", string[]> = {
  en: [
    "dumplings in Chinatown",
    "free things to do",
    "late night pizza",
    "boba in the East Village",
    "rooftop",
    "museums",
  ],
  vi: [
    "há cảo ở Chinatown",
    "tham quan miễn phí",
    "pizza khuya",
    "trà sữa ở East Village",
    "bar sân thượng",
    "bảo tàng",
  ],
  es: [
    "dumplings en Chinatown",
    "atracciones gratis",
    "pizza tarde en la noche",
    "bubble tea en el East Village",
    "azotea",
    "comida peruana",
  ],
  zh: ["唐人街 饺子", "免费 景点", "深夜 披萨", "东村 奶茶", "屋顶 酒吧", "韩国城"],
  ko: ["차이나타운 만두", "무료 명소", "심야 피자", "이스트 빌리지 버블티", "루프톱", "코리아타운"],
}

/**
 * Orders a row so places the rows above have not shown come first. Places already
 * shown stay at the end, so a short row still fills up.
 */
export function freshFirst<T extends { slug: string }>(list: T[], shown: Set<string>): T[] {
  return [...list.filter((p) => !shown.has(p.slug)), ...list.filter((p) => shown.has(p.slug))]
}

/** Marks the first `count` places of a row as shown. */
export function markShown(list: { slug: string }[], shown: Set<string>, count = 6) {
  for (const p of list.slice(0, count)) shown.add(p.slug)
}

/** The most recently added or updated places, newest first (trending breaks ties). */
export function newest<P extends { updatedAt: string; trendingScore?: number }>(
  places: P[],
  limit = 12,
): P[] {
  return [...places]
    .sort(
      (a, b) =>
        b.updatedAt.localeCompare(a.updatedAt) || (b.trendingScore ?? 0) - (a.trendingScore ?? 0),
    )
    .slice(0, limit)
}

/** How many likely matches the live rails get; the browser re-checks each one. */
export const LIVE_CANDIDATES = 20

/**
 * The time-dependent parts of the home page at one moment: how many places
 * are open, and the places for the "Open now" and "Free today" rows (each row
 * leads with places the trending row has not shown).
 */
export function liveHome<P extends Pick<Place, "slug" | "hours" | "isFree">>(
  all: P[],
  now: Date,
  trendingCount = 8,
) {
  const shown = new Set(all.slice(0, trendingCount).map((p) => p.slug))
  const open = freshFirst(
    all.filter((p) => {
      const { state } = getOpenStatus(p.hours, now)
      return state !== "closed" && state !== "closed_indefinitely"
    }),
    shown,
  ).slice(0, LIVE_CANDIDATES)
  markShown(open, shown)
  const clock = nycClock(now)
  const free = freshFirst(
    all.filter((p) => p.isFree && isOpenLaterToday(p.hours, clock)),
    shown,
  ).slice(0, LIVE_CANDIDATES)
  return {
    openCount: all.filter((p) => isOpen(getOpenStatus(p.hours, now))).length,
    open,
    free,
  }
}
