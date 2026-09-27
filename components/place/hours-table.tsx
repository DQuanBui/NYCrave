"use client"

import { useLocale, useTranslations } from "next-intl"
import { useNow } from "@/hooks/use-now"
import { formatRange, nycClock } from "@/lib/hours"
import { cn } from "@/lib/utils"
import { WEEKDAYS } from "@/types/enums"
import type { WeeklyHours } from "@/types/place"

/** Monday-first week, the way New York posts its hours. */
const ORDER = [1, 2, 3, 4, 5, 6, 0]

export function HoursTable({ hours }: { hours: WeeklyHours }) {
  const t = useTranslations()
  const locale = useLocale()
  const now = useNow()
  const today = now ? nycClock(now).weekday : null
  const dayName = new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "UTC" })

  return (
    <table className="w-full text-sm">
      <caption className="sr-only">{t("place.hours")}</caption>
      <tbody>
        {ORDER.map((index) => {
          const ranges = hours[WEEKDAYS[index]]
          const isToday = index === today
          return (
            <tr key={index} className={cn(isToday && "bg-taxi/25 font-semibold")}>
              <th scope="row" className="py-1.5 pr-4 pl-2 text-left font-medium">
                {dayName.format(new Date(Date.UTC(2023, 0, 1 + index)))}
                {isToday ? <span className="sr-only"> ({t("place.today")})</span> : null}
              </th>
              <td className="py-1.5 pr-2 text-right tabular-nums">
                {ranges.length
                  ? ranges.map((r) => formatRange(r, locale)).join(", ")
                  : t("hours.closed")}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
