// Compares each place's hours with the opening hours its official website
// publishes as structured data (schema.org JSON-LD), and lists the days that
// differ. Many sites publish none; those are skipped. Run with
// `npm run check:hours`; it only reads, so fix what it finds by hand after
// checking the site.
//
// Structured data often lags behind a site's visible hours or describes
// another branch. Differences checked by hand go in scripts/hours-reviewed.json
// with a fingerprint of what the site published; they stay quiet until that
// changes. `npm run check:hours -- --accept` records the current ones there.
import { readFileSync, writeFileSync } from "node:fs"

const FILES = ["restaurants", "drinks", "attractions", "shopping", "photo-spots", "parks-piers"]
const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
const NAMES = { su: 0, mo: 1, tu: 2, we: 3, th: 4, fr: 5, sa: 6 }
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"

const REVIEWED_FILE = "scripts/hours-reviewed.json"
const reviewed = JSON.parse(readFileSync(REVIEWED_FILE, "utf8"))
const accept = process.argv.includes("--accept")

const places = FILES.flatMap((f) => JSON.parse(readFileSync(`data/${f}.json`, "utf8"))).filter(
  (p) => p.website,
)

const dayIndex = (d) => NAMES[String(d).split("/").pop().slice(0, 2).toLowerCase()]
const hhmm = (t) => {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(t))
  return m ? `${m[1].padStart(2, "0")}:${m[2]}` : null
}
const asList = (v) => (Array.isArray(v) ? v : v === undefined ? [] : [v])

/** Every JSON-LD object on the page, nested ones included. */
function* ldObjects(html) {
  for (const [, body] of html.matchAll(/<script[^>]*ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    let data
    try {
      data = JSON.parse(body)
    } catch {
      continue
    }
    const stack = [data]
    while (stack.length) {
      const node = stack.pop()
      if (Array.isArray(node)) stack.push(...node)
      else if (node && typeof node === "object") {
        yield node
        stack.push(...Object.values(node).filter((v) => v && typeof v === "object"))
      }
    }
  }
}

/** One set of published hours per schema.org object: [{ dayIndex: ["11:00-20:00"] }]. */
function publishedWeeks(html) {
  const weeks = []
  for (const node of ldObjects(html)) {
    const week = {}
    const add = (day, open, close) => {
      // "00:00–23:59" placeholders and empty ranges say nothing real
      if (day === undefined || !open || !close || open === close) return
      if (open === "00:00" && (close === "23:59" || close === "00:00")) return
      ;(week[day] ??= []).push([open, close])
    }
    for (const spec of asList(node.openingHoursSpecification)) {
      const opens = asList(spec.opens)
      const closes = asList(spec.closes)
      asList(spec.dayOfWeek).forEach((d, i) =>
        add(dayIndex(d), hhmm(opens[i] ?? opens[0]), hhmm(closes[i] ?? closes[0])),
      )
    }
    for (const line of asList(node.openingHours)) {
      // "Mo-Sa 11:00-20:00" or "Su 11:00-19:00"
      const m = /^([A-Za-z]{2})(?:-([A-Za-z]{2}))?\s+(\d{1,2}:\d{2})-(\d{1,2}:\d{2})$/.exec(
        String(line).trim(),
      )
      if (!m) continue
      const from = dayIndex(m[1])
      const to = m[2] ? dayIndex(m[2]) : from
      for (let d = from; ; d = (d + 1) % 7) {
        add(d, hhmm(m[3]), hhmm(m[4]))
        if (d === to) break
      }
    }
    if (Object.keys(week).length) weeks.push(mergeOvernight(week))
  }
  return weeks
}

/**
 * Sites often split late hours at midnight ("16:00–00:00" plus "00:00–02:00"
 * the next day); NYCrave stores them as one range ("16:00–02:00"). Join them.
 */
function mergeOvernight(week) {
  const out = Object.fromEntries(Object.entries(week).map(([d, r]) => [d, r.map((x) => [...x])]))
  for (let d = 0; d < 7; d++) {
    const late = (out[d] ?? []).find(([, close]) => close === "00:00" || close === "23:59")
    const next = out[(d + 1) % 7]
    const early = next?.find(([open]) => open === "00:00")
    if (late && early) {
      late[1] = early[1]
      next.splice(next.indexOf(early), 1)
    }
  }
  return Object.fromEntries(
    Object.entries(out)
      // A day whose only range was the tail of the night before has nothing left
      .filter(([, ranges]) => ranges.length)
      .map(([d, ranges]) => [d, [...new Set(ranges.map((r) => r.join("-")))].sort()]),
  )
}

const ours = (p, day) =>
  (p.hours[DAYS[day]] ?? []).map((r) => `${r.open}-${r.close.replace("24:00", "00:00")}`).sort()

async function check(p) {
  let html
  try {
    const res = await fetch(p.website, {
      headers: { "user-agent": UA },
      signal: AbortSignal.timeout(20_000),
    })
    html = await res.text()
  } catch {
    return null
  }
  const weeks = publishedWeeks(html)
  if (!weeks.length) return null
  // A page can carry several sets of hours (branches, vendors): any one that
  // agrees on every day it lists is a match; otherwise show the closest
  const diff = (week) =>
    Object.entries(week)
      .filter(([day, ranges]) => ours(p, day).join() !== ranges.join())
      .map(
        ([day, ranges]) =>
          `${DAYS[day]} ours ${ours(p, day).join(",") || "closed"} / site ${ranges.join(",")}`,
      )
  const [closest] = weeks
    .map((week) => ({ week, differences: diff(week) }))
    .sort((a, b) => a.differences.length - b.differences.length)
  return { p, differences: closest.differences, site: JSON.stringify(closest.week) }
}

const results = []
let next = 0
await Promise.all(
  Array.from({ length: 12 }, async () => {
    while (next < places.length) {
      const r = await check(places[next++])
      if (r) results.push(r)
    }
  }),
)

const differing = results.filter((r) => r.differences.length)
const isReviewed = (r) => reviewed[r.p.slug]?.site === r.site
const fresh = differing.filter((r) => !isReviewed(r))
console.log(
  `${places.length} sites, ${results.length} publish hours, ${differing.length} differ from ours ` +
    `(${differing.length - fresh.length} reviewed earlier, ${fresh.length} new)`,
)
for (const { p, differences } of fresh.sort((a, b) => a.p.slug.localeCompare(b.p.slug))) {
  console.log(`- ${p.slug} (${p.website})`)
  for (const d of differences) console.log(`    ${d}`)
}
if (accept) {
  const today = new Date().toISOString().slice(0, 10)
  for (const r of fresh)
    reviewed[r.p.slug] = { site: r.site, note: `Checked by hand ${today}: keep NYCrave's hours.` }
  writeFileSync(REVIEWED_FILE, JSON.stringify(reviewed, null, 2) + "\n")
  console.log(`Recorded ${fresh.length} as reviewed in ${REVIEWED_FILE}`)
}
