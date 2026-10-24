"use client"

import { NextIntlClientProvider, useLocale, useMessages } from "next-intl"
import { useMemo, type ComponentProps } from "react"

/**
 * Adds a page's own message namespaces to the ones every page gets. Merging
 * here, in the browser, means those messages are sent only with that page.
 */
export function MessagesScope({
  messages,
  children,
}: {
  messages: Record<string, unknown>
  children: React.ReactNode
}) {
  const locale = useLocale()
  const parent = useMessages()
  // The page's namespaces are the same typed messages, just sent separately
  const merged = useMemo(
    () => ({ ...parent, ...messages }) as ComponentProps<typeof NextIntlClientProvider>["messages"],
    [parent, messages],
  )
  return (
    <NextIntlClientProvider locale={locale} messages={merged}>
      {children}
    </NextIntlClientProvider>
  )
}
