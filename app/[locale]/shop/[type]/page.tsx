import { TypePage, typeMetadata, typeStaticParams } from "@/components/listing/type-page"
import { initLocale } from "@/i18n/locale"

// Built once and cached; filters are applied in the browser (see ListingView)
export const revalidate = 86400

type Props = PageProps<"/[locale]/shop/[type]">

export function generateStaticParams() {
  return typeStaticParams("shop").map(({ slug }) => ({ type: slug }))
}

export async function generateMetadata({ params }: Props) {
  await initLocale(params)
  return typeMetadata("shop", (await params).type)
}

export default async function Page({ params }: Props) {
  await initLocale(params)
  return <TypePage kind="shop" slug={(await params).type} />
}
