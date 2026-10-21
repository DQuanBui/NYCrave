import { formatClockTime } from "@/lib/hours"
import type { Slot, Stop } from "@/lib/planner/types"

/**
 * A planned day as plain text, for pasting into a group chat or notes:
 *
 *   Saturday, October 24 (Foodie)
 *
 *   9 AM  Breakfast: Russ & Daughters
 *         179 E Houston St, New York, NY 10002
 *   …
 *   About $85 per person
 *   https://nycrave.vercel.app/my-day?…
 */
export function planText({
  label,
  stops,
  costLine,
  url,
  locale,
  slotName,
}: {
  label: string
  stops: Pick<Stop, "slot" | "start" | "place">[]
  costLine: string
  url: string
  locale: string
  slotName: (slot: Slot) => string
}): string {
  const times = stops.map((s) => formatClockTime(s.start % 1440, locale))
  const width = Math.max(...times.map((t) => t.length))
  const pad = " ".repeat(width + 2)
  const lines = stops.map(
    (s, i) =>
      `${times[i].padEnd(width)}  ${slotName(s.slot)}: ${s.place.name}\n${pad}${s.place.address}`,
  )
  return [label, "", ...lines, "", costLine, url].join("\n")
}
