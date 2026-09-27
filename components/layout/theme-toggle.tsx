"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { useHydrated } from "@/hooks/use-now"

export function ThemeToggle() {
  const t = useTranslations("theme")
  const { resolvedTheme, setTheme } = useTheme()
  const hydrated = useHydrated()
  const isDark = hydrated && resolvedTheme === "dark"
  const next = isDark ? "light" : "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={t("toggle", { mode: t(next) })}
      className="rounded-full"
    >
      {isDark ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </Button>
  )
}
