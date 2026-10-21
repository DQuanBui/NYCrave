"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useHydrated } from "@/hooks/use-now"

const MODES = [
  { value: "light", Icon: Sun },
  { value: "dark", Icon: Moon },
  { value: "system", Icon: Monitor },
] as const

type Mode = (typeof MODES)[number]["value"]

/** Light, dark, or whatever the device is set to (the default). */
export function ThemeToggle() {
  const t = useTranslations("theme")
  const { theme, resolvedTheme, setTheme } = useTheme()
  const hydrated = useHydrated()
  const mode: Mode = hydrated && (theme === "light" || theme === "dark") ? theme : "system"
  // The button shows what is on screen: a sun or moon, even when following the device
  const Icon = hydrated && resolvedTheme === "dark" ? Moon : Sun

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("current", { mode: t(mode) })}
          className="rounded-full"
        >
          <Icon aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuLabel>{t("label")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={mode} onValueChange={setTheme}>
          {MODES.map(({ value, Icon: ModeIcon }) => (
            <DropdownMenuRadioItem key={value} value={value} className="gap-2">
              <ModeIcon aria-hidden className="size-4" />
              {t(value)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
