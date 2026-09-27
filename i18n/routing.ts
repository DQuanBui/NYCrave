import { defineRouting } from "next-intl/routing"

/**
 * Add a locale by creating messages/<locale>.json and listing it here.
 * Planned next: es, zh, ko, ja.
 */
export const routing = defineRouting({
  locales: ["en", "vi"],
  defaultLocale: "en",
  localePrefix: "as-needed",
})
