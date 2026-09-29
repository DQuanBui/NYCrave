/**
 * US holidays that change opening hours in New York, computed from their rules so
 * the list never goes stale. "major" days close many places (museums included);
 * on "minor" days most places open, some on holiday hours.
 */
export type Holiday = {
  key:
    | "newYearsDay"
    | "mlkDay"
    | "presidentsDay"
    | "memorialDay"
    | "juneteenth"
    | "independenceDay"
    | "laborDay"
    | "indigenousPeoplesDay"
    | "veteransDay"
    | "thanksgiving"
    | "christmasEve"
    | "christmas"
    | "newYearsEve"
  date: string
  major: boolean
}

const pad = (n: number) => String(n).padStart(2, "0")
export const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`

/** The nth given weekday (0 = Sunday) of a month; n = -1 for the last one. */
export function nthWeekday(year: number, month: number, weekday: number, n: number): string {
  if (n > 0) {
    const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay()
    return iso(year, month, 1 + ((weekday - first + 7) % 7) + (n - 1) * 7)
  }
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const last = new Date(Date.UTC(year, month - 1, lastDay)).getUTCDay()
  return iso(year, month, lastDay - ((last - weekday + 7) % 7))
}

export function holidaysOf(year: number): Holiday[] {
  return [
    { key: "newYearsDay", date: iso(year, 1, 1), major: true },
    { key: "mlkDay", date: nthWeekday(year, 1, 1, 3), major: false },
    { key: "presidentsDay", date: nthWeekday(year, 2, 1, 3), major: false },
    { key: "memorialDay", date: nthWeekday(year, 5, 1, -1), major: false },
    { key: "juneteenth", date: iso(year, 6, 19), major: false },
    { key: "independenceDay", date: iso(year, 7, 4), major: false },
    { key: "laborDay", date: nthWeekday(year, 9, 1, 1), major: false },
    { key: "indigenousPeoplesDay", date: nthWeekday(year, 10, 1, 2), major: false },
    { key: "veteransDay", date: iso(year, 11, 11), major: false },
    { key: "thanksgiving", date: nthWeekday(year, 11, 4, 4), major: true },
    { key: "christmasEve", date: iso(year, 12, 24), major: false },
    { key: "christmas", date: iso(year, 12, 25), major: true },
    { key: "newYearsEve", date: iso(year, 12, 31), major: false },
  ]
}

/** The holiday on a New York calendar date (YYYY-MM-DD), if any. */
export function holidayOn(date: string): Holiday | undefined {
  const year = Number(date.slice(0, 4))
  return holidaysOf(year).find((h) => h.date === date)
}
