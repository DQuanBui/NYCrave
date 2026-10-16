import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import { getTranslations } from "next-intl/server"
import { SectionHeader } from "@/components/listing/section-header"
import { initLocale } from "@/i18n/locale"
import { Link } from "@/i18n/navigation"
import { GUIDES, guideSections } from "@/lib/guides"
import { LINES } from "@/lib/lines"
import { getPlaces } from "@/lib/places"
import { cn } from "@/lib/utils"

type Props = PageProps<"/[locale]/guides">

export const revalidate = 300

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  await initLocale(params)
  const t = await getTranslations("guides")
  return { title: t("title"), description: t("tagline"), alternates: { canonical: "/guides" } }
}

export default async function GuidesPage({ params }: Props) {
  await initLocale(params)
  const t = await getTranslations("guides")
  const all = await getPlaces({}, { sort: "trending" })

  return (
    <div>
      <SectionHeader line="purple" bullet="G" title={t("title")} tagline={t("tagline")} />
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 lg:py-14">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GUIDES.map((guide, i) => {
            const places = guideSections(guide, all).flatMap((s) => s.places)
            const fan = places
              .flatMap((p) => p.photos.slice(0, 1))
              .filter((p) => !p.illustrative)
              .slice(0, 3)
            const line = LINES[guide.line]
            return (
              <li
                key={guide.key}
                className="fill-mode-both motion-safe:animate-in motion-safe:duration-500 motion-safe:slide-in-from-bottom-6"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <Link
                  href={`/guides/${guide.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border bg-card transition-shadow hover:shadow-lg"
                >
                  <div className={cn("relative h-40 overflow-hidden", line.bg)}>
                    {fan.map((photo, n) => (
                      <div
                        key={photo.url}
                        className={cn(
                          "absolute top-6 h-28 w-36 overflow-hidden rounded-lg border-4 border-white shadow-md transition-transform duration-500",
                          n === 0 && "left-5 -rotate-6 group-hover:-rotate-9",
                          n === 1 &&
                            "left-1/2 z-10 -translate-x-1/2 rotate-2 group-hover:-translate-y-1",
                          n === 2 && "right-5 rotate-6 group-hover:rotate-9",
                        )}
                      >
                        <Image src={photo.url} alt="" fill sizes="144px" className="object-cover" />
                      </div>
                    ))}
                    <span
                      aria-hidden
                      className="absolute bottom-2 left-3 z-20 text-4xl drop-shadow-md"
                    >
                      {guide.emoji}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <h2 className="font-display text-2xl">{t(`list.${guide.key}.title`)}</h2>
                    <p className="leading-relaxed text-muted-foreground">
                      {t(`list.${guide.key}.tagline`)}
                    </p>
                    <p className="mt-auto flex items-center justify-between pt-2 text-sm font-semibold">
                      {t("count", { count: places.length })}
                      <ArrowRight
                        aria-hidden
                        className="size-4 transition-transform group-hover:translate-x-1"
                      />
                    </p>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
