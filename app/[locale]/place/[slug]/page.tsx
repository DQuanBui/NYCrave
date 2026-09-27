import { ArrowLeft, Clock, ExternalLink, MapPin, Ticket, TrainFront } from "lucide-react"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { LineBullet } from "@/components/brand/line-bullet"
import { CopyButton } from "@/components/place/copy-button"
import { HoursBadge } from "@/components/place/hours-badge"
import { HoursTable } from "@/components/place/hours-table"
import { GoogleReviews } from "@/components/place/google-reviews"
import { PhotoGallery } from "@/components/place/photo-gallery"
import { PlaceRail } from "@/components/place/place-rail"
import { PlanAroundButton } from "@/components/place/plan-around-button"
import { PriceLevel } from "@/components/place/price-level"
import { SaveButton } from "@/components/place/save-button"
import { ShareButton } from "@/components/place/share-button"
import { UnverifiedTag } from "@/components/place/unverified-tag"
import { neighborhoodByName } from "@/data/neighborhoods"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { formatPriceRange } from "@/lib/format"
import { appleMapsUrl, distanceKm, googleMapsUrl, transitDirectionsUrl } from "@/lib/geo"
import { getGooglePlaceDetails } from "@/lib/google-places"
import { LINES } from "@/lib/lines"
import { placeTagKeys } from "@/lib/place-display"
import { getPlaceBySlug, getPlaces } from "@/lib/places"
import { placeJsonLd } from "@/lib/structured-data"
import { CATEGORY_META } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"
import type { Place } from "@/types/place"

type Props = PageProps<"/[locale]/place/[slug]">

// New places from the database render on first request; Google data refreshes hourly
export const revalidate = 3600

export async function generateStaticParams() {
  return (await getPlaces()).map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const place = await getPlaceBySlug((await params).slug)
  if (!place) return {}
  return {
    title: place.name,
    description: place.editorialTake,
    alternates: { canonical: `/place/${place.slug}` },
    // Placeholder entries stay out of search indexes until verified
    robots: place.verified ? undefined : { index: false, follow: true },
    openGraph: { title: place.name, description: place.editorialTake },
  }
}

export default async function PlacePage({ params }: Props) {
  await initLocale(params)
  const place = await getPlaceBySlug((await params).slug)
  if (!place) notFound()

  const t = await getTranslations()
  const meta = CATEGORY_META[place.category]
  const line = LINES[meta.line]
  const jsonLd = placeJsonLd(place)
  const neighborhood = neighborhoodByName(place.neighborhood)
  const coordinates = `${place.lat.toFixed(5)}, ${place.lng.toFixed(5)}`
  const tags = [
    ...placeTagKeys(place, 12),
    ...(place.dietary ?? []).map((d) => `dietary.${d}` as const),
  ]

  const google = place.googlePlaceId
    ? await getGooglePlaceDetails(place.googlePlaceId, place.name)
    : null
  const photos = [...place.photos, ...(google?.photos ?? [])]

  const similar = (await getPlaces({ category: place.category }))
    .filter((p) => p.id !== place.id)
    .sort((a, b) => distanceKm(place, a) - distanceKm(place, b))
    .slice(0, 6)

  return (
    <article>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      ) : null}

      <div className="relative">
        <PhotoGallery
          place={place}
          photos={photos}
          className="aspect-[16/10] w-full sm:aspect-[21/9] lg:max-h-[28rem]"
        />
        <Link
          href={meta.href}
          className="absolute top-4 left-4 inline-flex h-10 items-center gap-2 rounded-full bg-white/90 px-4 text-sm font-semibold text-[#1d1f21] shadow-sm backdrop-blur hover:bg-white"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {t(`categories.${place.category}.nav`)}
        </Link>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 lg:grid-cols-[1fr_22rem] lg:gap-14 lg:px-8 lg:py-12">
        <div className="min-w-0 space-y-10">
          <header className="space-y-4">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <LineBullet line={meta.line} size="sm">
                {meta.bullet}
              </LineBullet>
              {t(`categories.${place.category}.label`)}
              {!place.verified ? <UnverifiedTag className="ml-1" /> : null}
            </p>
            <h1 className="font-display text-display-lg text-balance">{place.name}</h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="text-muted-foreground">
                {neighborhood ? (
                  <Link
                    href={`/neighborhoods/${neighborhood.slug}`}
                    className="underline decoration-foreground/30 underline-offset-4 hover:decoration-foreground"
                  >
                    {place.neighborhood}
                  </Link>
                ) : (
                  place.neighborhood
                )}
                , {t(`borough.${place.borough}`)}
              </span>
              <PriceLevel place={place} />
              <HoursBadge hours={place.hours} />
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <SaveButton slug={place.slug} name={place.name} variant="outline" />
              <ShareButton title={place.name} />
              <PlanAroundButton place={place} />
            </div>
          </header>

          {!place.verified && place.verificationNotes ? (
            <p className="rounded-lg border border-dashed border-muted-foreground/50 p-4 text-sm text-muted-foreground">
              {t("place.unverifiedHint")} {place.verificationNotes}
            </p>
          ) : null}

          {place.editorialTake ? (
            <section aria-labelledby="take" className="space-y-3">
              <h2 id="take" className="text-sm font-bold text-muted-foreground">
                {t("place.editorialTake")}
              </h2>
              <p
                className={cn(
                  "border-l-8 pl-5 text-xl leading-relaxed font-medium text-pretty",
                  line.border,
                )}
              >
                {place.editorialTake}
              </p>
            </section>
          ) : null}

          {place.mustTry.length > 0 ? (
            <Section title={t("place.mustTry")}>
              <ul className="grid gap-2 sm:grid-cols-2">
                {place.mustTry.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 font-semibold"
                  >
                    <span aria-hidden className={cn("size-2.5 shrink-0 rounded-full", line.bg)} />
                    {item}
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Facts place={place} />

          {place.photoSpot ? (
            <Section title={t("place.photoTips")}>
              <p className="mb-3 flex flex-wrap gap-1.5">
                <span className="sr-only">{t("place.bestLight")}:</span>
                {place.photoSpot.bestLight.map((l) => (
                  <span
                    key={l}
                    className="rounded-full bg-line-yellow px-3 py-1 text-sm font-bold text-[#1d1f21]"
                  >
                    {t(`light.${l}`)}
                  </span>
                ))}
              </p>
              <ul className="list-disc space-y-1.5 pl-5">
                {place.photoSpot.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-3 rounded-xl border bg-card p-4">
                <span className="text-sm font-semibold text-muted-foreground">
                  {t("place.coordinates")}
                </span>
                <code className="font-semibold tabular-nums">{coordinates}</code>
                <CopyButton
                  value={coordinates}
                  label={t("place.copyCoordinates")}
                  copiedLabel={t("place.copied")}
                  className="ml-auto"
                />
              </div>
            </Section>
          ) : null}

          {place.park ? (
            <div className="grid gap-8 sm:grid-cols-2">
              <Section title={t("place.activities")}>
                <ul className="list-disc space-y-1.5 pl-5">
                  {place.park.activities.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </Section>
              <Section title={t("place.amenities")}>
                <ul className="list-disc space-y-1.5 pl-5">
                  {place.park.amenities.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </Section>
              {place.park.seasonalNotes ? (
                <Section title={t("place.seasonalNotes")}>
                  <p>{place.park.seasonalNotes}</p>
                </Section>
              ) : null}
            </div>
          ) : null}

          {google ? <GoogleReviews details={google} /> : null}

          {tags.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5">
              {tags.map((key) => (
                <li key={key} className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">
                  {t(key)}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-3 rounded-2xl border bg-card p-5">
            <h2 className="flex items-center gap-2 font-bold">
              <Clock aria-hidden className="size-4" />
              {t("place.hours")}
            </h2>
            <HoursTable hours={place.hours} />
          </div>
          <div className="space-y-4 rounded-2xl border bg-card p-5">
            <h2 className="flex items-center gap-2 font-bold">
              <MapPin aria-hidden className="size-4" />
              {t("place.location")}
            </h2>
            <address className="text-sm text-muted-foreground not-italic">{place.address}</address>
            <ul className="space-y-2 text-sm font-semibold">
              <MapLink href={googleMapsUrl(place)} label={t("place.openInGoogleMaps")} />
              <MapLink href={appleMapsUrl(place)} label={t("place.openInAppleMaps")} />
              <MapLink
                href={transitDirectionsUrl(place)}
                label={t("place.transitDirections")}
                icon={<TrainFront aria-hidden className="size-4" />}
              />
            </ul>
          </div>
        </aside>
      </div>

      {similar.length > 0 ? (
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <PlaceRail title={t("place.similar")} places={similar} />
        </div>
      ) : null}
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-display-sm sm:text-3xl">{title}</h2>
      {children}
    </section>
  )
}

type Fact = { label: string; value: string; note?: string; href?: string; icon?: React.ReactNode }

/** Key numbers for visiting: tickets, best time, time needed. */
async function Facts({ place }: { place: Place }) {
  const t = await getTranslations("place")
  const facts: Fact[] = []
  if (place.ticketInfo) {
    facts.push({
      label: t("tickets"),
      value: formatPriceRange(place.ticketInfo.priceRange),
      note: place.ticketInfo.notes,
      href: place.ticketInfo.bookingUrl,
      icon: <Ticket aria-hidden className="size-4" />,
    })
  }
  if (place.bestTimeToVisit) facts.push({ label: t("bestTime"), value: place.bestTimeToVisit })
  if (place.timeNeededMinutes) {
    facts.push({
      label: t("timeNeededLabel"),
      value: t("timeNeeded", { minutes: place.timeNeededMinutes }),
    })
  }
  if (!facts.length) return null

  return (
    <dl className="grid gap-3 sm:grid-cols-3">
      {facts.map((f) => (
        <div key={f.label} className="rounded-xl border bg-card p-4">
          <dt className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
            {f.icon}
            {f.label}
          </dt>
          <dd className="mt-1 text-lg font-bold">{f.value}</dd>
          {f.note ? <dd className="mt-1 text-xs text-muted-foreground">{f.note}</dd> : null}
          {f.href ? (
            <dd className="mt-2">
              <a
                href={f.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold underline underline-offset-4"
              >
                {t("bookTickets")}
              </a>
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  )
}

function MapLink({ href, label, icon }: { href: string; label: string; icon?: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="-mx-2 flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent"
      >
        {icon ?? <ExternalLink aria-hidden className="size-4" />}
        {label}
      </a>
    </li>
  )
}
