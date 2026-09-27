import type { Metadata } from "next"
import Image from "next/image"
import { getTranslations } from "next-intl/server"
import { SectionHeader } from "@/components/listing/section-header"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { HERO_SCENES } from "@/lib/home"
import { getPlaces } from "@/lib/places"
import type { Photo } from "@/types/place"

type Props = PageProps<"/[locale]/credits">

export const revalidate = 3600

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("credits")
  return { title: t("title"), description: t("tagline") }
}

function Credit({ photo, label }: { photo: Photo; label: string }) {
  const a = photo.attribution
  return (
    <li className="flex gap-3">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
        <Image src={photo.url} alt="" fill sizes="64px" className="object-cover" />
      </div>
      <div className="min-w-0 text-sm">
        <p className="font-semibold">
          {label}
          {photo.illustrative ? (
            <span className="font-normal text-muted-foreground"> (illustrative)</span>
          ) : null}
        </p>
        {a ? (
          <p className="text-muted-foreground">
            {a.url ? (
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                {a.text}
              </a>
            ) : (
              a.text
            )}
            {a.licenseUrl ? (
              <>
                {" "}
                (
                <a
                  href={a.licenseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {a.license}
                </a>
                )
              </>
            ) : null}
          </p>
        ) : null}
      </div>
    </li>
  )
}

export default async function CreditsPage({ params }: Props) {
  await initLocale(params)
  const t = await getTranslations()
  const places = (await getPlaces({}, { sort: "name" })).filter((p) =>
    p.photos.some((ph) => ph.source !== "google_places"),
  )
  const heroPhotos = HERO_SCENES.flatMap((s) =>
    s.image
      ? [
          {
            key: s.key,
            photo: {
              url: s.image.src,
              alt: s.image.alt,
              width: 1,
              height: 1,
              source: "other" as const,
              illustrative: s.image.alt.startsWith("Illustrative photo"),
              attribution: { text: s.image.credit, url: s.image.creditUrl },
            },
          },
        ]
      : [],
  )

  return (
    <div>
      <SectionHeader
        line="yellow"
        bullet="©"
        title={t("credits.title")}
        tagline={t("credits.tagline")}
      />
      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 lg:px-8">
        <div className="max-w-2xl space-y-2 leading-relaxed text-muted-foreground">
          <p>{t("credits.intro")}</p>
          <p>{t("credits.illustrativeNote")}</p>
        </div>

        {heroPhotos.length ? (
          <section aria-labelledby="credits-home" className="space-y-4">
            <h2 id="credits-home" className="font-display text-display-sm sm:text-3xl">
              {t("credits.home")}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {heroPhotos.map(({ key, photo }) => (
                <Credit key={key} photo={photo} label={t(`hero.scenes.${key}`)} />
              ))}
            </ul>
          </section>
        ) : null}

        <ul className="grid gap-8 sm:grid-cols-2">
          {places.map((place) => (
            <li key={place.id} className="space-y-3">
              <h2 className="font-bold">
                <Link href={`/place/${place.slug}`} className="hover:underline">
                  {place.name}
                </Link>{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {t("credits.count", { count: place.photos.length })}
                </span>
              </h2>
              <ul className="space-y-3">
                {place.photos.map((photo) => (
                  <Credit
                    key={photo.url}
                    photo={photo}
                    label={photo.alt.replace(/^Illustrative photo: /, "")}
                  />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
