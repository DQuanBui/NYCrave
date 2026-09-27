import { CategoryPage, categoryMetadata } from "@/components/place/category-page"
import { initLocale } from "@/i18n/locale"

export async function generateMetadata({ params }: PageProps<"/[locale]/parks">) {
  await initLocale(params)
  return categoryMetadata("park_pier")
}

export default async function Page({ params }: PageProps<"/[locale]/parks">) {
  await initLocale(params)
  return <CategoryPage category="park_pier" />
}
