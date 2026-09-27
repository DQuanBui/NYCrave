import { CategoryPage, categoryMetadata } from "@/components/place/category-page"
import { initLocale } from "@/i18n/locale"

export async function generateMetadata({ params }: PageProps<"/[locale]/shop">) {
  await initLocale(params)
  return categoryMetadata("shopping")
}

export default async function Page({ params, searchParams }: PageProps<"/[locale]/shop">) {
  await initLocale(params)
  return <CategoryPage category="shopping" searchParams={searchParams} />
}
