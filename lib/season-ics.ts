import { escapeText, fold, localStamp, VTIMEZONE } from "@/lib/planner/ics"

const compact = (date: string) => date.replaceAll("-", "")

/** The day after a YYYY-MM-DD date (all-day events end on the next day, exclusive). */
function nextDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

const stampOf = (date: Date) => `${date.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`

/** Calendar file lines, folded and joined with CRLF as RFC 5545 asks. */
const toIcs = (lines: string[]) => lines.map(fold).join("\r\n") + "\r\n"

/**
 * One all-day calendar event for a New York date window (the marathon, the
 * cherry blossoms…), as an .ics file a phone or laptop calendar can add.
 */
export function seasonIcs(event: {
  uid: string
  name: string
  start: string
  end: string
  description: string
  url: string
  stamp: Date
}): string {
  return toIcs([
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NYCrave//Seasons//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.uid}@nycrave`,
    `DTSTAMP:${stampOf(event.stamp)}`,
    `DTSTART;VALUE=DATE:${compact(event.start)}`,
    `DTEND;VALUE=DATE:${compact(nextDay(event.end))}`,
    `SUMMARY:${escapeText(event.name)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `URL:${event.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ])
}

/**
 * One timed event on a New York date (minutes after midnight, local time),
 * such as tonight's golden hour, with the time zone embedded so every
 * calendar places it right.
 */
export function timedIcs(event: {
  uid: string
  name: string
  date: string
  start: number
  end: number
  description: string
  url: string
  stamp: Date
}): string {
  return toIcs([
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NYCrave//Light//EN",
    "CALSCALE:GREGORIAN",
    ...VTIMEZONE,
    "BEGIN:VEVENT",
    `UID:${event.uid}@nycrave`,
    `DTSTAMP:${stampOf(event.stamp)}`,
    `DTSTART;TZID=America/New_York:${localStamp(event.date, event.start)}`,
    `DTEND;TZID=America/New_York:${localStamp(event.date, event.end)}`,
    `SUMMARY:${escapeText(event.name)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `URL:${event.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ])
}

/** A link target that downloads the file without a request to the server. */
export const icsDataUrl = (ics: string) =>
  `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
