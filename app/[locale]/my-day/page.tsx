import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { LineBullet } from "@/components/brand/line-bullet"
import { DayPresets } from "@/components/planner/day-presets"
import { PlanView } from "@/components/planner/plan-view"
import { PlannerForm } from "@/components/planner/planner-form"
import { initLocale } from "@/i18n/locale"
import { nycDateString } from "@/lib/hours"
import { getPlaces } from "@/lib/places"
import { parsePlanParams } from "@/lib/planner/params"
import { planDay } from "@/lib/planner/plan"
import { getRainForecast } from "@/lib/weather"

type Props = PageProps<"/[locale]/my-day">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("planner")
  return { title: t("title"), description: t("intro") }
}

export default async function MyDayPage({ params, searchParams }: Props) {
  await initLocale(params)
  const t = await getTranslations("planner")
  const now = new Date()
  const today = nycDateString(now)
  const { input, adjustments, submitted } = parsePlanParams(await searchParams, now)

  let result: React.ReactNode = null
  if (submitted) {
    const forecast = input.weatherAware ? await getRainForecast(input.date, today) : null
    const plan = planDay(input, await getPlaces(), {
      ...adjustments,
      rainLikely: forecast?.rainLikely,
    })
    result = (
      <PlanView
        plan={plan}
        adjustments={adjustments}
        forecast={forecast}
        aiEnabled={Boolean(process.env.ANTHROPIC_API_KEY)}
      />
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-12">
      <header className="mb-8 flex items-end gap-4">
        <LineBullet line="yellow" size="xl" className="mb-1">
          D
        </LineBullet>
        <div className="space-y-2">
          <h1 className="font-display text-display-xl">{t("title")}</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{t("intro")}</p>
        </div>
      </header>

      {submitted ? (
        <div className="space-y-10">
          <details className="group rounded-2xl border bg-card p-5">
            <summary className="cursor-pointer font-bold">{t("edit")}</summary>
            <div className="pt-6">
              <PlannerForm key={JSON.stringify(input)} initial={input} today={today} />
            </div>
          </details>
          {result}
        </div>
      ) : (
        <div className="space-y-14">
          <div className="max-w-3xl rounded-3xl border bg-card p-5 sm:p-8">
            <PlannerForm initial={input} today={today} />
          </div>
          <DayPresets places={await getPlaces()} date={today} />
        </div>
      )}
    </div>
  )
}
