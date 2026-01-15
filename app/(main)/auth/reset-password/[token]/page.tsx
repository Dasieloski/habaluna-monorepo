import { notFound } from "next/navigation"
import { ResetPasswordForm } from "./reset-password-form"

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

// Procesar el token en el servidor
async function processResetToken(token: string): Promise<string> {
  // Decodificar el token
  const decodedToken = decodeURIComponent(token)
  
  // Validación básica del formato del token
  if (!decodedToken || decodedToken.trim().length === 0) {
    throw new Error("Token inválido")
  }

  return decodedToken
}

export default async function ResetPasswordPage({ params }: PageProps) {
  const { token } = await params

  if (!token || typeof token !== "string") {
    notFound()
  }

  // Procesar el token en el servidor para forzar el procesamiento de la ruta
  // Esto asegura que Next.js reconozca la ruta dinámica en producción
  // Similar a cómo /products/[slug] hace fetch al backend
  let decodedToken: string
  try {
    decodedToken = await processResetToken(token)
  } catch {
    notFound()
  }

  return <ResetPasswordForm token={decodedToken} />
}

