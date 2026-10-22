import { CategoryPage, categoryMetadata } from "@/components/place/category-page"
import { initLocale } from "@/i18n/locale"

// Built once and cached; filters are applied in the browser (see ListingView)
export const revalidate = 86400

export async function generateMetadata({ params }: PageProps<"/[locale]/explore">) {
  await initLocale(params)
  return categoryMetadata("attraction")
}

export default async function Page({ params }: PageProps<"/[locale]/explore">) {
  await initLocale(params)
  return <CategoryPage category="attraction" />
}
