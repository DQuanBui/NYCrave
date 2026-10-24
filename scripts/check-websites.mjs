// Checks every place's official website: that it still answers, and that the
// domain has not lapsed into a parked or spam page (it happens to small
// restaurants' old domains). Run with `npm run check:websites`; it only reads.
import { readFileSync } from "node:fs"

const FILES = ["restaurants", "drinks", "attractions", "shopping", "photo-spots", "parks-piers"]
const SPAM =
  /\b(slot gacor|judi|togel|situs (?:toto|slot)|casino online|domain (?:is )?for sale|buy this domain|parked free|this domain may be for sale)\b/i
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"

const places = FILES.flatMap((f) => JSON.parse(readFileSync(`data/${f}.json`, "utf8")))
const sites = places.filter((p) => p.website)

async function check(p) {
  try {
    const res = await fetch(p.website, {
      headers: { "user-agent": UA, "accept-language": "en-US" },
      redirect: "follow",
      signal: AbortSignal.timeout(20_000),
    })
    const html = await res.text()
    const title = /<title[^>]*>([^<]*)<\/title>/i.exec(html)?.[1]?.trim() ?? ""
    if (SPAM.test(title) || SPAM.test(html.slice(0, 200_000)))
      return { p, problem: `spam or parked page ("${title.slice(0, 60)}")` }
    // Many sites block robots with 403/429; only report what looks really gone
    if (res.status === 404 || res.status === 410 || res.status >= 500)
      return { p, problem: `HTTP ${res.status}` }
    return null
  } catch (e) {
    const code = e.name === "TimeoutError" ? "timed out" : (e.cause?.code ?? e.message)
    // Big sites (nps.gov and the like) drop robots' connections: check those by hand
    return { p, problem: code, blocked: code === "ECONNRESET" }
  }
}

const problems = []
let next = 0
await Promise.all(
  Array.from({ length: 12 }, async () => {
    while (next < sites.length) {
      const found = await check(sites[next++])
      if (found) problems.push(found)
    }
  }),
)

const real = problems.filter((x) => !x.blocked)
const blocked = problems.filter((x) => x.blocked)
const bySlug = (a, b) => a.p.slug.localeCompare(b.p.slug)
console.log(`${sites.length} websites checked, ${real.length} to fix`)
for (const { p, problem } of real.sort(bySlug))
  console.log(`- ${p.slug}: ${p.website} -> ${problem}`)
if (blocked.length) {
  console.log(`${blocked.length} refused automated requests (open them in a browser):`)
  for (const { p } of blocked.sort(bySlug)) console.log(`  ${p.website}`)
}
