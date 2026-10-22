import { TypePage, typeMetadata, typeStaticParams } from "@/components/listing/type-page"
import { initLocale } from "@/i18n/locale"

// Built once and cached; filters are applied in the browser (see ListingView)
export const revalidate = 86400

type Props = PageProps<"/[locale]/eat/cuisine/[slug]">

export function generateStaticParams() {
  return typeStaticParams("cuisine").map(({ slug }) => ({ slug: slug }))
}

export async function generateMetadata({ params }: Props) {
  await initLocale(params)
  return typeMetadata("cuisine", (await params).slug)
}

export default async function Page({ params }: Props) {
  await initLocale(params)
  return <TypePage kind="cuisine" slug={(await params).slug} />
}
