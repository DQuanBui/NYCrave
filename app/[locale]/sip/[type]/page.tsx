import { TypePage, typeMetadata, typeStaticParams } from "@/components/listing/type-page"
import { initLocale } from "@/i18n/locale"

type Props = PageProps<"/[locale]/sip/[type]">

export function generateStaticParams() {
  return typeStaticParams("drink").map(({ slug }) => ({ type: slug }))
}

export async function generateMetadata({ params }: Props) {
  await initLocale(params)
  return typeMetadata("drink", (await params).type)
}

export default async function Page({ params, searchParams }: Props) {
  await initLocale(params)
  return <TypePage kind="drink" slug={(await params).type} searchParams={searchParams} />
}
