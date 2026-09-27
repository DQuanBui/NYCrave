import type { Metadata, Viewport } from "next"
import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import { getTranslations } from "next-intl/server"
import { BottomTabBar } from "@/components/layout/bottom-tab-bar"
import { Assistant } from "@/components/assistant/assistant"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { ServiceWorker } from "@/components/providers/service-worker"
import { Providers } from "@/components/providers/theme-provider"
import { initLocale } from "@/i18n/locale"
import { routing } from "@/i18n/routing"
import { body, display } from "@/lib/fonts"
import { SITE_URL } from "@/lib/site"
import "../globals.css"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const locale = await initLocale(params)
  const t = await getTranslations({ locale, namespace: "meta" })
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t("title"), template: t("titleTemplate") },
    description: t("description"),
    applicationName: "NYCrave",
    appleWebApp: { capable: true, title: "NYCrave", statusBarStyle: "default" },
    formatDetection: { telephone: false },
    openGraph: { type: "website", siteName: "NYCrave", locale },
    twitter: { card: "summary_large_image" },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1c1e" },
  ],
  viewportFit: "cover",
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  if (!hasLocale(routing.locales, (await params).locale)) notFound()
  const locale = await initLocale(params)
  const t = await getTranslations("nav")

  return (
    <html lang={locale} suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <Providers>
            <a
              href="#main"
              className="sr-only z-50 rounded-full bg-taxi px-4 py-2 font-bold text-taxi-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
            >
              {t("skipToContent")}
            </a>
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
            <BottomTabBar />
            <Assistant ai={Boolean(process.env.ANTHROPIC_API_KEY)} />
            <ServiceWorker />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
