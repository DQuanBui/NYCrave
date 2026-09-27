import { TypePage, typeMetadata, typeStaticParams } from "@/components/listing/type-page"
import { initLocale } from "@/i18n/locale"

type Props = PageProps<"/[locale]/shop/[type]">

export function generateStaticParams() {
  return typeStaticParams("shop").map(({ slug }) => ({ type: slug }))
}

export async function generateMetadata({ params }: Props) {
  await initLocale(params)
  return typeMetadata("shop", (await params).type)
}

export default async function Page({ params, searchParams }: Props) {
  await initLocale(params)
  return <TypePage kind="shop" slug={(await params).type} searchParams={searchParams} />
}
