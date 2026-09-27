import { TypePage, typeMetadata, typeStaticParams } from "@/components/listing/type-page"
import { initLocale } from "@/i18n/locale"

type Props = PageProps<"/[locale]/eat/dish/[slug]">

export function generateStaticParams() {
  return typeStaticParams("dish").map(({ slug }) => ({ slug: slug }))
}

export async function generateMetadata({ params }: Props) {
  await initLocale(params)
  return typeMetadata("dish", (await params).slug)
}

export default async function Page({ params, searchParams }: Props) {
  await initLocale(params)
  return <TypePage kind="dish" slug={(await params).slug} searchParams={searchParams} />
}
