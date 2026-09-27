import type { MetadataRoute } from "next"
import { NEIGHBORHOODS } from "@/data/neighborhoods"
import { getPathname } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { toSlug } from "@/lib/place-filters"
import { getPlaces } from "@/lib/places"
import { SITE_URL } from "@/lib/site"
import { CATEGORY_META } from "@/lib/taxonomy"
import { countByType, TYPE_KINDS, type TypeKind } from "@/lib/type-browse"

export const revalidate = 3600

const url = (href: string) => {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${SITE_URL}${getPathname({ href, locale })}`]),
  )
  return {
    url: `${SITE_URL}${getPathname({ href, locale: routing.defaultLocale })}`,
    alternates: routing.locales.length > 1 ? { languages } : undefined,
  }
}

/** Only verified places are listed; placeholders stay out of search engines. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const places = await getPlaces()
  const verified = places.filter((p) => p.verified)

  const staticPages = [
    "/",
    "/my-day",
    "/tips",
    "/neighborhoods",
    "/map",
    ...Object.values(CATEGORY_META).map((m) => m.href),
    ...NEIGHBORHOODS.map((n) => `/neighborhoods/${n.slug}`),
  ]
  const typePages = (Object.keys(TYPE_KINDS) as TypeKind[]).flatMap((kind) =>
    countByType(kind, verified)
      .filter((t) => t.count > 0)
      .map((t) => `${TYPE_KINDS[kind].base}/${toSlug(t.value)}`),
  )

  return [
    ...staticPages.map((href) => ({ ...url(href), changeFrequency: "weekly" as const })),
    ...typePages.map((href) => ({ ...url(href), changeFrequency: "weekly" as const })),
    ...verified.map((p) => ({
      ...url(`/place/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
    })),
  ]
}
