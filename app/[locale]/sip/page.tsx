import { CategoryPage, categoryMetadata } from "@/components/place/category-page"
import { initLocale } from "@/i18n/locale"

export async function generateMetadata({ params }: PageProps<"/[locale]/sip">) {
  await initLocale(params)
  return categoryMetadata("drink")
}

export default async function Page({ params }: PageProps<"/[locale]/sip">) {
  await initLocale(params)
  return <CategoryPage category="drink" />
}
