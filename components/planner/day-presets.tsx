import { ArrowRight } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"
import { LineBullet } from "@/components/brand/line-bullet"
import { PlacePhoto } from "@/components/place/place-photo"
import { NEIGHBORHOODS } from "@/data/neighborhoods"
import { Link } from "@/i18n/navigation"
import { formatClockTime } from "@/lib/hours"
import { planDay } from "@/lib/planner/plan"
import { DAY_PRESETS, presetInput, presetQuery } from "@/lib/planner/presets"
import type { Place } from "@/types/place"

/** One-tap days, each planned for today so the preview matches what opens. */
export async function DayPresets({ places, date }: { places: Place[]; date: string }) {
  const t = await getTranslations("planner.presets")
  const tp = await getTranslations("planner")
  const locale = await getLocale()
  const time = (m: number) => formatClockTime(m, locale)

  return (
    <section aria-labelledby="presets" className="space-y-5">
      <div className="space-y-1">
        <h2 id="presets" className="font-display text-display-md">
          {t("title")}
        </h2>
        <p className="text-muted-foreground">{t("intro")}</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DAY_PRESETS.map((preset) => {
          const plan = planDay(presetInput(preset, date), places)
          const stops = plan.stops.slice(0, 3)
          const from = NEIGHBORHOODS.find((n) => n.slug === preset.from)?.name ?? preset.from
          return (
            <li key={preset.id}>
              <Link
                href={{ pathname: "/my-day", query: presetQuery(preset, date) }}
                className="group flex h-full flex-col gap-4 rounded-2xl border bg-card p-5 transition-colors hover:border-foreground/30 focus-visible:ring-3 focus-visible:ring-ring focus-visible:outline-none"
              >
                <div className="flex items-start gap-3">
                  <LineBullet line={preset.line} size="md">
                    {t(`${preset.id}.bullet`)}
                  </LineBullet>
                  <div className="min-w-0 space-y-1">
                    <h3 className="text-lg leading-tight font-bold">{t(`${preset.id}.title`)}</h3>
                    <p className="text-sm text-muted-foreground">{t(`${preset.id}.blurb`)}</p>
                  </div>
                </div>
                {stops.length ? (
                  <div className="flex -space-x-3">
                    {stops.map((s) => (
                      <PlacePhoto
                        key={s.place.id}
                        place={s.place}
                        sizes="64px"
                        emojiSize="md"
                        showChip={false}
                        className="size-16 rounded-xl ring-4 ring-card"
                      />
                    ))}
                    {plan.stops.length > 3 ? (
                      <span className="grid size-16 place-items-center rounded-xl bg-foreground text-sm font-bold text-background ring-4 ring-card">
                        +{plan.stops.length - 3}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <p className="text-sm">
                  <span className="font-semibold">
                    {stops.map((s) => s.place.name).join(" · ")}
                    {plan.stops.length > 3 ? " …" : ""}
                  </span>
                </p>
                <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span>{tp("startPoint", { name: from })}</span>
                  <span>
                    {time(preset.start)}–{time(preset.end)}
                  </span>
                  <span>{t("budgetLabel", { budget: preset.budget })}</span>
                  <ArrowRight
                    aria-hidden
                    className="ml-auto size-4 text-foreground transition-transform group-hover:translate-x-0.5"
                  />
                </p>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
