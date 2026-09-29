"use client"

import { CheckCircle2, MessageSquareHeart, X } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useActionState, useEffect, useId, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { usePathname } from "@/i18n/navigation"
import { feedbackAction, type FeedbackState } from "@/lib/feedback-actions"
import { FEEDBACK_FEATURES, MAX_FEEDBACK_CHARS } from "@/lib/feedback-options"
import { EMPTY_MEMORY, type FeedbackMemory, parseMemory, shouldAsk } from "@/lib/feedback-timing"
import { cn } from "@/lib/utils"

const KEY = "nycrave:feedback:v1"
/** The footer link asks the prompt to open the form through this event. */
export const OPEN_FEEDBACK_EVENT = "nycrave:feedback:open"
/** Saving a place or a day, or stamping the passport, counts as real use. */
const ENGAGED_EVENTS = [
  "nycrave:saved:v1:change",
  "nycrave:days:v1:change",
  "nycrave:passport:v1:change",
]
/** Pages where a card would cover the page's own controls. */
const HIDDEN_ON = ["/map", "/admin"]
const FACES = ["😞", "🙁", "😐", "🙂", "😍"] as const
const SCORES = ["1", "2", "3", "4", "5"] as const

/** The page last counted, so a re-run effect does not count one view twice. */
let counted: string | null = null

function load(): FeedbackMemory {
  try {
    return parseMemory(JSON.parse(window.localStorage.getItem(KEY) ?? "null"))
  } catch {
    return EMPTY_MEMORY
  }
}

function remember(patch: Partial<FeedbackMemory>) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...load(), ...patch }))
  } catch {
    // Storage blocked (private mode): the card may simply ask again next visit.
  }
}

/**
 * "How's NYCrave so far?" A small card that asks for a rating once someone has
 * used the site for a while, plus the form it opens (also reachable from the footer).
 */
export function FeedbackPrompt() {
  const t = useTranslations("feedback")
  const pathname = usePathname()
  const [card, setCard] = useState(false)
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  // Remounting the form on each open starts fresh
  const [round, setRound] = useState(0)
  const hidden = HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))

  // Count page views, then ask after a short pause if the time is right
  useEffect(() => {
    let memory = load()
    if (counted !== pathname) {
      counted = pathname
      memory = { ...memory, views: memory.views + 1 }
      remember({ views: memory.views })
    }
    if (hidden || !shouldAsk(memory, Date.now())) return
    const timer = window.setTimeout(() => {
      // Never on top of another open dialog (the assistant, a report form)
      if (document.querySelector('[role="dialog"][data-state="open"]')) return
      remember({ askedAt: Date.now() })
      setCard(true)
    }, 2500)
    return () => window.clearTimeout(timer)
  }, [pathname, hidden])

  useEffect(() => {
    const engaged = () => remember({ engaged: true })
    const openForm = () => {
      setCard(false)
      setRating(null)
      setRound((r) => r + 1)
      setOpen(true)
    }
    for (const e of ENGAGED_EVENTS) window.addEventListener(e, engaged)
    window.addEventListener(OPEN_FEEDBACK_EVENT, openForm)
    return () => {
      for (const e of ENGAGED_EVENTS) window.removeEventListener(e, engaged)
      window.removeEventListener(OPEN_FEEDBACK_EVENT, openForm)
    }
  }, [])

  function pick(score: number) {
    setCard(false)
    setRating(score)
    setRound((r) => r + 1)
    setOpen(true)
  }

  return (
    <>
      {card && !hidden ? (
        <aside
          aria-labelledby="feedback-ask"
          className="fixed inset-x-3 bottom-[calc(8.5rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-sm rounded-3xl border bg-background p-4 shadow-2xl motion-safe:animate-in motion-safe:duration-500 motion-safe:fade-in motion-safe:slide-in-from-bottom-4 md:inset-x-auto md:bottom-6 md:left-6"
        >
          <div className="flex items-start gap-3">
            <MessageSquareHeart aria-hidden className="mt-0.5 size-5 shrink-0 text-line-red" />
            <div className="min-w-0 flex-1">
              <h2 id="feedback-ask" className="font-bold">
                {t("ask")}
              </h2>
              <p className="text-sm text-muted-foreground">{t("askBody")}</p>
            </div>
            <button
              type="button"
              onClick={() => setCard(false)}
              className="-m-1 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X aria-hidden className="size-4" />
              <span className="sr-only">{t("notNow")}</span>
            </button>
          </div>
          <div className="mt-3 flex justify-between gap-1">
            {FACES.map((face, i) => (
              <button
                key={face}
                type="button"
                onClick={() => pick(i + 1)}
                aria-label={t("rate", { rating: i + 1, label: t(`ratings.${SCORES[i]}`) })}
                className="grid size-12 place-items-center rounded-2xl text-2xl transition-transform hover:scale-110 hover:bg-muted focus-visible:scale-110"
              >
                <span aria-hidden>{face}</span>
              </button>
            ))}
          </div>
        </aside>
      ) : null}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto max-h-[92dvh] max-w-lg overflow-y-auto rounded-t-3xl"
        >
          <SheetHeader>
            <SheetTitle className="text-xl font-bold">{t("title")}</SheetTitle>
            <SheetDescription>{t("intro")}</SheetDescription>
          </SheetHeader>
          <FeedbackForm key={round} initialRating={rating} onDone={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}

function FeedbackForm({
  initialRating,
  onDone,
}: {
  initialRating: number | null
  onDone: () => void
}) {
  const t = useTranslations("feedback")
  const locale = useLocale()
  const commentId = useId()
  const [rating, setRating] = useState(initialRating)
  const [comment, setComment] = useState("")
  const [state, action, pending] = useActionState<FeedbackState, FormData>(feedbackAction, {})

  useEffect(() => {
    if (state.status === "sent") remember({ sentAt: Date.now() })
  }, [state.status])

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
      <input type="hidden" name="locale" value={locale} />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] size-px opacity-0"
      />
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">{t("rating")}</legend>
        <div className="grid grid-cols-5 gap-2">
          {FACES.map((face, i) => {
            const score = i + 1
            return (
              <label
                key={face}
                className={cn(
                  "flex cursor-pointer flex-col items-center gap-1 rounded-2xl border px-1 py-2 text-center transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring",
                  rating === score ? "border-foreground bg-muted" : "hover:bg-muted/60",
                )}
              >
                <input
                  type="radio"
                  name="rating"
                  value={score}
                  required
                  checked={rating === score}
                  onChange={() => setRating(score)}
                  className="sr-only"
                />
                <span aria-hidden className="text-2xl">
                  {face}
                </span>
                <span className="text-xs leading-tight font-semibold">
                  {t(`ratings.${SCORES[i]}`)}
                </span>
              </label>
            )
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-semibold">{t("used")}</legend>
        <div className="flex flex-wrap gap-2">
          {FEEDBACK_FEATURES.map((f) => (
            <label
              key={f}
              className="cursor-pointer rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors not-has-checked:hover:bg-muted/60 has-checked:border-foreground has-checked:bg-foreground has-checked:text-background has-focus-visible:ring-3 has-focus-visible:ring-ring"
            >
              <input type="checkbox" name="features" value={f} className="sr-only" />
              {t(`features.${f}`)}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="space-y-2">
        <label htmlFor={commentId} className="text-sm font-semibold">
          {t("comment")}
        </label>
        <textarea
          id={commentId}
          name="comment"
          maxLength={MAX_FEEDBACK_CHARS}
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t("commentPlaceholder")}
          className="w-full rounded-xl border bg-background px-3 py-2 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring"
        />
        {comment.length > MAX_FEEDBACK_CHARS - 200 ? (
          <p className="text-right text-xs text-muted-foreground">
            {comment.length}/{MAX_FEEDBACK_CHARS}
          </p>
        ) : null}
      </div>
      {state.status === "error" || state.status === "limited" ? (
        <p role="alert" className="text-sm font-semibold text-destructive">
          {t(state.status)}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={!rating || pending}
        className="h-11 w-full rounded-full bg-taxi text-base font-bold text-taxi-foreground hover:bg-taxi/90"
      >
        {pending ? t("sending") : t("send")}
      </Button>
      <p className="text-xs text-muted-foreground">{t("privacy")}</p>
    </form>
  )
}

/** "Send feedback" in the footer: opens the same form. */
export function FeedbackLink({ className }: { className?: string }) {
  const t = useTranslations("feedback")
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_FEEDBACK_EVENT))}
      className={className}
    >
      {t("open")}
    </button>
  )
}
