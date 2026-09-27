import { defineRouting } from "next-intl/routing"

/**
 * Add a locale by creating messages/<locale>.json and listing it here.
 * Planned next: ja, fr, ar (right-to-left).
 */
export const routing = defineRouting({
  locales: ["en", "vi", "es", "zh", "ko"],
  defaultLocale: "en",
  localePrefix: "as-needed",
})
