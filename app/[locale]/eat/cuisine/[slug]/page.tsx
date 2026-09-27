import { TypePage, typeMetadata, typeStaticParams } from "@/components/listing/type-page"
import { initLocale } from "@/i18n/locale"

type Props = PageProps<"/[locale]/eat/cuisine/[slug]">

export function generateStaticParams() {
  return typeStaticParams("cuisine").map(({ slug }) => ({ slug: slug }))
}

export async function generateMetadata({ params }: Props) {
  await initLocale(params)
  return typeMetadata("cuisine", (await params).slug)
}

export default async function Page({ params, searchParams }: Props) {
  await initLocale(params)
  return <TypePage kind="cuisine" slug={(await params).slug} searchParams={searchParams} />
}
