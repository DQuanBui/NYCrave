import en from "@/messages/en.json"
import es from "@/messages/es.json"
import ko from "@/messages/ko.json"
import vi from "@/messages/vi.json"
import zh from "@/messages/zh.json"
import { findNeighborhood } from "@/data/neighborhoods"
import { placeTool, planTool, searchTool } from "@/lib/assistant/tools"
import { normalizeQuery, parseQuery } from "@/lib/search"
import { expandForeign } from "@/lib/search-synonyms"
import type { Mood } from "@/lib/planner/types"
import type { Place } from "@/types/place"

/**
 * The free, no-AI assistant. It reads a question with simple keyword rules and
 * answers from NYCrave's own search, place details, day planner and tips, so it
 * costs nothing to run and can only ever mention places that are on NYCrave.
 */

type Locale = "en" | "vi" | "es" | "zh" | "ko"
const MESSAGES = { en, vi, es, zh, ko }

/** Lowercase, accent-free, with Chinese and Korean words turned into English. */
const read = (question: string) => normalizeQuery(expandForeign(question))
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
    "aeropuerto",
    "aeropuertos",
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
    "tren",
    "trenes",
    "tarifa",
  ],
  tipping: [
    "tip",
    "tips",
    "tipping",
    "tax",
    "taxes",
    "tien tip",
    "thue",
    "boa",
    "propina",
    "propinas",
    "impuesto",
  ],
  safety: [
    "safe",
    "safety",
    "dangerous",
    "emergency",
    "911",
    "an toan",
    "nguy hiem",
    "khan cap",
    "seguridad",
    "seguro",
    "emergencia",
  ],
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
    "invierno",
    "verano",
    "primavera",
    "otono",
    "navidad",
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
  "planea",
  "planear",
  "planifica",
  "itinerario",
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
  "horario",
  "abre",
  "cierra",
  "direccion",
  "como llego",
  "a que hora",
]
const GREETINGS = ["hi", "hello", "hey", "help", "xin chao", "chao", "giup", "hola", "ayuda"]
const THANKS = ["thanks", "thank you", "thx", "cam on", "gracias"]

const MOOD_WORDS: [Mood, string[]][] = [
  [
    "romantic",
    ["romantic", "date", "date night", "couple", "hen ho", "lang man", "cita", "romantico"],
  ],
  ["foodie", ["food", "foodie", "eat", "eating", "an uong", "am thuc", "comida", "comer"]],
  [
    "artsy",
    ["art", "museum", "museums", "gallery", "nghe thuat", "bao tang", "arte", "museo", "museos"],
  ],
  [
    "chill",
    ["chill", "relax", "relaxing", "slow", "thu thai", "thong tha", "tranquilo", "relajado"],
  ],
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
  "street dumbo pizza natural history modern tacos chelsea times grand terminal ferry williamsburg little fifth rooftop village bagel death restaurant bronx prospect heights public library union bushwick plaza jackson roosevelt industry company arthur avenue retail sunset works housing closet diner collective herald botanic botanical stephen statue liberty island tramway greenmarket sushi falafel grill coffee halal ethiopian bistro corner blue ribbon bells moving image guys cafe".split(
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
  const q = ` ${read(question)} `
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

const L = (locale: Locale) => MESSAGES[locale] ?? en

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
  const q = read(question)

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
      "lluvia",
      "lluvioso",
      "frio",
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

type StatusWords = {
  always: string
  closedForGood: string
  openUntil: (time: string, tomorrow: boolean) => string
  opensAt: (time: string, tomorrow: boolean) => string
  /** Use 24-hour times ("21:00") instead of "9 PM". */
  clock24: boolean
}

const STATUS: Record<Exclude<Locale, "en">, StatusWords> = {
  vi: {
    always: "mở cửa 24 giờ",
    closedForGood: "tạm đóng cửa",
    openUntil: (t, tm) => `đang mở, đến ${tm ? "ngày mai " : ""}${t}`,
    opensAt: (t, tm) => `đang đóng, mở lúc ${t}${tm ? " ngày mai" : ""}`,
    clock24: true,
  },
  es: {
    always: "abierto las 24 horas",
    closedForGood: "cerrado por tiempo indefinido",
    openUntil: (t, tm) => `abierto ahora, hasta ${tm ? "mañana a " : ""}las ${t}`,
    opensAt: (t, tm) => `cerrado ahora, abre ${tm ? "mañana " : ""}a las ${t}`,
    clock24: false,
  },
  zh: {
    always: "24 小时营业",
    closedForGood: "暂停营业",
    openUntil: (t, tm) => `正在营业，营业至${tm ? "明天" : ""} ${t}`,
    opensAt: (t, tm) => `已打烊，${tm ? "明天" : ""} ${t} 开门`,
    clock24: true,
  },
  ko: {
    always: "24시간 영업",
    closedForGood: "휴업 중",
    openUntil: (t, tm) => `영업 중, ${tm ? "내일 " : ""}${t}까지`,
    opensAt: (t, tm) => `영업 종료, ${tm ? "내일 " : ""}${t} 영업 시작`,
    clock24: true,
  },
}

/** "9 PM" to "21:00" (Intl puts a narrow no-break space before AM/PM). */
const to24 = (text: string) =>
  text.replace(
    /\b(\d{1,2})(?::(\d{2}))?[\s ](AM|PM)\b/g,
    (_, h: string, m: string | undefined, ap: string) =>
      `${(Number(h) % 12) + (ap === "PM" ? 12 : 0)}:${m ?? "00"}`,
  )

/** The tools describe status in English ("open now, until 9 PM"); say it in the visitor's language. */
function statusText(status: string, locale: Locale): string {
  if (locale === "en") return status
  const w = STATUS[locale]
  const time = (t: string) => (w.clock24 ? to24(t) : t)
  if (status === "open 24 hours") return w.always
  if (status === "closed indefinitely") return w.closedForGood
  const open = status.match(/^open now, until (tomorrow )?(.+)$/)
  if (open) return w.openUntil(time(open[2]), Boolean(open[1]))
  const closed = status.match(/^closed now, opens (tomorrow )?(.+)$/)
  if (closed) return w.opensAt(time(closed[2]), Boolean(closed[1]))
  // A bare time, as in plan stops
  return time(status)
}
