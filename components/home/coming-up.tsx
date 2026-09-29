import { getLocale, getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { LINES } from "@/lib/lines"
import { formatWindow, type SeasonStatus } from "@/lib/seasons"
import { cn } from "@/lib/utils"

/** The next few dates on the New York calendar, each counting down. */
export async function ComingUp({ seasons }: { seasons: SeasonStatus[] }) {
  const t = await getTranslations("seasons")
  const tHome = await getTranslations("home.comingUp")
  const locale = await getLocale()

  return (
    <section aria-labelledby="coming-up" className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="coming-up" className="font-display text-display-md">
          {tHome("title")}
        </h2>
        <Link href="/seasons" className="text-sm font-bold underline underline-offset-4">
          {tHome("seeAll")}
        </Link>
      </div>
      <ol className="grid gap-4 sm:grid-cols-3">
        {seasons.map(({ event, window, daysUntil, happening }) => (
          <li key={event.key}>
            <Link
              href={`/seasons#${event.key}`}
              className="group flex h-full items-start gap-4 rounded-2xl border-2 border-transparent bg-card p-4 transition-colors hover:border-foreground"
            >
              <span
                aria-hidden
                className={cn(
                  "grid size-12 shrink-0 place-items-center rounded-full text-2xl transition-transform group-hover:-rotate-6",
                  LINES[event.line].bg,
                )}
              >
                {event.emoji}
              </span>
              <span className="min-w-0 space-y-1">
                <span className="block font-bold">{t(`events.${event.key}.name`)}</span>
                <span className="block text-sm text-muted-foreground">
                  {formatWindow(window, locale)}
                </span>
                <span
                  className={cn(
                    "inline-block rounded-full px-2 py-0.5 text-xs font-bold",
                    happening ? "bg-taxi text-taxi-foreground" : "bg-muted",
                  )}
                >
                  {happening ? t("status.now") : t("status.countdown", { days: daysUntil })}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}
