import type React from "react"
import type { Metadata, Viewport } from "next"
import { Providers } from "./providers"
import "./globals.css"

// Solo cargar Analytics si estamos en Vercel
const Analytics = process.env.VERCEL
  ? require("@vercel/analytics/next").Analytics
  : () => null

// Fuentes: Kaluar (cuerpo), Galafera (títulos), Makira (banner), The Choed (logo) vía @font-face en globals.css

export const metadata: Metadata = {
  metadataBase: new URL((process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")),
  title: {
    default: "Habaluna - Tienda online de productos únicos en Cuba",
    template: "%s | Habaluna",
  },
  description:
    "Compra online en Cuba: alimentos gourmet, bebidas premium, materiales de construcción y más. Envíos a toda la isla. ¡Calidad garantizada!",
  keywords: ["tienda online cuba", "envios a cuba", "alimentos gourmet cuba", "materiales construccion cuba", "habaluna"],
  icons: {
    icon: [{ url: "/uploads/logo.png", type: "image/png" }],
    shortcut: "/uploads/logo.png",
    apple: [{ url: "/uploads/logo.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "Habaluna",
    title: "Habaluna - Tienda online de productos únicos en Cuba",
    description:
      "Descubre productos únicos: alimentos, materiales y mucho más. Calidad y originalidad en cada compra.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Habaluna - Tu tienda de productos originales",
    description:
      "Descubre productos únicos: alimentos, materiales y mucho más. Calidad y originalidad en cada compra.",
  },
  alternates: {
    canonical: "/",
  },
}

export const viewport: Viewport = {
  themeColor: "#4d69a5",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://habaluna-backend-production.up.railway.app" />
        {/* Preload fuentes propias para que carguen desde el primer request */}
        <link rel="preload" href="/fonts/TheChoedRegular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Kaluar-Light-Exfont88f8.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Galafera-Bold-Exfont121b.otf" as="font" type="font/otf" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Makira-Medium-Exfont13a8.otf" as="font" type="font/otf" crossOrigin="anonymous" />
      </head>
      <body className="antialiased font-sans">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
