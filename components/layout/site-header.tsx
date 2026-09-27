"use client"

import { Heart, Menu, Search } from "lucide-react"
import { useTranslations } from "next-intl"
import { LineBullet } from "@/components/brand/line-bullet"
import { Wordmark } from "@/components/brand/wordmark"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useSaved } from "@/hooks/use-saved"
import { Link, usePathname } from "@/i18n/navigation"
import { LINES } from "@/lib/lines"
import { MENU, NAV, TOP_NAV, isActive } from "@/lib/nav"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const t = useTranslations("nav")
  const pathname = usePathname()
  const { slugs } = useSaved()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-2 px-4 lg:gap-6 lg:px-8">
        <Link href="/" className="-ml-1 rounded-full p-1" aria-label={t("homeLabel")}>
          <Wordmark />
        </Link>

        <nav aria-label={t("main")} className="hidden h-full md:flex">
          <ul className="flex h-full items-stretch">
            {TOP_NAV.map((key) => {
              const item = NAV[key]
              const active = isActive(pathname, item.href)
              return (
                <li key={key} className="flex">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-2 px-2.5 text-sm font-semibold whitespace-nowrap transition-colors lg:px-3",
                      active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.line ? (
                      <span
                        aria-hidden
                        className={cn("size-2.5 rounded-full", LINES[item.line].bg)}
                      />
                    ) : null}
                    {t(key)}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-2 bottom-0 h-1 rounded-t-full transition-transform duration-200",
                        item.line ? LINES[item.line].bg : "bg-foreground",
                        active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-50",
                      )}
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link href="/search" aria-label={t("search")}>
              <Search aria-hidden />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="hidden rounded-full lg:inline-flex">
            <Link href="/tips">{t("tips")}</Link>
          </Button>
          <Button asChild variant="ghost" className="hidden rounded-full md:inline-flex">
            <Link href="/saved" aria-current={isActive(pathname, "/saved") ? "page" : undefined}>
              <Heart aria-hidden />
              {t("saved")}
              {slugs.length > 0 ? (
                <span className="grid min-w-5 place-items-center rounded-full bg-foreground px-1 text-xs text-background tabular-nums">
                  {slugs.length}
                </span>
              ) : null}
            </Link>
          </Button>
          <Link
            href="/my-day"
            className="hidden h-9 items-center rounded-full bg-taxi px-4 text-sm font-bold text-taxi-foreground transition-transform hover:-translate-y-px active:translate-y-0 md:inline-flex"
          >
            {t("myDay")}
          </Link>
          <ThemeToggle />
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}

function MobileMenu() {
  const t = useTranslations("nav")
  const pathname = usePathname()

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full md:hidden"
          aria-label={t("openMenu")}
        >
          <Menu aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(22rem,88vw)] gap-0 p-0">
        <SheetHeader className="sign-band pt-6">
          <SheetTitle className="text-xl text-sign-foreground">{t("menuTitle")}</SheetTitle>
          <SheetDescription className="text-sign-foreground/75">
            {t("menuDescription")}
          </SheetDescription>
        </SheetHeader>
        <nav aria-label={t("main")} className="overflow-y-auto p-2">
          <ul>
            {MENU.map((key) => {
              const item = NAV[key]
              const Icon = item.icon
              const active = isActive(pathname, item.href)
              return (
                <li key={key}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-semibold",
                      active ? "bg-accent" : "hover:bg-accent/60",
                    )}
                  >
                    {item.line ? (
                      <LineBullet line={item.line} size="sm">
                        <Icon className="size-3.5" aria-hidden />
                      </LineBullet>
                    ) : (
                      <span className="grid size-6 place-items-center rounded-full bg-muted">
                        <Icon className="size-3.5" aria-hidden />
                      </span>
                    )}
                    {t(key)}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
