import { hasLocale } from "next-intl"
import { getTranslations } from "next-intl/server"
import { routing } from "@/i18n/routing"
import { getPlaces } from "@/lib/places"
import { planToIcs } from "@/lib/planner/ics"
import { parsePlanParams } from "@/lib/planner/params"
import { planDay } from "@/lib/planner/plan"
import { SITE_URL } from "@/lib/site"

/** Calendar export. The query carries locks for every stop, so weather cannot reshuffle it. */
export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams
  const raw = Object.fromEntries(searchParams)
  const locale = hasLocale(routing.locales, raw.locale) ? raw.locale : routing.defaultLocale
  const t = await getTranslations({ locale, namespace: "planner.slots" })

  const { input, adjustments } = parsePlanParams(raw)
  const plan = planDay(input, await getPlaces(), adjustments)
  const body = planToIcs(plan, { siteUrl: SITE_URL, slotLabel: (slot) => t(slot as "breakfast") })

  return new Response(body, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="nycrave-${input.date}.ics"`,
      "cache-control": "no-store",
    },
  })
}
