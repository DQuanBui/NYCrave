import { getTranslations } from "next-intl/server"
import { LineBullet } from "@/components/brand/line-bullet"
import { Wordmark } from "@/components/brand/wordmark"
import { FeedbackLink } from "@/components/feedback/feedback"
import { LocaleSwitcher } from "@/components/layout/locale-switcher"
import { Link } from "@/i18n/navigation"
import { feedbackEnabled } from "@/lib/feedback-store"
import { MENU_GROUPS, NAV } from "@/lib/nav"

export async function SiteFooter() {
  const t = await getTranslations()

  return (
    <footer className="mt-24 sign-band pb-28 text-sign-foreground md:pb-0 print:hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-16 pb-12 md:grid-cols-[1fr_2fr] lg:px-8">
        <div className="space-y-4">
          <Wordmark />
          <p className="max-w-xs text-sm leading-relaxed text-sign-foreground/75">
            <LineBullet line="gray" size="xs" className="mr-1.5 align-[-0.3em]">
              !
            </LineBullet>
            {t("footer.dataNote")}
          </p>
        </div>
        <nav
          aria-label={t("nav.menuTitle")}
          className="grid grid-cols-2 gap-x-6 gap-y-8 text-sm sm:grid-cols-4"
        >
          {MENU_GROUPS.map((group) => (
            <div key={group.key} className="space-y-3">
              <h2 className="text-xs font-bold tracking-wider text-sign-foreground uppercase">
                {t(`nav.groups.${group.key}`)}
              </h2>
              <ul className="space-y-2 font-semibold">
                {group.items.map((key) => (
                  <li key={key}>
                    <Link
                      href={NAV[key].href}
                      className="text-sign-foreground/75 underline-offset-4 hover:text-sign-foreground hover:underline"
                    >
                      {t(`nav.${key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 pb-8 text-xs text-sign-foreground/75 lg:px-8">
        <span className="flex flex-wrap gap-x-4 gap-y-1">
          <span>{t("footer.copyright", { year: new Date().getFullYear() })}</span>
          <Link href="/credits" className="underline underline-offset-4 hover:text-sign-foreground">
            {t("footer.credits")}
          </Link>
          <Link href="/privacy" className="underline underline-offset-4 hover:text-sign-foreground">
            {t("footer.privacy")}
          </Link>
          {feedbackEnabled() ? (
            <FeedbackLink className="underline underline-offset-4 hover:text-sign-foreground" />
          ) : null}
        </span>
        <LocaleSwitcher />
      </div>
    </footer>
  )
}
