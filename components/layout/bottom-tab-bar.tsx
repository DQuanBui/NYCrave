"use client"

import { useTranslations } from "next-intl"
import { useSaved } from "@/hooks/use-saved"
import { Link, usePathname } from "@/i18n/navigation"
import { NAV, TAB_BAR, isActive } from "@/lib/nav"
import { cn } from "@/lib/utils"

/** Mobile-only bottom navigation, styled like the dark band of a subway car door sign. */
export function BottomTabBar() {
  const t = useTranslations("nav")
  const pathname = usePathname()
  const { slugs } = useSaved()

  return (
    <nav
      aria-label={t("tabs")}
      className="fixed inset-x-0 bottom-0 z-40 sign-band pb-safe md:hidden"
    >
      <ul className="grid h-16 grid-cols-5 pt-1.5">
        {TAB_BAR.map((key) => {
          const item = NAV[key]
          const Icon = item.icon
          const active = isActive(pathname, item.href)
          const isMyDay = key === "myDay"
          return (
            <li key={key} className="flex">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold transition-colors",
                  active ? "text-taxi" : "text-sign-foreground/70 hover:text-sign-foreground",
                )}
              >
                <span
                  className={cn(
                    "relative grid place-items-center rounded-full transition-transform",
                    isMyDay ? "-mt-5 size-11 bg-taxi text-taxi-foreground shadow-lg" : "size-6",
                    active && !isMyDay && "scale-110",
                  )}
                >
                  <Icon className="size-5" aria-hidden strokeWidth={active ? 2.5 : 2} />
                  {key === "saved" && slugs.length > 0 ? (
                    <span className="absolute -top-1 -right-2 grid min-w-4 place-items-center rounded-full bg-line-red px-1 text-[0.6rem] leading-4 text-white tabular-nums">
                      {slugs.length}
                    </span>
                  ) : null}
                </span>
                {t(key)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
