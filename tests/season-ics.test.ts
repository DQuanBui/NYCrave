import { describe, expect, it } from "vitest"
import { icsDataUrl, seasonIcs, timedIcs } from "@/lib/season-ics"

const ics = seasonIcs({
  uid: "marathon-2026-11-01",
  name: "New York City Marathon",
  start: "2026-11-01",
  end: "2026-11-01",
  description: "50,000 runners; all five boroughs",
  url: "https://example.com/seasons#marathon",
  stamp: new Date("2026-10-25T12:00:00Z"),
})

describe("seasonIcs", () => {
  it("is an all-day event ending the next day", () => {
    expect(ics).toContain("DTSTART;VALUE=DATE:20261101\r\n")
    expect(ics).toContain("DTEND;VALUE=DATE:20261102\r\n")
    expect(ics).toContain("DTSTAMP:20261025T120000Z\r\n")
  })

  it("escapes text and uses CRLF line endings", () => {
    expect(ics).toContain(String.raw`DESCRIPTION:50\,000 runners\; all five boroughs`)
    expect(ics.split("\r\n").every((l) => new TextEncoder().encode(l).length <= 75)).toBe(true)
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true)
  })

  it("rolls a window's end over a month", () => {
    const cherry = seasonIcs({
      uid: "x",
      name: "x",
      start: "2026-04-20",
      end: "2026-04-30",
      description: "",
      url: "u",
      stamp: new Date(),
    })
    expect(cherry).toContain("DTEND;VALUE=DATE:20260501")
  })

  it("makes a downloadable link", () => {
    expect(decodeURIComponent(icsDataUrl(ics).split(",").slice(1).join(","))).toBe(ics)
  })
})

describe("timedIcs", () => {
  const ics = timedIcs({
    uid: "golden-hour-2026-10-26",
    name: "Golden hour in New York",
    date: "2026-10-26",
    start: 17 * 60 + 2,
    end: 18 * 60 + 30,
    description: "Golden hour",
    url: "https://example.com/golden-hour",
    stamp: new Date("2026-10-26T12:00:00Z"),
  })

  it("is a New York local-time event with its time zone", () => {
    expect(ics).toContain("BEGIN:VTIMEZONE\r\n")
    expect(ics).toContain("DTSTART;TZID=America/New_York:20261026T170200\r\n")
    expect(ics).toContain("DTEND;TZID=America/New_York:20261026T183000\r\n")
  })
})
