"use client"

import type { ReactNode } from "react"
import { SessionBootstrap } from "@/components/auth/session-bootstrap"
import { RadixSafetyReset } from "@/components/layout/radix-safety-reset"
import { ContextualToastProvider } from "@/components/contextual-toast"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <RadixSafetyReset />
      <SessionBootstrap />
      <ContextualToastProvider>
        {children}
      </ContextualToastProvider>
    </>
  )
}
