import { initLocale } from "@/i18n/locale"

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  await initLocale(params)
  return <div className="mx-auto max-w-7xl px-4 py-10" />
}
