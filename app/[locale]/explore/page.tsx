import { CategoryPage, categoryMetadata } from "@/components/place/category-page"
import { initLocale } from "@/i18n/locale"

export async function generateMetadata({ params }: PageProps<"/[locale]/explore">) {
  await initLocale(params)
  return categoryMetadata("attraction")
}

export default async function Page({ params }: PageProps<"/[locale]/explore">) {
  await initLocale(params)
  return <CategoryPage category="attraction" />
}
