"use client"

import { ArrowUp, Sparkles, Square, Trash2 } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useEffect, useId, useRef, useState } from "react"
import { RichText } from "@/components/assistant/rich-text"
import { HoursBadge } from "@/components/place/hours-badge"
import { PlacePhoto } from "@/components/place/place-photo"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Link, usePathname } from "@/i18n/navigation"
import { MAX_MESSAGE_CHARS } from "@/lib/assistant/limits"
import type { CardPlace } from "@/lib/card-place"
import { cn } from "@/lib/utils"

type Message = {
  role: "user" | "assistant"
  content: string
  places?: CardPlace[]
  error?: string
  pending?: boolean
}

/** Pages where the floating button would cover the page's own controls. */
const HIDDEN_ON = ["/map", "/admin"]

/** Answers come from Claude when `ai` is on, otherwise from the free helper. */
export function Assistant({ ai }: { ai: boolean }) {
  const t = useTranslations("assistant")
  const locale = useLocale()
  const pathname = usePathname()
  const inputId = useId()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [draft, setDraft] = useState("")
  const controller = useRef<AbortController | null>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const busy = messages.at(-1)?.pending === true

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight })
  }, [messages])

  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null

  const update = (patch: (m: Message) => Message) =>
    setMessages((all) => [...all.slice(0, -1), patch(all[all.length - 1])])

  async function ask(question: string) {
    const content = question.trim().slice(0, MAX_MESSAGE_CHARS)
    if (!content || busy) return
    const history = [
      ...messages.filter((m) => !m.error && m.content),
      { role: "user" as const, content },
    ]
    setMessages([
      ...messages,
      { role: "user", content },
      { role: "assistant", content: "", pending: true },
    ])
    setDraft("")
    controller.current = new AbortController()

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          // The server keeps the last few turns; answers are plain text
          messages: history.slice(-10).map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: controller.current.signal,
      })
      if (!res.ok || !res.body) {
        const { error } = (await res.json().catch(() => ({}))) as { error?: string }
        update((m) => ({ ...m, pending: false, error: error ?? "failed" }))
        return
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""
      for (;;) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""
        for (const line of lines) {
          if (!line) continue
          const event = JSON.parse(line) as
            | { type: "text"; text: string }
            | { type: "places"; places: CardPlace[] }
            | { type: "done" }
            | { type: "error"; error: string }
          if (event.type === "text") update((m) => ({ ...m, content: m.content + event.text }))
          else if (event.type === "places") update((m) => ({ ...m, places: event.places }))
          else if (event.type === "error") update((m) => ({ ...m, error: event.error }))
        }
      }
      update((m) => ({ ...m, pending: false }))
    } catch {
      update((m) => ({
        ...m,
        pending: false,
        error: controller.current?.signal.aborted ? undefined : "failed",
      }))
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 inline-flex h-12 items-center gap-2 rounded-full bg-foreground pr-5 pl-4 font-bold text-background shadow-xl transition-transform hover:-translate-y-0.5 md:bottom-6"
        >
          <Sparkles aria-hidden className="size-5 text-taxi" />
          {t("open")}
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="border-b pr-12">
          <SheetTitle className="flex items-center gap-2 text-lg font-bold">
            <Sparkles aria-hidden className="size-5 text-taxi" />
            {t("title")}
          </SheetTitle>
          <SheetDescription>{t(ai ? "intro" : "introFree")}</SheetDescription>
        </SheetHeader>

        <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">{t("try")}</p>
              <ul className="space-y-2">
                {(t.raw("suggestions") as string[]).map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => ask(s)}
                      className="w-full rounded-2xl border bg-card px-4 py-3 text-left text-sm font-semibold hover:border-foreground"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <ol aria-live="polite" className="space-y-4">
            {messages.map((m, i) => (
              <li
                key={i}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[88%] space-y-3 rounded-2xl px-4 py-3 text-[0.95rem] leading-relaxed",
                    m.role === "user" ? "bg-foreground text-background" : "border bg-card",
                  )}
                >
                  <span className="sr-only">
                    {t(m.role === "user" ? "you" : "assistantLabel")}:{" "}
                  </span>
                  {m.role === "user" ? (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  ) : m.content ? (
                    <RichText text={m.content} onNavigate={() => setOpen(false)} />
                  ) : m.pending ? (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <span className="flex gap-1" aria-hidden>
                        {[0, 1, 2].map((d) => (
                          <span
                            key={d}
                            className="size-1.5 animate-bounce rounded-full bg-current motion-reduce:animate-none"
                            style={{ animationDelay: `${d * 150}ms` }}
                          />
                        ))}
                      </span>
                      {t("thinking")}
                    </p>
                  ) : null}
                  {m.places?.length ? (
                    <ul className="space-y-2">
                      {m.places.map((p) => (
                        <li key={p.id}>
                          <Link
                            href={`/place/${p.slug}`}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 rounded-xl border bg-background p-2 hover:border-foreground"
                          >
                            <PlacePhoto
                              place={p}
                              sizes="56px"
                              showChip={false}
                              className="size-14 shrink-0 rounded-lg"
                            />
                            <span className="min-w-0 space-y-0.5">
                              <span className="block truncate font-bold">{p.name}</span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {p.neighborhood}
                              </span>
                              <HoursBadge hours={p.hours} />
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {m.error && m.error !== "aborted" ? (
                    <p role="alert" className="text-sm font-semibold text-destructive">
                      {t(
                        `errors.${m.error in ERRORS ? (m.error as keyof typeof ERRORS) : "failed"}`,
                      )}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            ask(draft)
          }}
          className="space-y-2 border-t p-3"
        >
          <div className="flex items-end gap-2">
            <label htmlFor={inputId} className="sr-only">
              {t("label")}
            </label>
            <textarea
              id={inputId}
              value={draft}
              rows={1}
              maxLength={MAX_MESSAGE_CHARS}
              placeholder={t("placeholder")}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  ask(draft)
                }
              }}
              className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border bg-background px-4 py-2.5 text-base outline-none focus-visible:ring-3 focus-visible:ring-ring"
            />
            {busy ? (
              <button
                type="button"
                onClick={() => controller.current?.abort()}
                aria-label={t("stop")}
                className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-foreground"
              >
                <Square aria-hidden className="size-4 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!draft.trim()}
                aria-label={t("send")}
                className="grid size-11 shrink-0 place-items-center rounded-full bg-taxi text-taxi-foreground disabled:opacity-50"
              >
                <ArrowUp aria-hidden className="size-5" />
              </button>
            )}
          </div>
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {t(ai ? "disclaimer" : "disclaimerFree")}{" "}
              <Link
                href="/privacy"
                onClick={() => setOpen(false)}
                className="underline underline-offset-2"
              >
                {t("privacy")}
              </Link>
            </p>
            {messages.length ? (
              <button
                type="button"
                onClick={() => {
                  controller.current?.abort()
                  setMessages([])
                }}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <Trash2 aria-hidden className="size-3.5" />
                {t("clear")}
              </button>
            ) : null}
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

const ERRORS = { not_configured: 1, rate_limited: 1, busy: 1, failed: 1, invalid: 1, aborted: 1 }
