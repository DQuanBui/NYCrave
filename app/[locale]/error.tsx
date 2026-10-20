"use client"

import { RotateCcw } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { EmptyState } from "@/components/brand/empty-state"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

/** When a page fails to load: a service-change notice with a way to retry. */
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("errorPage")

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="mx-auto max-w-3xl px-4 py-20">
      <EmptyState
        as="h1"
        line="red"
        bullet="!"
        title={t("title")}
        body={t("body")}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" className="rounded-full" onClick={reset}>
              <RotateCcw aria-hidden />
              {t("retry")}
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/">{t("home")}</Link>
            </Button>
          </div>
        }
      />
    </div>
  )
}
