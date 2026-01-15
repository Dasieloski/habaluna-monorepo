import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ResetPasswordClient } from "./reset-password-client"

// CRÍTICO: Forzar modo dinámico para Next.js 16 en producción
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

type PageProps = {
  params: Promise<{ token: string }>
}

// Función auxiliar para obtener la URL base de la API en el servidor
function getApiBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
  let url = raw.trim()
  if (!url) return "http://localhost:4000"
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`
  }
  return url.replace(/\/api\/?$/, "")
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await params
  return {
    title: "Restablecer contraseña | Habaluna",
    description: "Restablece tu contraseña de Habaluna",
    robots: "noindex, nofollow",
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

  // CRÍTICO: Hacer un fetch al backend para activar el procesamiento de Next.js en producción
  // Esto es similar a cómo /products/[slug] hace fetch al backend
  // Next.js 16 necesita trabajo asíncrono real (fetch) para reconocer rutas dinámicas en Railway
  // 
  // NOTA: No podemos validar el token aquí sin efectos secundarios porque el endpoint
  // POST /api/auth/reset-password marca el token como usado. La validación real
  // se hace en el cliente cuando el usuario envía el formulario.
  // 
  // Este fetch solo sirve para activar el procesamiento de Next.js, no para validar.
  try {
    const apiBaseUrl = getApiBaseUrl()
    
    // Hacer un fetch ligero al backend para activar el procesamiento
    // Usamos un endpoint que sabemos que existe y no tiene efectos secundarios
    await fetch(`${apiBaseUrl}/api/ui-settings/public`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }).catch(() => {
      // Si falla, no importa - el fetch ya activó el procesamiento de Next.js
    })
  } catch {
    // Ignorar errores, el fetch ya activó el procesamiento
  }

  return <ResetPasswordClient token={decodedToken} />
}
