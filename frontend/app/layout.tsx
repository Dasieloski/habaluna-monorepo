import type React from "react"
import type { Metadata, Viewport } from "next"
import { Poppins } from "next/font/google"
import { Providers } from "./providers"
import "./globals.css"

// Solo cargar Analytics si estamos en Vercel
const Analytics = process.env.VERCEL
  ? require("@vercel/analytics/next").Analytics
  : () => null

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  metadataBase: new URL((process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")),
  title: {
    default: "Habaluna - Tu tienda de productos originales",
    template: "%s | Habaluna",
  },
  description:
    "Descubre productos únicos: alimentos, materiales y mucho más. Calidad y originalidad en cada compra.",
  icons: {
    icon: [{ url: "/uploads/logo.png", type: "image/png" }],
    shortcut: "/uploads/logo.png",
    apple: [{ url: "/uploads/logo.png", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: "Habaluna",
    title: "Habaluna - Tu tienda de productos originales",
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
  themeColor: "#009c6c",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={poppins.variable}>
      <head>
        {/* Preconnect para mejorar LCP */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://habaluna-backend-production.up.railway.app" />
        {/* Logo: base Londrina Shadow; rotación con Monda (GF) + 14 fuentes obligatorias vía @font-face si se tienen */}
        <link href="https://fonts.googleapis.com/css2?family=Londrina+Shadow&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Monda:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${poppins.className} antialiased`}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
