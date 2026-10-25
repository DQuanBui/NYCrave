import { escapeText, fold } from "@/lib/planner/ics"

const compact = (date: string) => date.replaceAll("-", "")

/** The day after a YYYY-MM-DD date (all-day events end on the next day, exclusive). */
function nextDay(date: string): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

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
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NYCrave//Seasons//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${event.uid}@nycrave`,
    `DTSTAMP:${event.stamp.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
    `DTSTART;VALUE=DATE:${compact(event.start)}`,
    `DTEND;VALUE=DATE:${compact(nextDay(event.end))}`,
    `SUMMARY:${escapeText(event.name)}`,
    `DESCRIPTION:${escapeText(event.description)}`,
    `URL:${event.url}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ]
  return lines.map(fold).join("\r\n") + "\r\n"
}

/** A link target that downloads the file without a request to the server. */
export const icsDataUrl = (ics: string) =>
  `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`
