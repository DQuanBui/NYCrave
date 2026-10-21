"use client"

import { CalendarClock, ChevronDown } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { Popover } from "radix-ui"
import { useState } from "react"
import { pillClass } from "@/components/listing/filter-menu"
import { useNow } from "@/hooks/use-now"
import { formatClockTime, nycClock } from "@/lib/hours"
import { atClock, toAt } from "@/lib/place-filters"

const STEP = 30
const TIMES = Array.from({ length: (24 * 60) / STEP }, (_, i) => i * STEP)
// 7 January 2024 was a Sunday, so day i of that week is weekday i
const dayName = (weekday: number, locale: string, width: "long" | "short") =>
  new Intl.DateTimeFormat(locale, { weekday: width, timeZone: "UTC" }).format(
    new Date(Date.UTC(2024, 0, 7 + weekday)),
  )

/** "Open at…": pick a weekday and a time to see what is open then, in New York time. */
export function OpenAtMenu({
  value,
  onChange,
}: {
  value: string | undefined
  onChange: (at: string | undefined) => void
}) {
  const t = useTranslations("filters")
  const locale = useLocale()
  const now = useNow()
  const current = value ? atClock(value) : undefined
  const [open, setOpen] = useState(false)
  const [day, setDay] = useState(0)
  const [time, setTime] = useState(0)

  const onOpenChange = (next: boolean) => {
    if (next) {
      // Start from the chosen time, or the next half hour in New York
      const clock = now ? nycClock(now) : { weekday: 6, minutes: 19 * 60 }
      const start = current ?? {
        weekday: clock.weekday,
        minutes: (Math.ceil(clock.minutes / STEP) * STEP) % (24 * 60),
      }
      setDay(start.weekday)
      setTime(start.minutes)
    }
    setOpen(next)
  }

  const selectClass =
    "h-10 w-full rounded-lg border-2 border-foreground/15 bg-background px-2 font-semibold focus-visible:border-foreground focus-visible:outline-none"

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Trigger asChild>
        <button type="button" className={pillClass(Boolean(current))}>
          <CalendarClock aria-hidden className="size-4" />
          {current
            ? t("openAtActive", {
                when: `${dayName(current.weekday, locale, "short")} ${formatClockTime(current.minutes, locale)}`,
              })
            : t("openAt")}
          <ChevronDown aria-hidden className="size-3.5 opacity-70" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-72 space-y-4 rounded-2xl border bg-popover p-4 text-popover-foreground shadow-xl outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <p className="font-bold">{t("openAtTitle")}</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1 text-sm font-semibold text-muted-foreground">
              {t("day")}
              <select
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className={selectClass}
              >
                {Array.from({ length: 7 }, (_, d) => (
                  <option key={d} value={d}>
                    {dayName(d, locale, "long")}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm font-semibold text-muted-foreground">
              {t("time")}
              <select
                value={time}
                onChange={(e) => setTime(Number(e.target.value))}
                className={selectClass}
              >
                {TIMES.map((m) => (
                  <option key={m} value={m}>
                    {formatClockTime(m, locale)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                onChange(undefined)
                setOpen(false)
              }}
              className="h-10 rounded-full px-3 text-sm font-semibold underline-offset-4 hover:underline"
            >
              {t("openAtClear")}
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(toAt(day, time))
                setOpen(false)
              }}
              className="h-10 rounded-full bg-foreground px-4 text-sm font-bold text-background"
            >
              {t("openAtApply")}
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
