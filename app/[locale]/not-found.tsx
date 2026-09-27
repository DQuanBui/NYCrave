import { getTranslations } from "next-intl/server"
import { EmptyState } from "@/components/brand/empty-state"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

export default async function NotFound() {
  const t = await getTranslations("notFound")
  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <EmptyState
        bullet="?"
        line="gray"
        title={t("title")}
        body={t("body")}
        action={
          <Button asChild size="lg" className="rounded-full">
            <Link href="/">{t("cta")}</Link>
          </Button>
        }
        as="h1"
      />
    </div>
  )
}
