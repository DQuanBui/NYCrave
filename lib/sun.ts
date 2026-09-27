import SunCalc from "suncalc"
import type { LatLng } from "@/lib/geo"
import { nycClock } from "@/lib/hours"

// Blue hour: the sun between 4 and 8 degrees below the horizon
SunCalc.addTime(-4, "blueHourMorningEnd", "blueHourEveningStart")
SunCalc.addTime(-8, "blueHourMorningStart", "blueHourEveningEnd")

type Window = { start: number; end: number }

/** A day's light in New York, as minutes after local midnight. */
export type SunDay = {
  sunrise: number
  sunset: number
  goldenMorning: Window
  goldenEvening: Window
  blueMorning: Window
  blueEvening: Window
}

const CITY_HALL: LatLng = { lat: 40.7128, lng: -74.006 }

/**
 * Sun times for a New York calendar date (YYYY-MM-DD), computed astronomically
 * for the given spot. Golden hour is taken as the sun below 6 degrees.
 */
export function sunDay(date: string, at: LatLng = CITY_HALL): SunDay {
  // 16:00 UTC is late morning in New York in both EST and EDT
  const times = SunCalc.getTimes(
    new Date(`${date}T16:00:00Z`),
    at.lat,
    at.lng,
  ) as SunCalc.GetTimesResult & Record<string, Date>
  const m = (d: Date) => nycClock(d).minutes
  return {
    sunrise: m(times.sunrise),
    sunset: m(times.sunset),
    goldenMorning: { start: m(times.sunrise), end: m(times.goldenHourEnd) },
    goldenEvening: { start: m(times.goldenHour), end: m(times.sunset) },
    blueMorning: { start: m(times.blueHourMorningStart), end: m(times.blueHourMorningEnd) },
    blueEvening: { start: m(times.blueHourEveningStart), end: m(times.blueHourEveningEnd) },
  }
}
