import { getTranslations } from "next-intl/server"
import { EmptyState } from "@/components/brand/empty-state"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import type { LineColor } from "@/lib/lines"

type ComingSoonProps = {
  section: "myDay" | "tips"
  line: LineColor
  bullet: React.ReactNode
  href: string
}

export async function ComingSoon({ section, line, bullet, href }: ComingSoonProps) {
  const t = await getTranslations("comingSoon")
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
      <p className="mb-4 text-center text-sm font-semibold text-muted-foreground">{t("badge")}</p>
      <EmptyState
        as="h1"
        line={line}
        bullet={bullet}
        title={t(`${section}.title`)}
        body={t(`${section}.body`)}
        action={
          <Button asChild size="lg" className="rounded-full">
            <Link href={href}>{t(`${section}.cta`)}</Link>
          </Button>
        }
      />
    </div>
  )
}
