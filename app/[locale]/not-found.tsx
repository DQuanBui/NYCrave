import { Search } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { EmptyState } from "@/components/brand/empty-state"
import { LineBullet } from "@/components/brand/line-bullet"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { NAV, TOP_NAV } from "@/lib/nav"

export default async function NotFound() {
  const t = await getTranslations()
  return (
    <div className="mx-auto max-w-3xl space-y-10 px-4 py-20">
      <EmptyState
        bullet="?"
        line="gray"
        title={t("notFound.title")}
        body={t("notFound.body")}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/">{t("notFound.cta")}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/search">
                <Search aria-hidden />
                {t("notFound.search")}
              </Link>
            </Button>
          </div>
        }
        as="h1"
      />
      <nav aria-labelledby="other-lines" className="space-y-3">
        <h2 id="other-lines" className="text-center font-semibold text-muted-foreground">
          {t("notFound.lines")}
        </h2>
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {TOP_NAV.map((key) => {
            const item = NAV[key]
            const Icon = item.icon
            return (
              <li key={key}>
                <Link
                  href={item.href}
                  className="flex h-full flex-col items-center gap-1.5 rounded-xl border-2 border-transparent bg-muted/60 px-1 py-3 text-center text-sm font-semibold hover:border-foreground/30"
                >
                  <LineBullet line={item.line ?? "gray"} size="md">
                    <Icon className="size-4" aria-hidden />
                  </LineBullet>
                  {t(`nav.${key}`)}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
