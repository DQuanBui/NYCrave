import { CategoryPage, categoryMetadata } from "@/components/place/category-page"
import { initLocale } from "@/i18n/locale"

export async function generateMetadata({ params }: PageProps<"/[locale]/photo-spots">) {
  await initLocale(params)
  return categoryMetadata("photo_spot")
}

export default async function Page({ params, searchParams }: PageProps<"/[locale]/photo-spots">) {
  await initLocale(params)
  return <CategoryPage category="photo_spot" searchParams={searchParams} />
}
