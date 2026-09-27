import type { Plan } from "./types"

/**
 * iCalendar export. Times are New York wall-clock with a TZID and an embedded
 * VTIMEZONE (US rules since 2007), so every calendar app places stops correctly.
 */

const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  "TZID:America/New_York",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:-0500",
  "TZOFFSETTO:-0400",
  "TZNAME:EDT",
  "DTSTART:20070311T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:-0400",
  "TZOFFSETTO:-0500",
  "TZNAME:EST",
  "DTSTART:20071104T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
]

export function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n")
}

/** Lines longer than 75 octets continue on the next line after a space (RFC 5545 §3.1). */
export function fold(line: string): string {
  const bytes = new TextEncoder().encode(line)
  if (bytes.length <= 75) return line
  const out: string[] = []
  let current = ""
  let size = 0
  for (const char of line) {
    const len = new TextEncoder().encode(char).length
    if (size + len > (out.length ? 74 : 75)) {
      out.push(current)
      current = ""
      size = 0
    }
    current += char
    size += len
  }
  out.push(current)
  return out.join("\r\n ")
}

/** "2026-09-28" + 25:30 -> "20260929T013000" */
export function localStamp(date: string, minutes: number): string {
  const day = new Date(`${date}T00:00:00Z`)
  day.setUTCDate(day.getUTCDate() + Math.floor(minutes / 1440))
  const m = minutes % 1440
  const ymd = day.toISOString().slice(0, 10).replace(/-/g, "")
  return `${ymd}T${String(Math.floor(m / 60)).padStart(2, "0")}${String(m % 60).padStart(2, "0")}00`
}

function utcStamp(d: Date): string {
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")
}

export function planToIcs(
  plan: Plan,
  opts: { siteUrl: string; slotLabel: (slot: string) => string; now?: Date },
): string {
  const now = utcStamp(opts.now ?? new Date())
  const events = plan.stops.flatMap((stop) => {
    const url = `${opts.siteUrl}/place/${stop.place.slug}`
    const description = [
      stop.place.editorialTake,
      stop.place.mustTry.length ? `Must-try: ${stop.place.mustTry.join(", ")}` : "",
      url,
    ]
      .filter(Boolean)
      .join("\n")
    return [
      "BEGIN:VEVENT",
      `UID:${plan.input.date}-${stop.slot}-${stop.place.id}@nycrave`,
      `DTSTAMP:${now}`,
      `DTSTART;TZID=America/New_York:${localStamp(plan.input.date, stop.start)}`,
      `DTEND;TZID=America/New_York:${localStamp(plan.input.date, stop.end)}`,
      `SUMMARY:${escapeText(`${opts.slotLabel(stop.slot)}: ${stop.place.name}`)}`,
      `LOCATION:${escapeText(`${stop.place.name}, ${stop.place.neighborhood}`)}`,
      `GEO:${stop.place.lat};${stop.place.lng}`,
      `DESCRIPTION:${escapeText(description)}`,
      `URL:${url}`,
      "END:VEVENT",
    ]
  })

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NYCrave//Design My Day//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(`NYCrave day, ${plan.input.date}`)}`,
    ...VTIMEZONE,
    ...events,
    "END:VCALENDAR",
  ]
    .map(fold)
    .join("\r\n")
    .concat("\r\n")
}
