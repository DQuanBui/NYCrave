import { NEIGHBORHOODS } from "@/data/neighborhoods"
import { getStatusAt, isOpen, isOpenLaterToday, type NycClock } from "@/lib/hours"
import { BOROUGHS, CUISINES } from "@/types/enums"
import type {
  Borough,
  Category,
  Cuisine,
  DietaryOption,
  DishType,
  DrinkType,
  Place,
  ShopType,
  VibeTag,
} from "@/types/place"

/** What a free-text query like "cheap pho in Queens open now" asks for. */
export type SearchIntent = {
  categories: Category[]
  cuisines: Cuisine[]
  dishTypes: DishType[]
  drinkTypes: DrinkType[]
  shopTypes: ShopType[]
  vibes: VibeTag[]
  dietary: DietaryOption[]
  borough?: Borough
  neighborhood?: string
  isFree?: boolean
  openNow?: boolean
  openToday?: boolean
  /** Words not recognized as a tag; matched against names and descriptions. */
  terms: string[]
}

type Effect = (intent: SearchIntent) => void

const add =
  <K extends keyof SearchIntent>(key: K, value: SearchIntent[K] extends (infer T)[] ? T : never) =>
  (i: SearchIntent) => {
    const list = i[key] as unknown[]
    if (!list.includes(value)) list.push(value)
  }

const PHRASES: Record<string, Effect[]> = {
  // Dishes and cravings
  pho: [add("cuisines", "vietnamese"), add("dishTypes", "noodle_soup")],
  "banh mi": [add("cuisines", "vietnamese"), add("dishTypes", "sandwiches")],
  "noodle soup": [add("dishTypes", "noodle_soup")],
  noodles: [
    add("dishTypes", "noodle_soup"),
    add("dishTypes", "dry_noodles"),
    add("dishTypes", "ramen"),
  ],
  ramen: [add("dishTypes", "ramen")],
  dumplings: [add("dishTypes", "dumplings")],
  dumpling: [add("dishTypes", "dumplings")],
  "soup dumplings": [add("dishTypes", "dumplings")],
  "hot pot": [add("dishTypes", "hot_pot")],
  bbq: [add("dishTypes", "bbq")],
  barbecue: [add("dishTypes", "bbq")],
  sushi: [add("dishTypes", "sushi")],
  curry: [add("dishTypes", "curry")],
  sandwich: [add("dishTypes", "sandwiches")],
  sandwiches: [add("dishTypes", "sandwiches")],
  pizza: [add("dishTypes", "pizza")],
  bagel: [add("dishTypes", "bagels")],
  bagels: [add("dishTypes", "bagels")],
  taco: [add("dishTypes", "tacos")],
  tacos: [add("dishTypes", "tacos")],
  brunch: [add("dishTypes", "brunch")],
  bakery: [add("dishTypes", "bakery")],
  pastries: [add("dishTypes", "bakery")],
  dessert: [add("dishTypes", "desserts")],
  desserts: [add("dishTypes", "desserts")],
  "street food": [add("dishTypes", "street_food")],
  seafood: [add("dishTypes", "seafood")],
  burger: [add("dishTypes", "burgers")],
  burgers: [add("dishTypes", "burgers")],
  "fried chicken": [add("dishTypes", "fried_chicken")],
  rice: [add("dishTypes", "rice_dishes")],
  // Drinks
  coffee: [add("drinkTypes", "coffee")],
  cafe: [add("drinkTypes", "coffee")],
  boba: [add("drinkTypes", "bubble_tea")],
  "bubble tea": [add("drinkTypes", "bubble_tea")],
  "milk tea": [add("drinkTypes", "bubble_tea")],
  tea: [add("drinkTypes", "tea")],
  matcha: [add("drinkTypes", "matcha")],
  cocktail: [add("drinkTypes", "cocktails")],
  cocktails: [add("drinkTypes", "cocktails")],
  bar: [add("drinkTypes", "cocktails"), add("drinkTypes", "wine_bar")],
  bars: [add("drinkTypes", "cocktails"), add("drinkTypes", "wine_bar")],
  drinks: [add("categories", "drink")],
  rooftop: [add("drinkTypes", "rooftop_bar")],
  rooftops: [add("drinkTypes", "rooftop_bar")],
  wine: [add("drinkTypes", "wine_bar")],
  juice: [add("drinkTypes", "juice")],
  // Categories
  food: [add("categories", "restaurant")],
  eat: [add("categories", "restaurant")],
  restaurant: [add("categories", "restaurant")],
  restaurants: [add("categories", "restaurant")],
  "things to do": [
    add("categories", "attraction"),
    add("categories", "park_pier"),
    add("categories", "photo_spot"),
  ],
  attractions: [add("categories", "attraction")],
  museum: [add("categories", "attraction"), add("terms", "museum")],
  museums: [add("categories", "attraction"), add("terms", "museum")],
  shopping: [add("categories", "shopping")],
  shop: [add("categories", "shopping")],
  vintage: [add("shopTypes", "vintage")],
  thrift: [add("shopTypes", "thrift")],
  market: [add("shopTypes", "market")],
  markets: [add("shopTypes", "market")],
  park: [add("categories", "park_pier")],
  parks: [add("categories", "park_pier")],
  pier: [add("categories", "park_pier")],
  piers: [add("categories", "park_pier")],
  "photo spot": [add("categories", "photo_spot")],
  "photo spots": [add("categories", "photo_spot")],
  photos: [add("categories", "photo_spot")],
  views: [add("categories", "photo_spot")],
  // Vibes
  "date night": [add("vibes", "date_night")],
  date: [add("vibes", "date_night")],
  romantic: [add("vibes", "date_night")],
  cheap: [add("vibes", "cheap_eats")],
  "cheap eats": [add("vibes", "cheap_eats")],
  "late night": [add("vibes", "late_night")],
  "rainy day": [add("vibes", "rainy_day")],
  rainy: [add("vibes", "rainy_day")],
  indoor: [add("vibes", "rainy_day")],
  "kid friendly": [add("vibes", "kid_friendly")],
  kids: [add("vibes", "kid_friendly")],
  family: [add("vibes", "kid_friendly")],
  instagrammable: [add("vibes", "instagrammable")],
  instagram: [add("vibes", "instagrammable")],
  "local favorite": [add("vibes", "local_favorite")],
  "local favorites": [add("vibes", "local_favorite")],
  locals: [add("vibes", "local_favorite")],
  touristy: [add("vibes", "tourist_classic")],
  classic: [add("vibes", "tourist_classic")],
  outdoor: [add("vibes", "outdoor")],
  outdoors: [add("vibes", "outdoor")],
  quiet: [add("vibes", "quiet")],
  // Dietary
  vegetarian: [add("dietary", "vegetarian")],
  vegan: [add("dietary", "vegan")],
  kosher: [add("dietary", "kosher")],
  "gluten free": [add("dietary", "gluten_free")],
  // Price and time
  free: [(i) => (i.isFree = true)],
  "open now": [(i) => (i.openNow = true)],
  "open late": [add("vibes", "late_night")],
  today: [(i) => (i.openToday = true)],
  tonight: [(i) => (i.openToday = true)],
  // Neighborhood nicknames
  lic: [(i) => (i.neighborhood = "Long Island City")],
  fidi: [(i) => (i.neighborhood = "Financial District")],
  les: [(i) => (i.neighborhood = "Lower East Side")],
  uws: [(i) => (i.neighborhood = "Upper West Side")],
  ues: [(i) => (i.neighborhood = "Upper East Side")],
  ktown: [(i) => (i.neighborhood = "Koreatown")],
  "k town": [(i) => (i.neighborhood = "Koreatown")],
  "the bronx": [(i) => (i.borough = "bronx")],
}

/**
 * Vietnamese, written the way normalizeQuery leaves it (no tone marks, đ as d),
 * pointing at the same effects as the English phrases.
 */
const VIETNAMESE: Record<string, string> = {
  "ha cao": "dumplings",
  "sui cao": "dumplings",
  "xiao long bao": "soup dumplings",
  "mi nuoc": "noodle soup",
  bun: "noodles",
  mi: "noodles",
  lau: "hot pot",
  "thit nuong": "bbq",
  com: "rice",
  "ca ri": "curry",
  "banh mi kep": "sandwiches",
  "banh bagel": "bagels",
  "tiem banh": "bakery",
  "banh ngot": "pastries",
  "trang mieng": "desserts",
  "do ngot": "desserts",
  "mon duong pho": "street food",
  "an vat": "street food",
  "hai san": "seafood",
  "ga ran": "fried chicken",
  "ca phe": "coffee",
  "tra sua": "bubble tea",
  tra: "tea",
  "ruou vang": "wine",
  "san thuong": "rooftop",
  "bar san thuong": "rooftop",
  "nuoc ep": "juice",
  "do uong": "drinks",
  an: "food",
  "an uong": "food",
  "nha hang": "restaurants",
  "bao tang": "museums",
  "tham quan": "things to do",
  "diem tham quan": "attractions",
  "mua sam": "shopping",
  "do si": "thrift",
  "nha sach": "bookstore",
  "cong vien": "parks",
  "ben tau": "piers",
  "chup anh": "photo spots",
  "goc chup anh": "photo spots",
  "canh dep": "views",
  "hen ho": "date night",
  "lang man": "romantic",
  "an re": "cheap eats",
  "gia re": "cheap",
  khuya: "late night",
  "mo khuya": "late night",
  "ngay mua": "rainy day",
  "trong nha": "indoor",
  "tre em": "kids",
  "gia dinh": "family",
  "song ao": "instagrammable",
  "nguoi dia phuong": "local favorite",
  "ngoai troi": "outdoor",
  "yen tinh": "quiet",
  "an chay": "vegetarian",
  chay: "vegetarian",
  "thuan chay": "vegan",
  "khong gluten": "gluten free",
  "mien phi": "free",
  "dang mo cua": "open now",
  "dang mo": "open now",
  "hom nay": "today",
  "toi nay": "tonight",
  "viet nam": "vietnamese",
  "mon viet": "vietnamese",
  "han quoc": "korean",
  "nhat ban": "japanese",
  "mon nhat": "japanese",
  "trung quoc": "chinese",
  "trung hoa": "chinese",
  "an do": "indian",
  phap: "french",
  "hy lap": "greek",
}
// "bookstore" has no English phrase of its own yet
PHRASES.bookstore = [add("shopTypes", "bookstore")]
PHRASES.bookstores = [add("shopTypes", "bookstore")]

for (const cuisine of CUISINES) {
  const phrase = cuisine.replace(/_/g, " ")
  PHRASES[phrase] = [...(PHRASES[phrase] ?? []), add("cuisines", cuisine)]
}
// "halal" is both a cuisine and a dietary need
PHRASES.halal.push(add("dietary", "halal"))

for (const borough of BOROUGHS) {
  PHRASES[borough.replace(/_/g, " ")] = [(i) => (i.borough = borough)]
}
for (const n of NEIGHBORHOODS) {
  PHRASES[n.name.toLowerCase().replace(/[^a-z0-9 ]/g, "")] = [
    (i) => {
      i.neighborhood = n.name
    },
  ]
}

for (const [vi, en] of Object.entries(VIETNAMESE)) {
  PHRASES[vi] = [...(PHRASES[vi] ?? []), ...PHRASES[en]]
}

/** Longest phrases first so "bubble tea" wins over "tea". */
const PHRASE_LIST = Object.keys(PHRASES).sort((a, b) => b.split(" ").length - a.split(" ").length)

const STOPWORDS = new Set(
  // English, then Vietnamese (ở, gần, và, các, quán, tìm, muốn, đâu, nào, ngon, món)
  "a an and any around best by do for from fun good great i in into is me my near nearby of on or place places some spot spots the things to want what whats where with o gan va cac quan tim muon dau nao ngon mon".split(
    " ",
  ),
)

export function normalizeQuery(q: string): string {
  return q
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[-_/]/g, " ")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

export function parseQuery(q: string): SearchIntent {
  const intent: SearchIntent = {
    categories: [],
    cuisines: [],
    dishTypes: [],
    drinkTypes: [],
    shopTypes: [],
    vibes: [],
    dietary: [],
    terms: [],
  }
  let rest = ` ${normalizeQuery(q)} `
  for (const phrase of PHRASE_LIST) {
    const needle = ` ${phrase} `
    if (!rest.includes(needle)) continue
    for (const effect of PHRASES[phrase]) effect(intent)
    rest = rest.split(needle).join(" ")
  }
  // Phrases may add their own terms (e.g. "museums"); leftover words join them
  intent.terms.push(...rest.split(" ").filter((w) => w.length > 1 && !STOPWORDS.has(w)))
  return intent
}

export function hasIntent(i: SearchIntent): boolean {
  return (
    i.categories.length +
      i.cuisines.length +
      i.dishTypes.length +
      i.drinkTypes.length +
      i.shopTypes.length +
      i.vibes.length +
      i.dietary.length +
      i.terms.length >
      0 ||
    i.borough !== undefined ||
    i.neighborhood !== undefined ||
    i.isFree !== undefined ||
    i.openNow === true ||
    i.openToday === true
  )
}

const overlap = <T>(wanted: T[], have: T[] | undefined) =>
  wanted.filter((w) => have?.includes(w)).length

function haystack(p: Place): string {
  return normalizeQuery(
    [p.name, p.neighborhood, p.editorialTake, ...p.mustTry, p.bestTimeToVisit ?? ""].join(" "),
  )
}

/**
 * Hard constraints (where, free, open, category, dietary) filter; soft ones
 * (cuisine, dish, drink, vibe, free text) rank. A place must hit at least one
 * soft signal when any were asked for.
 */
export function scorePlace(p: Place, i: SearchIntent, clock?: NycClock): number | null {
  if (i.borough && p.borough !== i.borough) return null
  if (i.neighborhood && p.neighborhood !== i.neighborhood) return null
  if (i.isFree && !p.isFree) return null
  if (i.dietary.some((d) => !p.dietary?.includes(d))) return null
  if (clock && i.openNow && !isOpen(getStatusAt(p.hours, clock))) return null
  if (clock && i.openToday && !isOpenLaterToday(p.hours, clock)) return null

  const typed = i.cuisines.length + i.dishTypes.length + i.drinkTypes.length + i.shopTypes.length
  if (i.categories.length && !i.categories.includes(p.category)) {
    // "cheap food" + a drink shop: category mismatch is fatal unless a typed tag matched
    if (typed === 0) return null
  }

  const text = haystack(p)
  const termHits = i.terms.filter((t) => text.includes(t)).length
  let score =
    3 * overlap(i.cuisines, p.cuisines) +
    3 * overlap(i.dishTypes, p.dishTypes) +
    3 * overlap(i.drinkTypes, p.drinkTypes) +
    2 * overlap(i.shopTypes, p.shopTypes) +
    2 * overlap(i.vibes, p.vibeTags) +
    termHits

  const softAsked = typed + i.vibes.length + i.terms.length
  if (softAsked > 0 && score === 0) return null
  if (i.categories.includes(p.category)) score += 1
  return score
}

export function searchPlaces(places: Place[], query: string, clock?: NycClock): Place[] {
  const intent = parseQuery(query)
  if (!hasIntent(intent)) return []
  return places
    .map((place) => ({ place, score: scorePlace(place, intent, clock) }))
    .filter((r): r is { place: Place; score: number } => r.score !== null)
    .sort(
      (a, b) => b.score - a.score || (b.place.trendingScore ?? 0) - (a.place.trendingScore ?? 0),
    )
    .map((r) => r.place)
}
