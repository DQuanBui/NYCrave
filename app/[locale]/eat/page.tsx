import { CategoryPage, categoryMetadata } from "@/components/place/category-page"
import { initLocale } from "@/i18n/locale"

export async function generateMetadata({ params }: PageProps<"/[locale]/eat">) {
  await initLocale(params)
  return categoryMetadata("restaurant")
}

export default async function Page({ params, searchParams }: PageProps<"/[locale]/eat">) {
  await initLocale(params)
  return <CategoryPage category="restaurant" searchParams={searchParams} />
}
