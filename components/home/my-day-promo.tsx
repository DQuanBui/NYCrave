import { getTranslations } from "next-intl/server"
import { Link } from "@/i18n/navigation"

const STOPS = ["breakfast", "morning", "lunch", "afternoon", "coffee", "dinner", "night"] as const

/** Teaser for the planner: a day drawn as a single taxi-yellow route with seven stations. */
export async function MyDayPromo() {
  const t = await getTranslations("home")
  return (
    <section
      aria-labelledby="my-day-title"
      className="relative overflow-hidden rounded-3xl bg-sign px-6 py-10 text-sign-foreground sm:px-10 sm:py-14"
    >
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div className="space-y-5">
          <h2 id="my-day-title" className="font-display text-display-lg">
            {t("myDayTitle")}
          </h2>
          <p className="max-w-md text-lg leading-relaxed text-sign-foreground/80">
            {t("myDayBody")}
          </p>
          <Link
            href="/my-day"
            className="inline-flex h-12 items-center rounded-full bg-taxi px-6 font-bold text-taxi-foreground transition-transform hover:-translate-y-0.5"
          >
            {t("myDayCta")}
          </Link>
        </div>

        <ol className="relative grid grid-cols-1 gap-3 sm:grid-cols-7 sm:gap-0">
          <span
            aria-hidden
            className="absolute top-2 bottom-2 left-[0.6875rem] w-1.5 rounded-full bg-taxi sm:top-[0.6875rem] sm:right-4 sm:bottom-auto sm:left-4 sm:h-1.5 sm:w-auto"
          />
          {STOPS.map((stop) => (
            <li
              key={stop}
              className="relative flex items-center gap-3 sm:flex-col sm:items-start sm:gap-3"
            >
              <span
                aria-hidden
                className="relative size-7 shrink-0 rounded-full bg-sign ring-[5px] ring-taxi ring-inset"
              />
              <span className="text-sm font-semibold sm:max-w-16 sm:text-xs sm:leading-tight">
                {t(`myDayStops.${stop}`)}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
