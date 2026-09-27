"use client"

import { BookmarkCheck, BookmarkPlus, CalendarPlus, Sparkles } from "lucide-react"
import { useTranslations } from "next-intl"
import { useState, useTransition } from "react"
import { ShareButton } from "@/components/place/share-button"
import { useHydrated } from "@/hooks/use-now"
import { useSavedDays } from "@/hooks/use-saved"
import { useRouter } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

type PlanActionsProps = {
  /** Locale-aware path + query that reproduces this exact day. */
  path: string
  shareUrl: string
  icsHref: string
  label: string
  aiEnabled: boolean
  query: Record<string, string>
}

const button =
  "inline-flex h-10 items-center gap-2 rounded-full border-2 border-foreground px-4 text-sm font-semibold transition-colors hover:bg-accent disabled:opacity-60"

export function PlanActions({
  path,
  shareUrl,
  icsHref,
  label,
  aiEnabled,
  query,
}: PlanActionsProps) {
  const t = useTranslations("planner")
  const hydrated = useHydrated()
  const { has, save, remove } = useSavedDays()
  const saved = hydrated && has(path)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={saved}
          onClick={() => (saved ? remove(path) : save({ url: path, label }))}
          className={cn(button, saved && "bg-foreground text-background hover:bg-foreground/90")}
        >
          {saved ? (
            <BookmarkCheck aria-hidden className="size-4" />
          ) : (
            <BookmarkPlus aria-hidden className="size-4" />
          )}
          {saved ? t("savedDay") : t("save")}
        </button>
        <ShareButton title={label} url={shareUrl} />
        <a href={icsHref} download className={button}>
          <CalendarPlus aria-hidden className="size-4" />
          {t("export")}
        </a>
        {aiEnabled ? <EnhanceButton query={query} /> : null}
      </div>
    </div>
  )
}

type Enhanced = {
  query: Record<string, string>
  notes: { slot: string; name: string; note: string }[]
}

function EnhanceButton({ query }: { query: Record<string, string> }) {
  const t = useTranslations("planner")
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const [notes, setNotes] = useState<Enhanced["notes"]>([])

  async function enhance() {
    setBusy(true)
    setError(false)
    try {
      const res = await fetch("/api/my-day/enhance", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
      })
      if (!res.ok) throw new Error(String(res.status))
      const data = (await res.json()) as Enhanced
      setNotes(data.notes)
      startTransition(() =>
        router.push({ pathname: "/my-day", query: data.query }, { scroll: false }),
      )
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="basis-full space-y-2">
      <button
        type="button"
        onClick={enhance}
        disabled={busy || pending}
        aria-describedby="enhance-hint"
        className={cn(button, "border-foreground bg-taxi text-taxi-foreground hover:bg-taxi/80")}
      >
        <Sparkles aria-hidden className={cn("size-4", (busy || pending) && "animate-pulse")} />
        {busy || pending ? t("enhancing") : t("enhance")}
      </button>
      <p id="enhance-hint" className="text-xs text-muted-foreground">
        {t("enhanceHint")}
      </p>
      <div aria-live="polite">
        {error ? (
          <p className="text-sm font-semibold text-destructive">{t("enhanceError")}</p>
        ) : null}
        {notes.length ? (
          <ul className="space-y-1.5 rounded-xl bg-taxi/15 p-4 text-sm">
            {notes.map((n) => (
              <li key={n.slot}>
                <span className="font-bold">{n.name}:</span> {n.note}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  )
}
