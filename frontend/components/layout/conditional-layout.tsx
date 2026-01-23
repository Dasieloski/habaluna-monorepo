"use client"

import type React from "react"
import { Suspense } from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PageTransition } from "@/components/layout/page-transition"
import { ThemeProvider } from "@/components/themes/theme-provider"

export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith("/admin")

  if (isAdminRoute) {
    // Rutas de admin sin transiciones para mantener la velocidad
    return <>{children}</>
  }

  return (
    <>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main>
        {/* PageTransition dentro del main para aplicar transiciones a las páginas */}
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />

      {/* Theme Provider - Renderiza temas estacionales */}
      <Suspense fallback={null}>
        <ThemeProvider />
      </Suspense>
    </>
  )
}

