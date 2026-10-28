import { Footprints, Navigation } from "lucide-react"
import { CopyButton } from "@/components/place/copy-button"
import { ShareButton } from "@/components/place/share-button"
import { SITE_URL } from "@/lib/site"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { SignBand } from "@/components/brand/sign-band"
import { SectionHeader } from "@/components/listing/section-header"
import { CrawlDistance, NearMeButton, NearMeProvider } from "@/components/crawls/near-me"
import { RouteSketch } from "@/components/crawls/route-sketch"
import { HoursBadge } from "@/components/place/hours-badge"
import { PlacePhoto } from "@/components/place/place-photo"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { toCard } from "@/lib/card-place"
import { CRAWL_KINDS, crawlsFor } from "@/lib/crawls"
import { routeDirectionsUrl } from "@/lib/geo"
import { LINES } from "@/lib/lines"
import { getPlaces } from "@/lib/places"
import { cn } from "@/lib/utils"

type Props = PageProps<"/[locale]/crawls">

export const revalidate = 86400

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("crawls")
  return { title: t("title"), description: t("tagline"), alternates: { canonical: "/crawls" } }
}

export default async function CrawlsPage({ params }: Props) {
  await initLocale(params)
  const t = await getTranslations("crawls")
  const places = await getPlaces({}, { sort: "trending" })
  const kinds = CRAWL_KINDS.map((kind) => ({ kind, crawls: crawlsFor(kind, places) })).filter(
    (k) => k.crawls.length > 0,
  )
  const prints = kinds
    .flatMap((k) => k.crawls[0].stops[0].place.photos.slice(0, 1))
    .filter((p) => !p.illustrative)
    .slice(0, 3)

  return (
    <div>
      <SectionHeader
        line="red"
        bullet="🍕"
        title={t("title")}
        tagline={t("tagline")}
        photos={prints}
      />
      <NearMeProvider>
        <div className="mx-auto max-w-7xl space-y-14 px-4 py-10 lg:px-8 lg:py-14">
          <nav aria-label={t("jump")}>
            <ul className="flex flex-wrap gap-2">
              {kinds.map(({ kind }) => (
                <li key={kind.key}>
                  <a
                    href={`#${kind.key}`}
                    className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-foreground/15 bg-card px-4 text-sm font-semibold hover:border-foreground"
                  >
                    <span aria-hidden>{kind.emoji}</span>
                    {t(`kinds.${kind.key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex flex-wrap items-center gap-3">
            <NearMeButton />
            <ShareButton />
          </div>

          {kinds.map(({ kind, crawls }) => {
            const line = LINES[kind.line]
            return (
              <section
                key={kind.key}
                id={kind.key}
                aria-labelledby={`${kind.key}-title`}
                className="scroll-mt-24 space-y-5"
              >
                <SignBand
                  id={`${kind.key}-title`}
                  title={`${kind.emoji} ${t(`kinds.${kind.key}`)}`}
                />
                <ul className="grid gap-6 lg:grid-cols-2">
                  {crawls.map((crawl) => {
                    const cards = crawl.stops.map((s) => ({ ...s, card: toCard(s.place) }))
                    const first = crawl.stops[0].place
                    const directions = routeDirectionsUrl(
                      first,
                      crawl.stops.slice(1).map(({ place }) => ({
                        lat: place.lat,
                        lng: place.lng,
                        name: place.name,
                        address: place.address,
                      })),
                    )
                    // The crawl as plain text, stop by stop with walks and links, for a group chat
                    const text = [
                      `${kind.emoji} ${t(`kinds.${kind.key}`)}: ${t("around", { area: crawl.areas.slice(0, 2).join(" · ") })}`,
                      t("meta", { stops: crawl.stops.length, minutes: crawl.walkMinutes }),
                      "",
                      ...crawl.stops.flatMap(({ place, walk }, i) => [
                        ...(walk ? [`   ${t("leg", { minutes: walk })}`] : []),
                        `${i + 1}. ${place.name}, ${place.neighborhood}: ${SITE_URL}/place/${place.slug}`,
                      ]),
                      "",
                      `${t("directions")}: ${directions}`,
                    ].join("\n")
                    return (
                      <li
                        key={first.slug}
                        className="flex flex-col gap-5 overflow-hidden rounded-3xl border bg-card p-5"
                      >
                        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-sm font-bold">
                            <span aria-hidden className={cn("size-2.5 rounded-full", line.bg)} />
                            {t("around", { area: crawl.areas.slice(0, 2).join(" · ") })}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {t("meta", { stops: crawl.stops.length, minutes: crawl.walkMinutes })}
                          </span>
                        </p>
                        <CrawlDistance start={{ lat: first.lat, lng: first.lng }} />
                        <RouteSketch
                          stops={crawl.stops.map(({ place }) => place)}
                          color={line.hex}
                        />
                        <ol className="space-y-1">
                          {cards.map(({ card, walk }, i) => (
                            <li key={card.slug}>
                              {walk ? (
                                <p className="flex items-center gap-2 py-1 pl-6 text-xs text-muted-foreground">
                                  <Footprints aria-hidden className="size-3.5" />
                                  {t("leg", { minutes: walk })}
                                </p>
                              ) : null}
                              <div className="flex items-center gap-3">
                                <span
                                  aria-hidden
                                  className="grid size-7 shrink-0 place-items-center rounded-full bg-foreground text-sm font-bold text-background"
                                >
                                  {i + 1}
                                </span>
                                <PlacePhoto
                                  place={card}
                                  sizes="56px"
                                  showChip={false}
                                  className="size-14 shrink-0 rounded-xl"
                                />
                                <div className="min-w-0">
                                  <Link
                                    href={`/place/${card.slug}`}
                                    className="font-semibold underline-offset-4 hover:underline"
                                  >
                                    {card.name}
                                  </Link>
                                  <p className="text-sm text-muted-foreground">
                                    {card.neighborhood}
                                  </p>
                                  <HoursBadge hours={card.hours} className="text-xs" />
                                </div>
                              </div>
                            </li>
                          ))}
                        </ol>
                        <div className="mt-auto flex flex-wrap gap-2">
                          <a
                            href={directions}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full border-2 border-foreground px-5 text-sm font-bold hover:bg-accent"
                          >
                            <Navigation aria-hidden className="size-4" />
                            {t("directions")}
                          </a>
                          <CopyButton
                            value={text}
                            label={t("copyText")}
                            copiedLabel={t("copiedText")}
                            className="h-11 px-5 text-sm [&_svg]:size-4"
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}
          <p className="max-w-prose text-sm text-muted-foreground">{t("note")}</p>
        </div>
      </NearMeProvider>
    </div>
  )
}
