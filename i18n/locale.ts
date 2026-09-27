import { hasLocale, type Locale } from "next-intl"
import { setRequestLocale } from "next-intl/server"
import { routing } from "./routing"

/** Narrows the [locale] route param and enables static rendering for the request. */
export async function initLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params
  const resolved = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale
  setRequestLocale(resolved)
  return resolved
}
