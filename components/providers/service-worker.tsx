"use client"

import { useLocale } from "next-intl"
import { useEffect } from "react"
import { useSaved } from "@/hooks/use-saved"
import { getPathname } from "@/i18n/navigation"

/**
 * Registers the service worker (production only) and tells it which place pages
 * to keep offline whenever the saved list changes.
 */
export function ServiceWorker() {
  const locale = useLocale()
  const { slugs } = useSaved()

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Unsupported or blocked: the site works the same, just not offline
    })
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return
    const urls = slugs.map((slug) => getPathname({ href: `/place/${slug}`, locale }))
    navigator.serviceWorker.ready.then((reg) =>
      reg.active?.postMessage({ type: "sync-saved", urls }),
    )
  }, [slugs, locale])

  return null
}
