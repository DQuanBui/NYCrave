import { Accessibility } from "lucide-react"
import { useTranslations } from "next-intl"
import { LineBullet } from "@/components/brand/line-bullet"
import { ROUTE_LINE, type NearbyStation } from "@/lib/subway"
import { cn } from "@/lib/utils"

/** Route bullets in MTA order, the way station signs show them. */
export function RouteBullets({
  routes,
  size = "sm",
  className,
}: {
  routes: string[]
  size?: "xs" | "sm" | "md"
  className?: string
}) {
  const t = useTranslations("subway")
  return (
    <span className={cn("inline-flex flex-wrap gap-1", className)}>
      <span className="sr-only">{t("trains", { routes: routes.join(", ") })}</span>
      {routes.map((r) => (
        <LineBullet key={r} line={ROUTE_LINE[r] ?? "gray"} size={size}>
          {r}
        </LineBullet>
      ))}
    </span>
  )
}

/** The closest stations to a place, with their trains and the walk. */
export function SubwayList({ stations }: { stations: NearbyStation[] }) {
  const t = useTranslations("subway")
  return (
    <ul className="space-y-3">
      {stations.map((s) => (
        <li key={`${s.name}-${s.lat}`} className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              {s.name}
              {s.ada ? (
                <Accessibility
                  role="img"
                  aria-label={t("accessible")}
                  className="size-4 shrink-0 text-line-blue"
                />
              ) : null}
            </p>
            <RouteBullets routes={s.routes} />
          </div>
          <p className="shrink-0 pt-0.5 text-sm text-muted-foreground">
            {t("walk", { minutes: s.walkMinutes })}
          </p>
        </li>
      ))}
    </ul>
  )
}
