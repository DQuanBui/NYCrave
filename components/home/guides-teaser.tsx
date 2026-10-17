import { ArrowRight, Sunset } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { GUIDES, guideSections } from "@/lib/guides"
import { formatClockTime } from "@/lib/hours"
import { LINES } from "@/lib/lines"
import type { SunDay } from "@/lib/sun"
import { cn } from "@/lib/utils"
import type { Place } from "@/types/place"

/** The themed guides as colored tiles, ending with tonight's golden hour. */
export async function GuidesTeaser({ places, sun }: { places: Place[]; sun: SunDay }) {
  const t = await getTranslations("guides")
  const g = await getTranslations("goldenHour")
  const locale = await getLocale()

  return (
    <section aria-labelledby="guides-home" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="guides-home" className="font-display text-display-md">
          {t("home.title")}
        </h2>
        <Link href="/guides" className="text-sm font-bold underline underline-offset-4">
          {t("home.cta")}
        </Link>
      </div>
      <ul className="-mx-4 scrollbar-none flex gap-3 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-7 lg:px-0">
        {GUIDES.map((guide) => {
          const line = LINES[guide.line]
          const count = guideSections(guide, places).reduce((n, s) => n + s.places.length, 0)
          return (
            <li key={guide.key} className="w-40 shrink-0 lg:w-auto">
              <Link
                href={`/guides/${guide.slug}`}
                className="group relative flex h-full min-h-36 flex-col justify-between gap-3 overflow-hidden rounded-2xl border bg-card p-4 pt-5 transition-transform hover:-translate-y-1"
              >
                <span aria-hidden className={cn("absolute inset-x-0 top-0 h-1.5", line.bg)} />
                <span
                  aria-hidden
                  className={cn(
                    "grid size-11 place-items-center rounded-full text-2xl transition-transform group-hover:scale-110 group-hover:-rotate-6",
                    line.bg,
                  )}
                >
                  {guide.emoji}
                </span>
                <span>
                  <span className="block font-display text-xl leading-tight">
                    {t(`list.${guide.key}.title`)}
                  </span>
                  <span className="text-sm text-muted-foreground">{t("count", { count })}</span>
                </span>
              </Link>
            </li>
          )
        })}
        <li className="w-40 shrink-0 lg:w-auto">
          <Link
            href="/golden-hour"
            className="group relative flex h-full min-h-36 flex-col justify-between gap-3 overflow-hidden rounded-2xl bg-[#0d1b3d] p-4 pt-5 text-white transition-transform hover:-translate-y-1"
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#2456b8,#e8607a,#f7b538)]"
            />
            <Sunset aria-hidden className="size-8 text-[#f7b538]" />
            <span>
              <span className="block font-display text-xl leading-tight">{g("title")}</span>
              <span className="flex items-center gap-1 text-sm font-semibold">
                {g("tonight", { time: formatClockTime(sun.goldenEvening.start, locale) })}
                <ArrowRight
                  aria-hidden
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </span>
          </Link>
        </li>
      </ul>
    </section>
  )
}
