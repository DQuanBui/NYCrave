"use client"

import { useTheme } from "next-themes"
import { useEffect } from "react"
import { THEME_COLORS } from "@/lib/theme-colors"

/**
 * The page sets the browser bar color per device scheme (light or dark media
 * query). When someone picks a theme by hand, both tags take that theme's
 * color so the bar matches the page; "Match device" puts them back.
 */
export function ThemeColorSync() {
  const { theme, resolvedTheme } = useTheme()
  useEffect(() => {
    const tags = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    const forced = theme === "light" || theme === "dark" ? THEME_COLORS[theme] : null
    for (const tag of tags) {
      const own = tag.media.includes("dark") ? THEME_COLORS.dark : THEME_COLORS.light
      tag.content = forced ?? own
    }
  }, [theme, resolvedTheme])
  return null
}
