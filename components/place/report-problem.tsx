"use client"

import { CheckCircle2, Flag } from "lucide-react"
import { useTranslations } from "next-intl"
import { useActionState, useId, useState } from "react"
import { reportAction, type ReportState } from "@/app/[locale]/place/[slug]/actions"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const KINDS = ["closed", "hours", "location", "photo", "other"] as const

/** "Something wrong?" A quick report that lands in the admin page. */
export function ReportProblem({ placeId, placeName }: { placeId: string; placeName: string }) {
  const t = useTranslations("report")
  const [open, setOpen] = useState(false)
  // Remounting the form on each open starts a fresh report
  const [round, setRound] = useState(0)

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) setRound((r) => r + 1)
      }}
    >
      <SheetTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <Flag aria-hidden className="size-4" />
          {t("open")}
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-3xl">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">{t("title")}</SheetTitle>
          <SheetDescription>{t("intro", { name: placeName })}</SheetDescription>
        </SheetHeader>
        <ReportForm key={round} placeId={placeId} onDone={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}

function ReportForm({ placeId, onDone }: { placeId: string; onDone: () => void }) {
  const t = useTranslations("report")
  const noteId = useId()
  const [kind, setKind] = useState<(typeof KINDS)[number] | null>(null)
  const [state, action, pending] = useActionState<ReportState, FormData>(reportAction, {})

  if (state.status === "sent") {
    return (
      <div className="space-y-4 px-4 pb-6 text-center">
        <CheckCircle2 aria-hidden className="mx-auto size-10 text-line-green" />
        <p role="status" className="font-semibold">
          {t("thanks")}
        </p>
        <Button type="button" variant="outline" className="rounded-full" onClick={onDone}>
          {t("close")}
        </Button>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5 px-4 pb-6">
      <input type="hidden" name="placeId" value={placeId} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] size-px opacity-0"
      />
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-semibold">{t("what")}</legend>
        <div className="grid gap-2">
          {KINDS.map((k) => (
            <label
              key={k}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors",
                kind === k ? "border-foreground bg-muted" : "hover:bg-muted/60",
              )}
            >
              <input
                type="radio"
                name="kind"
                value={k}
                required
                checked={kind === k}
                onChange={() => setKind(k)}
                className="size-4 accent-foreground"
              />
              {t(`kinds.${k}`)}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="space-y-2">
        <label htmlFor={noteId} className="text-sm font-semibold">
          {t("note")}
        </label>
        <textarea
          id={noteId}
          name="note"
          maxLength={500}
          rows={3}
          placeholder={t("notePlaceholder")}
          className="w-full rounded-xl border bg-background px-3 py-2 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring"
        />
      </div>
      {state.status === "error" || state.status === "limited" ? (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {t(state.status)}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={!kind || pending}
        className="h-11 w-full rounded-full bg-taxi text-base font-bold text-taxi-foreground hover:bg-taxi/90"
      >
        {pending ? t("sending") : t("send")}
      </Button>
      <p className="text-xs text-muted-foreground">{t("privacy")}</p>
    </form>
  )
}
