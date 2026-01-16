// LOG CRÍTICO: Verificar que el módulo se carga
console.log('[ResetPassword] ========== MÓDULO CARGADO ==========')
console.log('[ResetPassword] Timestamp carga módulo:', new Date().toISOString())
console.log('[ResetPassword] Entorno:', process.env.NODE_ENV)
console.log('[ResetPassword] ====================================')

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ResetPasswordClient } from "./reset-password-client"

// Configuración similar a /products/[slug] que funciona correctamente
// Ruta movida fuera del route group (main) para evitar problemas con standalone
export const revalidate = 0
export const dynamicParams = true

console.log('[ResetPassword] Configuraciones exportadas:', {
  dynamicParams,
  revalidate
})

type PageProps = {
  params: Promise<{ slug: string }>
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
  console.log('[ResetPassword] [generateMetadata] INICIO - Generando metadata')
  try {
    const resolvedParams = await params
    console.log('[ResetPassword] [generateMetadata] Params resueltos:', {
      slug: resolvedParams.slug?.substring(0, 10) + '...',
      slugLength: resolvedParams.slug?.length
    })
    
    const metadata = {
      title: "Restablecer contraseña | Habaluna",
      description: "Restablece tu contraseña de Habaluna",
      robots: "noindex, nofollow" as const,
    }
    
    console.log('[ResetPassword] [generateMetadata] FIN - Metadata generada:', metadata)
    return metadata
  } catch (error) {
    console.error('[ResetPassword] [generateMetadata] ERROR:', error)
    throw error
  }
}

export default async function ResetPasswordPage({ params }: PageProps) {
  console.log('[ResetPassword] [PAGE] ========== INICIO RENDERIZADO ==========')
  console.log('[ResetPassword] [PAGE] Timestamp:', new Date().toISOString())
  
  try {
    // Paso 1: Resolver params
    console.log('[ResetPassword] [PAGE] Paso 1: Resolviendo params...')
    const startParams = Date.now()
    const resolvedParams = await params
    const paramsTime = Date.now() - startParams
    console.log('[ResetPassword] [PAGE] Paso 1 COMPLETADO - Params resueltos en', paramsTime, 'ms:', {
      slug: resolvedParams.slug?.substring(0, 20) + '...',
      slugLength: resolvedParams.slug?.length,
      slugType: typeof resolvedParams.slug
    })
    
    // El parámetro se llama 'slug' pero contiene el token
    const token = resolvedParams.slug

    // Paso 2: Validar token (validación exhaustiva)
    console.log('[ResetPassword] [PAGE] Paso 2: Validando token...')
    console.log('[ResetPassword] [PAGE] Token recibido (desde slug):', {
      value: token,
      type: typeof token,
      length: token?.length,
      isEmpty: !token,
      isString: typeof token === "string",
      isTrimmedEmpty: typeof token === "string" && token.trim() === "",
      preview: typeof token === "string" ? token.substring(0, 20) + '...' : 'N/A'
    })
    
    // Validación exhaustiva del token
    if (!token) {
      console.error('[ResetPassword] [PAGE] Paso 2 ERROR - Token es null/undefined')
      notFound()
    }
    
    if (typeof token !== "string") {
      console.error('[ResetPassword] [PAGE] Paso 2 ERROR - Token no es string:', typeof token)
      notFound()
    }
    
    if (token.trim() === "") {
      console.error('[ResetPassword] [PAGE] Paso 2 ERROR - Token está vacío después de trim')
      notFound()
    }
    
    // Validar formato básico del token (debe ser hexadecimal, mínimo 32 caracteres)
    const tokenPattern = /^[a-f0-9]{32,}$/i
    if (!tokenPattern.test(token.trim())) {
      console.warn('[ResetPassword] [PAGE] Paso 2 WARNING - Token no coincide con patrón esperado, pero continuando')
    }
    
    console.log('[ResetPassword] [PAGE] Paso 2 COMPLETADO - Token válido:', {
      length: token.length,
      preview: token.substring(0, 20) + '...'
    })

    // Paso 3: Decodificar token
    console.log('[ResetPassword] [PAGE] Paso 3: Decodificando token...')
    let decodedToken: string
    try {
      decodedToken = decodeURIComponent(token)
      console.log('[ResetPassword] [PAGE] Paso 3 COMPLETADO - Token decodificado:', {
        originalLength: token.length,
        decodedLength: decodedToken.length,
        preview: decodedToken.substring(0, 20) + '...'
      })
    } catch (decodeError) {
      console.warn('[ResetPassword] [PAGE] Paso 3 WARNING - Error decodificando, usando token original:', decodeError)
      decodedToken = token
    }

    // Paso 4: Obtener API URL
    console.log('[ResetPassword] [PAGE] Paso 4: Obteniendo API URL...')
    const apiBaseUrl = getApiBaseUrl()
    console.log('[ResetPassword] [PAGE] Paso 4 COMPLETADO - API URL:', apiBaseUrl)

    // Paso 5: Fetch al backend
    console.log('[ResetPassword] [PAGE] Paso 5: Iniciando fetch al backend...')
    console.log('[ResetPassword] [PAGE] URL del fetch:', `${apiBaseUrl}/api/ui-settings/public`)
    
    const fetchStart = Date.now()
    try {
      const response = await fetch(`${apiBaseUrl}/api/ui-settings/public`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      })
      
      const fetchTime = Date.now() - fetchStart
      console.log('[ResetPassword] [PAGE] Paso 5 COMPLETADO - Fetch exitoso en', fetchTime, 'ms:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      if (!response.ok) {
        console.warn('[ResetPassword] [PAGE] Paso 5 WARNING - Fetch no OK pero continuando:', response.status)
      }
    } catch (fetchError: any) {
      const fetchTime = Date.now() - fetchStart
      console.error('[ResetPassword] [PAGE] Paso 5 ERROR - Fetch falló después de', fetchTime, 'ms:', {
        error: fetchError?.message,
        stack: fetchError?.stack,
        name: fetchError?.name
      })
      // Continuar de todas formas
    }

    // Paso 6: Renderizar componente
    console.log('[ResetPassword] [PAGE] Paso 6: Renderizando ResetPasswordClient...')
    console.log('[ResetPassword] [PAGE] Token que se pasa al cliente:', {
      preview: decodedToken.substring(0, 20) + '...',
      length: decodedToken.length
    })
    
    const component = <ResetPasswordClient token={decodedToken} />
    console.log('[ResetPassword] [PAGE] Paso 6 COMPLETADO - Componente creado')
    console.log('[ResetPassword] [PAGE] ========== FIN RENDERIZADO EXITOSO ==========')
    
    return component
  } catch (error: any) {
    console.error('[ResetPassword] [PAGE] ========== ERROR CRÍTICO ==========')
    console.error('[ResetPassword] [PAGE] Error:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    })
    console.error('[ResetPassword] [PAGE] ==========================================')
    throw error
  }
}
