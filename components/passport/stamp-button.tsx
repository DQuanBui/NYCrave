"use client"

import { Check, Stamp as StampIcon, X } from "lucide-react"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"
import { useTranslations } from "next-intl"
import { useEffect, useRef, useState } from "react"
import { Confetti } from "@/components/fx/confetti"
import { useHydrated } from "@/hooks/use-now"
import { usePassport } from "@/hooks/use-passport"
import { Link } from "@/i18n/navigation"
import { stampFor, type BadgeKey } from "@/lib/passport"
import { cn } from "@/lib/utils"
import type { Place } from "@/types/place"

export type StampPlace = Pick<
  Place,
  | "slug"
  | "name"
  | "borough"
  | "category"
  | "cuisines"
  | "dishTypes"
  | "drinkTypes"
  | "vibeTags"
  | "isFree"
>

/** "Stamp my passport": marks a place as visited, with a stamp, confetti and any new badge. */
export function StampButton({ place }: { place: StampPlace }) {
  const t = useTranslations("passport")
  const hydrated = useHydrated()
  const { stamps, stamp } = usePassport()
  const stamped = hydrated && Boolean(stamps[place.slug])
  const button = useRef<HTMLButtonElement>(null)
  const [burst, setBurst] = useState<{ x: number; y: number; id: number } | null>(null)
  const [toast, setToast] = useState<{ badges: BadgeKey[]; id: number } | null>(null)

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 7000)
    return () => window.clearTimeout(timer)
  }, [toast])

  function onStamp() {
    const badges = stamp(place.slug, stampFor(place, Date.now()))
    const rect = button.current?.getBoundingClientRect()
    if (rect)
      setBurst({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, id: Date.now() })
    setToast({ badges, id: Date.now() })
  }

  return (
    <>
      {stamped ? (
        <Link
          href="/passport"
          className="relative inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-bold text-background"
        >
          <m.span
            key="stamped"
            initial={burst ? { scale: 2.4, rotate: -30, opacity: 0 } : false}
            animate={{ scale: 1, rotate: -12, opacity: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 14 }}
            className="grid size-6 place-items-center rounded-full border-2 border-dashed border-taxi text-taxi"
          >
            <Check aria-hidden className="size-3.5" strokeWidth={3} />
          </m.span>
          {t("stamped")}
        </Link>
      ) : (
        <button
          ref={button}
          type="button"
          onClick={onStamp}
          aria-label={t("stampLabel", { name: place.name })}
          className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-foreground px-4 text-sm font-bold transition-colors hover:bg-accent"
        >
          <StampIcon aria-hidden className="size-4" />
          {t("stamp")}
        </button>
      )}

      {burst ? <Confetti key={burst.id} x={burst.x} y={burst.y} /> : null}

      <AnimatePresence>
        {toast ? (
          <m.div
            key={toast.id}
            role="status"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-sm rounded-2xl bg-sign p-4 text-sign-foreground shadow-2xl md:bottom-6"
          >
            <div className="flex items-start gap-3">
              <span aria-hidden className="text-2xl">
                {toast.badges.length ? "🏅" : "🎟️"}
              </span>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-bold">{t("toast.stamped", { name: place.name })}</p>
                {toast.badges.length ? (
                  <p className="text-sm text-taxi">
                    {t("toast.badge", {
                      badges: toast.badges.map((b) => t(`badges.${b}.name`)).join(", "),
                    })}
                  </p>
                ) : null}
                <Link
                  href="/passport"
                  className="inline-block text-sm font-semibold underline underline-offset-4"
                >
                  {t("toast.open")}
                </Link>
              </div>
              <button
                type="button"
                onClick={() => setToast(null)}
                className={cn("-m-1 rounded-full p-1.5 hover:bg-white/10")}
              >
                <X aria-hidden className="size-4" />
                <span className="sr-only">{t("toast.close")}</span>
              </button>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
