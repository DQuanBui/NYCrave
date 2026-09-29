"use client"

import { LocateFixed, MapPin } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect, useMemo, useState } from "react"
import { NextLanes } from "@/components/next/next-lanes"
import { NEIGHBORHOODS } from "@/data/neighborhoods"
import { useGeolocation } from "@/hooks/use-geolocation"
import { useNow } from "@/hooks/use-now"
import type { LatLng } from "@/lib/geo"
import { cn } from "@/lib/utils"
import { AFTER, whatsNext, type After, type NextPlace } from "@/lib/whats-next"

const AFTER_EMOJI: Record<After, string> = {
  ate: "🍽️",
  coffee: "☕",
  drinks: "🍸",
  museum: "🏛️",
  park: "🌳",
  shopping: "🛍️",
  exploring: "🧭",
}

/** Where you are (your location, or a neighborhood) and what you just did. */
export function WhatsNextView({ places }: { places: NextPlace[] }) {
  const t = useTranslations("next")
  const now = useNow()
  const { state: geo, locate } = useGeolocation()
  const [hood, setHood] = useState("")
  const [after, setAfter] = useState<After>("exploring")
  const [useGps, setUseGps] = useState(false)
  const [ready, setReady] = useState(false)

  // A shared link can carry a neighborhood and what you just did
  useEffect(() => {
    const params = new URL(window.location.href).searchParams
    const from = params.get("from")
    const a = params.get("after")
    /* eslint-disable react-hooks/set-state-in-effect -- reading the URL once after hydration */
    if (from && NEIGHBORHOODS.some((n) => n.slug === from)) setHood(from)
    if (a && (AFTER as readonly string[]).includes(a)) setAfter(a as After)
    setReady(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [])

  const neighborhood = NEIGHBORHOODS.find((n) => n.slug === hood)
  const from: LatLng | null =
    useGps && geo.status === "ready" ? geo.position : neighborhood ? neighborhood : null

  // Keep the neighborhood and "just did" in the address so the page can be shared.
  // The visitor's own location is never put in the URL.
  useEffect(() => {
    if (!ready) return
    const url = new URL(window.location.href)
    if (hood && !useGps) url.searchParams.set("from", hood)
    else url.searchParams.delete("from")
    url.searchParams.set("after", after)
    window.history.replaceState(window.history.state, "", url)
  }, [hood, after, useGps, ready])

  const minute = now ? Math.floor(now.getTime() / 60_000) : 0
  const lanes = useMemo(
    () => (from && now ? whatsNext(places, { from, after, leaveAt: now }) : null),
    // Recompute each minute, not on every tick of unrelated state
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [places, from?.lat, from?.lng, after, minute],
  )

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 lg:px-8 lg:py-12">
      <div className="grid gap-6 rounded-3xl bg-sign p-5 text-sign-foreground sm:p-8 lg:grid-cols-2 lg:gap-10">
        <fieldset className="space-y-3">
          <legend className="mb-3 font-display text-2xl">{t("whereTitle")}</legend>
          <button
            type="button"
            onClick={() => {
              setUseGps(true)
              locate()
            }}
            aria-pressed={useGps}
            className={cn(
              "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full px-5 font-bold transition-colors sm:w-auto",
              useGps ? "bg-taxi text-taxi-foreground" : "bg-white/10 hover:bg-white/15",
            )}
          >
            <LocateFixed aria-hidden className="size-4" />
            {geo.status === "locating" ? t("locating") : t("useLocation")}
          </button>
          {useGps && geo.status === "denied" ? (
            <p role="alert" className="text-sm text-taxi">
              {t("locationDenied")}
            </p>
          ) : null}
          <label className="block space-y-1.5">
            <span className="flex items-center gap-1.5 text-sm text-sign-foreground/75">
              <MapPin aria-hidden className="size-4" />
              {t("orNeighborhood")}
            </span>
            <select
              value={useGps ? "" : hood}
              onChange={(e) => {
                setHood(e.target.value)
                setUseGps(false)
              }}
              className="h-11 w-full rounded-xl border-2 border-white/20 bg-sign px-3 font-semibold text-sign-foreground focus-visible:ring-3 focus-visible:ring-taxi focus-visible:outline-none"
            >
              <option value="">{t("pickNeighborhood")}</option>
              {NEIGHBORHOODS.slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((n) => (
                  <option key={n.slug} value={n.slug}>
                    {n.name}
                  </option>
                ))}
            </select>
          </label>
          <p className="text-xs text-sign-foreground/60">{t("privacy")}</p>
        </fieldset>

        <fieldset>
          <legend className="mb-3 font-display text-2xl">{t("afterTitle")}</legend>
          <div className="flex flex-wrap gap-2">
            {AFTER.map((a) => (
              <label
                key={a}
                className="cursor-pointer rounded-full border-2 border-white/20 px-4 py-2 text-sm font-semibold transition-colors hover:border-white/60 has-checked:border-taxi has-checked:bg-taxi has-checked:text-taxi-foreground has-focus-visible:ring-3 has-focus-visible:ring-taxi"
              >
                <input
                  type="radio"
                  name="after"
                  value={a}
                  checked={after === a}
                  onChange={() => setAfter(a)}
                  className="sr-only"
                />
                <span aria-hidden className="mr-1.5">
                  {AFTER_EMOJI[a]}
                </span>
                {t(`after.${a}`)}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div aria-live="polite">
        {!from ? (
          <p className="rounded-2xl border-2 border-dashed p-8 text-center text-muted-foreground">
            {t("chooseWhere")}
          </p>
        ) : !lanes ? null : lanes.length ? (
          <NextLanes lanes={lanes} headingLevel="h2" />
        ) : (
          <p className="rounded-2xl border-2 border-dashed p-8 text-center text-muted-foreground">
            {t("emptyNear")}
          </p>
        )}
      </div>
    </div>
  )
}
