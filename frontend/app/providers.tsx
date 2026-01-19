"use client"

import type { ReactNode } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { SessionBootstrap } from "@/components/auth/session-bootstrap"
import { RadixSafetyReset } from "@/components/layout/radix-safety-reset"
import { ContextualToastProvider } from "@/components/contextual-toast"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="habaluna-theme">
      <RadixSafetyReset />
      <SessionBootstrap />
      <ContextualToastProvider>
        {children}
      </ContextualToastProvider>
    </ThemeProvider>
  )
}
