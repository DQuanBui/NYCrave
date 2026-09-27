import { CloudRain, Footprints, Shuffle, Sun, TrainFront } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"
import { EmptyState } from "@/components/brand/empty-state"
import { LineBullet } from "@/components/brand/line-bullet"
import { LazyMap } from "@/components/map/lazy-map"
import { PlanActions } from "@/components/planner/plan-actions"
import { Reveal } from "@/components/planner/reveal"
import { PlacePhoto } from "@/components/place/place-photo"
import { RouteBullets } from "@/components/place/subway-list"
import { NEIGHBORHOODS } from "@/data/neighborhoods"
import { getPathname, Link } from "@/i18n/navigation"
import { formatClockTime } from "@/lib/hours"
import { placeToPoint } from "@/lib/map-points"
import { originOf } from "@/lib/planner/plan"
import { planQuery, swapQuery } from "@/lib/planner/params"
import type { Plan, PlanAdjustments } from "@/lib/planner/types"
import { SITE_URL } from "@/lib/site"
import { ROUTE_LINE, subwayLeg } from "@/lib/subway"
import type { RainForecast } from "@/lib/weather"

type PlanViewProps = {
  plan: Plan
  adjustments: PlanAdjustments
  forecast: RainForecast | null
  aiEnabled: boolean
}

export async function PlanView({ plan, adjustments, forecast, aiEnabled }: PlanViewProps) {
  const t = await getTranslations()
  const locale = await getLocale()
  const { input } = plan
  const time = (m: number) => formatClockTime(m, locale)
  // Plan dates are calendar dates; noon UTC keeps the weekday stable
  const weekday = new Date(`${input.date}T12:00:00Z`).getUTCDay()
  const weekend = weekday === 0 || weekday === 6
  const startName = NEIGHBORHOODS.find((n) => n.slug === input.from)?.name ?? input.from
  const dateLabel = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${input.date}T12:00:00Z`))

  // Locking every stop makes share/export links reproduce this exact day
  const lockedQuery = planQuery(input, {
    locks: Object.fromEntries(plan.stops.map((s) => [s.slot, s.place.id])),
  })
  const path = getPathname({ href: { pathname: "/my-day", query: lockedQuery }, locale })
  const icsHref = `/api/my-day/ics?${new URLSearchParams({ ...lockedQuery, locale })}`
  const label = `${dateLabel} (${t(`planner.moods.${input.mood}`)})`

  if (plan.stops.length === 0) {
    return (
      <EmptyState line="yellow" title={t("planner.emptyTitle")} body={t("planner.emptyBody")} />
    )
  }

  const origin = originOf(input.from)
  const points = [
    {
      id: "start",
      lat: origin.lat,
      lng: origin.lng,
      name: t("planner.startPoint", { name: startName }),
      line: "gray" as const,
      label: "S",
    },
    ...plan.stops.map((s, i) => placeToPoint(s.place, String(i + 1))),
  ]

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h2 className="font-display text-display-lg text-balance">{dateLabel}</h2>
        <ul className="flex flex-wrap gap-2 text-sm font-semibold">
          <li className="rounded-full bg-muted px-3 py-1">
            {t("planner.summaryStops", { count: plan.stops.length })}
          </li>
          <li className="rounded-full bg-taxi px-3 py-1 text-taxi-foreground">
            {t("planner.summaryCost", { amount: plan.totalCost })}
          </li>
          <li className="rounded-full bg-muted px-3 py-1">
            {t("planner.summaryTravel", {
              duration: t("planner.duration", {
                hours: Math.floor(plan.travelMinutes / 60),
                minutes: plan.travelMinutes % 60,
              }),
            })}
          </li>
        </ul>
        {input.weatherAware ? (
          <p className="flex items-center gap-2 text-sm">
            {forecast?.rainLikely ? (
              <CloudRain aria-hidden className="size-4 text-line-blue" />
            ) : (
              <Sun aria-hidden className="size-4 text-line-orange" />
            )}
            {forecast
              ? t(forecast.rainLikely ? "planner.rainLikely" : "planner.dry", {
                  chance: forecast.precipitationProbability,
                })
              : t("planner.noForecast")}
          </p>
        ) : null}
        <PlanActions
          path={path}
          shareUrl={`${SITE_URL}${path}`}
          icsHref={icsHref}
          label={label}
          aiEnabled={aiEnabled}
          query={planQuery(input, adjustments)}
        />
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,26rem)]">
        <ol className="relative">
          <span
            aria-hidden
            className="absolute top-3 bottom-3 left-[1.0625rem] w-1.5 rounded-full bg-taxi"
          />
          <li className="relative flex items-center gap-4 pb-6">
            <span
              aria-hidden
              className="relative grid size-9 shrink-0 place-items-center rounded-full bg-line-gray text-xs font-bold text-[#1d1f21] ring-4 ring-background"
            >
              S
            </span>
            <p className="font-semibold">
              {t("planner.startPoint", { name: startName })}, {time(input.start)}
            </p>
          </li>

          {plan.stops.map((stop, i) => {
            const TravelIcon = stop.travel.mode === "walk" ? Footprints : TrainFront
            const leg =
              stop.travel.mode === "subway"
                ? subwayLeg(i === 0 ? originOf(input.from) : plan.stops[i - 1].place, stop.place, {
                    weekend,
                  })
                : null
            const slotLabel = t(`planner.slots.${stop.slot}`)
            return (
              <Reveal
                key={`${stop.slot}-${stop.place.id}`}
                index={i}
                className="relative pb-8 last:pb-0"
              >
                <p className="mb-3 flex items-center gap-2 pl-14 text-sm text-muted-foreground">
                  <TravelIcon aria-hidden className="size-4 shrink-0" />
                  {t(stop.travel.mode === "walk" ? "planner.walk" : "planner.subway", {
                    minutes: stop.travel.minutes,
                  })}
                  {stop.fare ? `, ${t("planner.fare", { fare: stop.fare })}` : null}
                </p>
                {leg ? (
                  <p className="-mt-1.5 mb-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 pl-14 text-sm text-muted-foreground">
                    {leg.direct ? (
                      <>
                        {t("subway.take")}
                        <LineBullet
                          line={ROUTE_LINE[leg.direct] ?? "gray"}
                          size="xs"
                          label={t("subway.train", { route: leg.direct })}
                        >
                          {leg.direct}
                        </LineBullet>
                        {t("subway.fromTo", { from: leg.board.name, to: leg.alight.name })}
                      </>
                    ) : (
                      <>
                        <RouteBullets routes={leg.board.routes} size="xs" />
                        {leg.board.name} →
                        <RouteBullets routes={leg.alight.routes} size="xs" />
                        {leg.alight.name}
                      </>
                    )}
                  </p>
                ) : null}
                <div className="flex gap-4">
                  <span
                    aria-hidden
                    className="relative mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-background text-sm font-bold ring-[5px] ring-taxi ring-inset"
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1 space-y-2">
                    <h3 className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-display text-2xl">{time(stop.start)}</span>
                      <span className="text-sm font-bold text-muted-foreground">{slotLabel}</span>
                    </h3>
                    <div className="relative flex gap-3 rounded-2xl border bg-card p-3">
                      <PlacePhoto
                        place={stop.place}
                        sizes="96px"
                        className="size-20 shrink-0 rounded-xl sm:size-24"
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="leading-snug font-bold">
                          <Link href={`/place/${stop.place.slug}`} className="hover:underline">
                            {stop.place.name}
                          </Link>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {stop.place.neighborhood}, {t("planner.until", { time: time(stop.end) })}
                        </p>
                        <p className="text-sm font-semibold">
                          {stop.cost ? t("planner.cost", { amount: stop.cost }) : t("planner.free")}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={{ pathname: "/my-day", query: swapQuery(plan, stop.slot, adjustments) }}
                      scroll={false}
                      aria-label={t("planner.swapLabel", {
                        slot: slotLabel,
                        name: stop.place.name,
                      })}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <Shuffle aria-hidden className="size-4" />
                      {t("planner.swap")}
                    </Link>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </ol>

        <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <LazyMap
            points={points}
            route
            ariaLabel={t("planner.mapLabel")}
            className="h-80 lg:h-[28rem]"
          />
          {plan.unfilled.length ? (
            <p className="rounded-xl border-2 border-dashed border-foreground/30 p-4 text-sm">
              {t("planner.unfilled", {
                slots: plan.unfilled.map((s) => t(`planner.slots.${s}`)).join(", "),
              })}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">{t("planner.costNote")}</p>
        </div>
      </div>
    </div>
  )
}
