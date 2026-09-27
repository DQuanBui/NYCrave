import { Moon, Sunrise, Sunset } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"
import type { LatLng } from "@/lib/geo"
import { formatClockTime, nycDateString } from "@/lib/hours"
import { sunDay } from "@/lib/sun"
import { cn } from "@/lib/utils"

/** Today's sunrise, golden hours, sunset and blue hour in New York. */
export async function SunToday({
  at,
  heading: Heading = "h2",
  className,
}: {
  at?: LatLng
  heading?: "h2" | "h3"
  className?: string
}) {
  const t = await getTranslations("sun")
  const locale = await getLocale()
  const sun = sunDay(nycDateString(new Date()), at)
  const time = (m: number) => formatClockTime(m, locale)
  const range = (w: { start: number; end: number }) =>
    t("range", { start: time(w.start), end: time(w.end) })

  const rows = [
    { icon: Sunrise, label: t("sunrise"), value: time(sun.sunrise), tone: "text-line-orange" },
    {
      icon: Sunrise,
      label: t("goldenMorning"),
      value: range(sun.goldenMorning),
      tone: "text-[#b38f00] dark:text-line-yellow",
    },
    {
      icon: Sunset,
      label: t("goldenEvening"),
      value: range(sun.goldenEvening),
      tone: "text-[#b38f00] dark:text-line-yellow",
    },
    { icon: Sunset, label: t("sunset"), value: time(sun.sunset), tone: "text-line-orange" },
    {
      icon: Moon,
      label: t("blueEvening"),
      value: range(sun.blueEvening),
      tone: "text-line-blue dark:text-sky-300",
    },
  ]

  return (
    <section
      aria-labelledby="sun-today"
      className={cn("@container space-y-3 rounded-2xl border bg-card p-5", className)}
    >
      <Heading id="sun-today" className="font-bold">
        {t("title")}
      </Heading>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 @lg:grid-cols-3 @4xl:grid-cols-5">
        {rows.map(({ icon: Icon, label, value, tone }) => (
          <div key={label}>
            <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon aria-hidden className={cn("size-3.5 shrink-0", tone)} />
              {label}
            </dt>
            <dd className="font-semibold tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-muted-foreground">{t(at ? "note" : "noteCity")}</p>
    </section>
  )
}
