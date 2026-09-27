import type { Metadata } from "next"
import { body, display } from "@/lib/fonts"
import { Providers } from "@/components/providers/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "NYCrave",
  description: "Where to eat, drink, shop, explore, and take photos in New York City.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
