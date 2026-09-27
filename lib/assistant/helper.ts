import en from "@/messages/en.json"
import vi from "@/messages/vi.json"
import { findNeighborhood } from "@/data/neighborhoods"
import { placeTool, planTool, searchTool } from "@/lib/assistant/tools"
import { normalizeQuery, parseQuery } from "@/lib/search"
import type { Mood } from "@/lib/planner/types"
import type { Place } from "@/types/place"

/**
 * The free, no-AI assistant. It reads a question with simple keyword rules and
 * answers from NYCrave's own search, place details, day planner and tips, so it
 * costs nothing to run and can only ever mention places that are on NYCrave.
 */

type Locale = "en" | "vi"
export type HelperAnswer = { text: string; places: string[] }

const has = (q: string, words: string[]) => words.some((w) => ` ${q} `.includes(` ${w} `))

const TIP_TOPICS = {
  airports: [
    "airport",
    "airports",
    "jfk",
    "laguardia",
    "lga",
    "newark",
    "ewr",
    "airtrain",
    "san bay",
  ],
  subway: [
    "subway",
    "metro",
    "train",
    "trains",
    "omny",
    "metrocard",
    "fare",
    "fares",
    "tau dien",
    "tau dien ngam",
    "ve tau",
  ],
  tipping: ["tip", "tips", "tipping", "tax", "taxes", "tien tip", "thue", "boa"],
  safety: ["safe", "safety", "dangerous", "emergency", "911", "an toan", "nguy hiem", "khan cap"],
  seasons: [
    "season",
    "seasons",
    "winter",
    "summer",
    "spring",
    "fall",
    "autumn",
    "christmas",
    "mua dong",
    "mua he",
    "mua xuan",
    "mua thu",
  ],
} as const

const PLAN_WORDS = [
  "plan",
  "itinerary",
  "schedule",
  "day trip",
  "lich trinh",
  "len lich",
  "ke hoach",
  "mot ngay",
]
const DETAIL_WORDS = [
  "hours",
  "open",
  "close",
  "closes",
  "when",
  "address",
  "where is",
  "get to",
  "subway",
  "gio",
  "mo cua",
  "dong cua",
  "dia chi",
  "di den",
  "may gio",
]
const GREETINGS = ["hi", "hello", "hey", "help", "xin chao", "chao", "giup"]
const THANKS = ["thanks", "thank you", "thx", "cam on"]

const MOOD_WORDS: [Mood, string[]][] = [
  ["romantic", ["romantic", "date", "couple", "hen ho", "lang man"]],
  ["foodie", ["food", "foodie", "eat", "eating", "an uong", "am thuc"]],
  ["artsy", ["art", "museum", "museums", "gallery", "nghe thuat", "bao tang"]],
  ["chill", ["chill", "relax", "relaxing", "slow", "thu thai", "thong tha"]],
  ["adventurous", ["adventure", "adventurous", "local", "hidden", "phieu luu"]],
]

/** Words in a place name that people leave out ("Katz's" for Katz's Delicatessen). */
const GENERIC = new Set(
  "the of and nyc new york museum delicatessen restaurant bakery tea parlor cafe bar park pier market street st bridge promenade house hall garden".split(
    " ",
  ),
)

/** Nicknames people use instead of the full name. */
const ALIASES: Record<string, string> = {
  met: "the-met-fifth-avenue",
  "the met": "the-met-fifth-avenue",
  "met museum": "the-met-fifth-avenue",
  moma: "moma",
  amnh: "american-museum-of-natural-history",
  "natural history museum": "american-museum-of-natural-history",
  esb: "empire-state-building",
  "empire state": "empire-state-building",
  "911 memorial": "911-memorial-and-museum",
  "grand central": "grand-central-terminal",
  "public library": "new-york-public-library-schwarzman",
  nypl: "new-york-public-library-schwarzman",
  "statue of liberty": "statue-of-liberty-ferry",
  "tuong nu than tu do": "statue-of-liberty-ferry",
  ps1: "moma-ps1",
}

function placeKeys(p: Place): string[] {
  const full = normalizeQuery(p.name)
  const words = full.split(" ").filter((w) => !GENERIC.has(w))
  return [...new Set([full, words.join(" ")])].filter((k) => k.length >= 4)
}

/** Everyday words and area names that must not stand in for a whole place. */
const COMMON = new Set(
  "street dumbo pizza natural history modern tacos chelsea times grand terminal ferry williamsburg little fifth rooftop village bagel death restaurant bronx prospect heights public library union bushwick plaza jackson roosevelt industry company arthur avenue retail sunset works housing closet diner collective herald botanic botanical stephen statue liberty island tramway greenmarket".split(
    " ",
  ),
)

/** Single words that name exactly one place, like "levain" or "guggenheim". */
function distinctiveWords(places: Place[]): Map<string, Place> {
  const seen = new Map<string, Place | null>()
  for (const p of places) {
    for (const w of new Set(normalizeQuery(p.name).split(" "))) {
      if (w.length < 5 || GENERIC.has(w) || COMMON.has(w)) continue
      seen.set(w, seen.has(w) ? null : p)
    }
  }
  return new Map([...seen].filter((e): e is [string, Place] => e[1] !== null))
}

export function findPlaceIn(question: string, places: Place[]): Place | undefined {
  const q = ` ${normalizeQuery(question)} `
  let best: { place: Place; len: number } | undefined
  const consider = (place: Place | undefined, key: string) => {
    if (place && q.includes(` ${key} `) && (!best || key.length > best.len))
      best = { place, len: key.length }
  }
  for (const [alias, slug] of Object.entries(ALIASES))
    consider(
      places.find((p) => p.slug === slug),
      alias,
    )
  for (const place of places) for (const key of placeKeys(place)) consider(place, key)
  for (const [word, place] of distinctiveWords(places)) consider(place, word)
  return best?.place
}

const L = (locale: Locale) => (locale === "vi" ? vi : en)

function tipsFor(topic: keyof typeof TIP_TOPICS, locale: Locale): string {
  const tips = L(locale).tips
  if (topic === "seasons") {
    const s = tips.seasons
    return (
      [s.spring, s.summer, s.fall, s.winter].map((x) => `- **${x.title}:** ${x.body}`).join("\n") +
      `\n\n${s.note}`
    )
  }
  return tips[topic].items.map((item: string) => `- ${item}`).join("\n")
}

export function helperAnswer(
  question: string,
  places: Place[],
  now: Date,
  locale: Locale,
): HelperAnswer {
  const h = L(locale).assistant.helper
  const q = normalizeQuery(question)

  if (has(q, THANKS)) return { text: h.thanks, places: [] }
  if (!q || (has(q, GREETINGS) && q.split(" ").length <= 3)) return { text: h.greeting, places: [] }

  // Plan a day
  if (has(q, PLAN_WORDS)) {
    const intent = parseQuery(question)
    const from = intent.neighborhood ? findNeighborhood(intent.neighborhood)?.slug : undefined
    const mood = MOOD_WORDS.find(([, words]) => has(q, words))?.[0]
    const indoors = has(q, [
      "rain",
      "rainy",
      "raining",
      "indoor",
      "indoors",
      "cold",
      "mua",
      "troi mua",
      "trong nha",
    ])
    const plan = planTool(places, { from: from ?? "midtown", mood, indoors }, now)
    if ("error" in plan || plan.stops.length === 0) return { text: h.noPlan, places: [] }
    const where = from ? (findNeighborhood(from)?.name ?? "") : "Midtown"
    const lines = plan.stops.map(
      (s) => `- **${statusText(s.time, locale)}** [${s.name}](${s.url}), ${s.neighborhood}`,
    )
    return {
      text: `${h.planIntro.replace("{from}", where)}\n\n${lines.join("\n")}\n\n[${h.planLink}](${plan.link})`,
      places: plan.stops.map((s) => s.slug),
    }
  }

  // Practical tips
  const topic = (Object.keys(TIP_TOPICS) as (keyof typeof TIP_TOPICS)[]).find((t) =>
    has(q, [...TIP_TOPICS[t]]),
  )
  const place = findPlaceIn(question, places)
  if (topic && !place) {
    return { text: `${tipsFor(topic, locale)}\n\n[${h.tipsLink}](/tips)`, places: [] }
  }

  // One place: hours, status, address and subway
  if (place) {
    const d = placeTool(places, place.slug, now)
    if (!("error" in d)) {
      const subway = d.nearestSubway[0]
      const parts = [
        `**[${d.name}](${d.url})**, ${d.neighborhood}: ${statusText(d.status, locale)}.`,
        `${h.address}: ${d.address}.`,
        subway
          ? h.subway
              .replace("{station}", subway.station)
              .replace("{trains}", subway.trains)
              .replace("{minutes}", String(subway.walkMinutes))
          : "",
        has(q, DETAIL_WORDS) ? h.checkHours : d.take,
      ]
      return { text: parts.filter(Boolean).join("\n\n"), places: [place.slug] }
    }
  }

  // Everything else: search
  const { results } = searchTool(places, question, now, 5)
  if (results.length === 0) return { text: h.noResults, places: [] }
  const lines = results.map(
    (p) => `- [${p.name}](${p.url}), ${p.neighborhood}: ${statusText(p.status, locale)}`,
  )
  return {
    text: `${h.found}\n\n${lines.join("\n")}\n\n[${h.seeAll}](/search?q=${encodeURIComponent(question)})`,
    places: results.map((p) => p.slug),
  }
}

/** The tools describe status in English; translate the few fixed shapes. */
function statusText(status: string, locale: Locale): string {
  if (locale === "en") return status
  return (
    status
      .replace("open 24 hours", "mở cửa 24 giờ")
      .replace(/^open now, until (.+)$/, "đang mở, đến $1")
      .replace(/^closed now, opens (.+)$/, "đang đóng, mở lúc $1")
      .replace("closed indefinitely", "tạm đóng cửa")
      .replace("tomorrow ", "ngày mai ")
      // "9 PM" to "21:00" (Intl puts a narrow no-break space before AM/PM)
      .replace(
        /\b(\d{1,2})(?::(\d{2}))?[\s\u202f](AM|PM)\b/g,
        (_, h: string, m: string | undefined, ap: string) => {
          const hour = (Number(h) % 12) + (ap === "PM" ? 12 : 0)
          return `${hour}:${m ?? "00"}`
        },
      )
  )
}
