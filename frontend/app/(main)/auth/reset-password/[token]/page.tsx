import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ResetPasswordClient } from "./reset-password-client"

// CRÍTICO: Forzar modo dinámico para Next.js 16 en producción
// Esto asegura que la ruta se procese en runtime y no se pre-renderice
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

// CRÍTICO: Next.js 16 requiere generateStaticParams incluso para rutas completamente dinámicas
// Retornar array vacío indica que todos los parámetros son dinámicos y se generan en runtime
export async function generateStaticParams() {
  // Retornar array vacío indica que esta ruta es completamente dinámica
  // Next.js procesará cualquier token en runtime
  return []
}

type PageProps = {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await params // Asegurar que params se resuelva
  return {
    title: "Restablecer contraseña | Habaluna",
    description: "Restablece tu contraseña de Habaluna",
    robots: "noindex, nofollow", // No indexar páginas de reset
  }
}

export default async function ResetPasswordPage({ params }: PageProps) {
  const { token } = await params

  if (!token || typeof token !== "string" || token.trim() === "") {
    notFound()
  }

  // Decodificar el token
  let decodedToken: string
  try {
    decodedToken = decodeURIComponent(token)
  } catch {
    decodedToken = token
  }

  return <ResetPasswordClient token={decodedToken} />
}
