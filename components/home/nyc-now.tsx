"use client"

import { Clock, Store, Sunrise, Sunset } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useNow } from "@/hooks/use-now"
import { Link } from "@/i18n/navigation"
import { formatClockTime, nycClock } from "@/lib/hours"

/**
 * "Right now in New York": the local time (handy when planning from another
 * time zone), how many places are open, and the next sunrise or sunset.
 */
export function NycNow({
  openCount,
  sunrise,
  sunset,
}: {
  /** From /api/now (refreshed every 10 minutes); null while it loads. */
  openCount: number | null
  sunrise: number
  sunset: number
}) {
  const t = useTranslations("home.now")
  const locale = useLocale()
  const now = useNow()
  const minutes = now ? nycClock(now).minutes : null
  const beforeSunrise = minutes !== null && minutes < sunrise
  const afterSunset = minutes !== null && minutes >= sunset

  return (
    <section aria-label={t("label")} className="mx-auto max-w-7xl px-4 lg:px-8">
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border bg-card px-5 py-3 text-sm">
        <li className="flex items-center gap-2 font-semibold">
          <Clock aria-hidden className="size-4 text-line-blue dark:text-sky-300" />
          {now ? (
            <time dateTime={now.toISOString()} className="tabular-nums">
              {t("time", {
                time: new Intl.DateTimeFormat(locale, {
                  hour: "numeric",
                  minute: "2-digit",
                  weekday: "long",
                  timeZone: "America/New_York",
                }).format(now),
              })}
            </time>
          ) : (
            <span className="h-4 w-40 animate-pulse rounded bg-muted" />
          )}
        </li>
        <li>
          {openCount === null ? (
            <span className="flex items-center gap-2">
              <Store aria-hidden className="size-4 text-line-green dark:text-green-400" />
              <span className="h-4 w-36 animate-pulse rounded bg-muted" />
            </span>
          ) : (
            <Link
              href="/search?q=open+now"
              className="flex items-center gap-2 underline-offset-4 hover:underline"
            >
              <Store aria-hidden className="size-4 text-line-green dark:text-green-400" />
              {t("open", { count: openCount })}
            </Link>
          )}
        </li>
        <li className="flex items-center gap-2">
          {beforeSunrise || afterSunset ? (
            <Sunrise aria-hidden className="size-4 text-line-orange" />
          ) : (
            <Sunset aria-hidden className="size-4 text-line-orange" />
          )}
          {beforeSunrise || afterSunset
            ? t("sunrise", { time: formatClockTime(sunrise, locale) })
            : t("sunset", { time: formatClockTime(sunset, locale) })}
        </li>
      </ul>
    </section>
  )
}
