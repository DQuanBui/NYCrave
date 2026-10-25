"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { domAnimation, LazyMotion, MotionConfig } from "motion/react"
import { ThemeColorSync } from "@/components/providers/theme-color-sync"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ThemeColorSync />
      {/* LazyMotion + m.* keeps only the DOM animation features in the bundle */}
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </LazyMotion>
    </NextThemesProvider>
  )
}
