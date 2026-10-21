import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { LineBullet } from "@/components/brand/line-bullet"
import { SectionHeader } from "@/components/listing/section-header"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { toCard } from "@/lib/card-place"
import { LINES } from "@/lib/lines"
import { getPlaces } from "@/lib/places"
import { RIDE_ROUTES, rideLine, routeSlug } from "@/lib/ride"
import { ROUTE_LINE } from "@/lib/subway"
import { cn } from "@/lib/utils"

type Props = PageProps<"/[locale]/subway">

export const revalidate = 86400

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("ride")
  return { title: t("title"), description: t("tagline"), alternates: { canonical: "/subway" } }
}

export default async function SubwayPage({ params }: Props) {
  await initLocale(params)
  const t = await getTranslations("ride")
  const places = (await getPlaces()).map(toCard)
  const rides = RIDE_ROUTES.map((route) => rideLine(route, places))

  return (
    <div>
      <SectionHeader line="blue" bullet="🚇" title={t("title")} tagline={t("tagline")} />
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rides.map((ride) => {
            const color = ROUTE_LINE[ride.route]
            return (
              <li key={ride.route}>
                <Link
                  href={`/subway/${routeSlug(ride.route)}`}
                  className="group relative flex h-full items-center gap-4 overflow-hidden rounded-2xl border bg-card p-4 transition-colors hover:border-foreground"
                >
                  <span
                    aria-hidden
                    className={cn("absolute inset-y-0 left-0 w-1.5", LINES[color].bg)}
                  />
                  <LineBullet
                    line={color}
                    size="xl"
                    className="shrink-0 transition-transform group-hover:-rotate-12"
                  >
                    {ride.route}
                  </LineBullet>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-xl">
                      {t("lineTitle", { route: ride.route })}
                    </span>
                    <span className="block text-sm text-muted-foreground">
                      {t("fromTo", {
                        from: ride.stops[0].station.name,
                        to: ride.stops.at(-1)!.station.name,
                      })}
                    </span>
                    <span className="mt-1 block text-sm font-semibold">
                      {t("count", { count: ride.placeCount })}
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="size-5 shrink-0 transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
