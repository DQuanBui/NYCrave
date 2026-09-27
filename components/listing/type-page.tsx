import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { ListingView } from "@/components/listing/listing-view"
import { SectionHeader } from "@/components/listing/section-header"
import { fromSlug, toSlug } from "@/lib/place-filters"
import { CATEGORY_META } from "@/lib/taxonomy"
import { TYPE_KINDS, typeMessageKey, type TypeKind } from "@/lib/type-browse"

type RawParams = Record<string, string | string[] | undefined>

export function typeStaticParams(kind: TypeKind) {
  return TYPE_KINDS[kind].values.map((v) => ({ slug: toSlug(v) }))
}

export async function typeMetadata(kind: TypeKind, slug: string): Promise<Metadata> {
  const value = fromSlug(TYPE_KINDS[kind].values, slug)
  if (!value) return {}
  const t = await getTranslations()
  const name = t(typeMessageKey(kind, value))
  return {
    title: t(`browse.${kind}Title`, { name }),
    description: t(`browse.${kind}Tagline`, { name }),
    alternates: { canonical: `${TYPE_KINDS[kind].base}/${slug}` },
  }
}

/** Listing for one cuisine, dish, drink or shop type. */
export async function TypePage({
  kind,
  slug,
  searchParams,
}: {
  kind: TypeKind
  slug: string
  searchParams: Promise<RawParams>
}) {
  const k = TYPE_KINDS[kind]
  const value = fromSlug(k.values, slug)
  if (!value) notFound()

  const t = await getTranslations()
  const meta = CATEGORY_META[k.category]
  const name = t(typeMessageKey(kind, value))

  return (
    <div>
      <SectionHeader
        line={meta.line}
        bullet={<span aria-hidden>{k.emoji[value]}</span>}
        title={name}
        tagline={t(`browse.${kind}Tagline`, { name })}
        back={{
          href: meta.href,
          label: t("browse.back", { section: t(`categories.${k.category}.title`) }),
        }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8 lg:py-10">
        <ListingView
          base={{ category: k.category, ...k.filter(value) }}
          searchParams={searchParams}
        />
      </div>
    </div>
  )
}
