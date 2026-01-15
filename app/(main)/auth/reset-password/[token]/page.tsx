import { notFound } from "next/navigation"
import { ResetPasswordForm } from "./reset-password-form"

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

// Validar y procesar el token en el servidor para forzar el procesamiento de la ruta
// Esto asegura que Next.js reconozca la ruta dinámica en producción
// Similar a cómo /products/[slug] hace fetch al backend para activar el procesamiento
async function processResetToken(token: string): Promise<string> {
  // Decodificar el token
  const decodedToken = decodeURIComponent(token)
  
  // Validación básica del formato del token
  if (!decodedToken || decodedToken.trim().length === 0) {
    throw new Error("Token inválido")
  }

  // Hacer un fetch al backend para activar el procesamiento de Next.js en producción
  // Esto es crítico: Next.js 16 necesita trabajo asíncrono (fetch) para reconocer rutas dinámicas
  // Similar a cómo /products/[slug] hace fetch al backend
  try {
    const apiBaseUrl = getApiBaseUrl()
    
    // Hacer una petición ligera al backend para activar el procesamiento
    // Usamos un timeout corto para no bloquear si hay problemas de red
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 1500)
    
    // Intentar hacer fetch a cualquier endpoint del API
    // El objetivo es activar el procesamiento de Next.js, no validar nada
    // Si el endpoint no existe o falla, no importa
    await Promise.race([
      fetch(`${apiBaseUrl}/api`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        cache: "no-store",
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500)),
    ]).catch(() => {
      // Ignorar todos los errores (404, timeout, red, etc.)
      // Lo importante es que Next.js haya intentado procesar el fetch
    })
    
    clearTimeout(timeoutId)
  } catch {
    // Si hay cualquier error, no importa
    // Lo crítico es que el fetch se haya intentado ejecutar
    // Esto fuerza a Next.js a procesar la ruta dinámica en producción
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

