"use client"

import { useLocale, useTranslations } from "next-intl"
import { useNow } from "@/hooks/use-now"
import {
  formatClockTime,
  getOpenStatus,
  nycClock,
  type OpenStatus,
  type RelativeTime,
} from "@/lib/hours"
import { cn } from "@/lib/utils"
import type { WeeklyHours } from "@/types/place"

const TONE: Record<OpenStatus["state"], string> = {
  open: "bg-line-green",
  open_24h: "bg-line-green",
  closing_soon: "bg-line-orange",
  opening_soon: "bg-line-yellow",
  closed: "bg-line-red",
  closed_indefinitely: "bg-line-gray",
}

function weekdayName(index: number, locale: string) {
  // 2023-01-01 was a Sunday
  return new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(
    new Date(Date.UTC(2023, 0, 1 + index)),
  )
}

/** Live open/closed status in New York time. Renders a neutral placeholder until hydrated. */
export function HoursBadge({ hours, className }: { hours: WeeklyHours; className?: string }) {
  const t = useTranslations("hours")
  const locale = useLocale()
  const now = useNow()

  if (!now) {
    return (
      <span
        className={cn("inline-flex items-center gap-1.5 text-sm text-muted-foreground", className)}
      >
        <span aria-hidden className="size-2 animate-pulse rounded-full bg-muted-foreground/40" />
        {t("checking")}
      </span>
    )
  }

  const status = getOpenStatus(hours, now)
  const today = nycClock(now).weekday
  const time = (at: RelativeTime) => formatClockTime(at.minutes, locale)

  let label: string
  let detail: string | null = null
  switch (status.state) {
    case "open_24h":
      label = t("open24h")
      break
    case "open":
      label = t("open")
      detail = t("until", { time: time(status.closesAt) })
      break
    case "closing_soon":
      label = t("closingSoon")
      detail = t("at", { time: time(status.closesAt) })
      break
    case "closed_indefinitely":
      label = t("unavailable")
      break
    case "closed":
    case "opening_soon": {
      label = status.state === "closed" ? t("closed") : t("openingSoon")
      const { dayOffset } = status.opensAt
      detail =
        status.state === "opening_soon" && dayOffset === 0
          ? t("at", { time: time(status.opensAt) })
          : dayOffset === 0
            ? t("opensAt", { time: time(status.opensAt) })
            : dayOffset === 1
              ? t("opensTomorrow", { time: time(status.opensAt) })
              : t("opensOn", {
                  day: weekdayName((today + dayOffset) % 7, locale),
                  time: time(status.opensAt),
                })
    }
  }

  return (
    <span className={cn("min-w-0 text-sm", className)}>
      <span
        aria-hidden
        className={cn("mr-1.5 inline-block size-2 rounded-full align-[0.1em]", TONE[status.state])}
      />
      <span className="font-semibold">{label}</span>
      {detail ? <span className="text-muted-foreground"> {detail}</span> : null}
    </span>
  )
}
