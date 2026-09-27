"use client"

import { useLocale, useTranslations } from "next-intl"
import { useTransition } from "react"
import { usePathname, useRouter } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"

/** Renders only once a second locale is listed in i18n/routing.ts. */
export function LocaleSwitcher() {
  const t = useTranslations("footer")
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  if (routing.locales.length < 2) return null

  return (
    <label className="inline-flex items-center gap-2 text-sm font-semibold">
      {t("language")}
      <select
        value={locale}
        disabled={pending}
        onChange={(e) =>
          startTransition(() =>
            router.replace(pathname, { locale: e.target.value as typeof locale }),
          )
        }
        className="h-9 rounded-full border-2 border-sign-foreground/30 bg-sign px-3 text-sign-foreground"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {new Intl.DisplayNames([l], { type: "language" }).of(l)}
          </option>
        ))}
      </select>
    </label>
  )
}
