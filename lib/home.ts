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
  ko: [
    "차이나타운 만두",
    "무료 명소",
    "심야 피자",
    "이스트 빌리지 버블티",
    "루프톱",
    "코리아타운",
  ],
}
