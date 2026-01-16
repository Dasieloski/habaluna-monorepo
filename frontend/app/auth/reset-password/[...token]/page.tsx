// LOG CRÍTICO: Verificar que el módulo se carga
console.log('[ResetPassword] ========== MÓDULO CARGADO ==========')
console.log('[ResetPassword] Timestamp carga módulo:', new Date().toISOString())
console.log('[ResetPassword] Entorno:', process.env.NODE_ENV)
console.log('[ResetPassword] ====================================')

import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ResetPasswordClient } from "./reset-password-client"

// CRÍTICO: Forzar renderizado dinámico en cada request
// Esto asegura que Next.js no intente pre-renderizar la ruta durante el build
// y que siempre se renderice en el servidor en cada request
export const dynamic = 'force-dynamic'
export const dynamicParams = true
export const revalidate = 0

// CRÍTICO: Asegurar que Next.js reconozca esta ruta como catch-all en producción
export const generateStaticParams = () => {
  return []
}

// DEBUG: Verificar que la ruta se está cargando correctamente
console.log('[PAGE] ========== RUTA RESET-PASSWORD CARGADA ==========')
console.log('[PAGE] NODE_ENV:', process.env.NODE_ENV)
console.log('[PAGE] NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
console.log('[PAGE] Timestamp carga:', new Date().toISOString())
console.log('[PAGE] ================================================')

console.log('[ResetPassword] Configuraciones exportadas:', {
  dynamicParams,
  revalidate
})

type PageProps = {
  params: Promise<{ token: string[] }>
}

// Usar la función centralizada para consistencia
import { getApiBaseUrlLazy } from "@/lib/api"

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  console.log('[ResetPassword] [generateMetadata] INICIO - Generando metadata')
  try {
    const resolvedParams = await params
    const token = Array.isArray(resolvedParams.token) ? resolvedParams.token.join('/') : resolvedParams.token || ''
    console.log('[ResetPassword] [generateMetadata] Params resueltos:', {
      token: token?.substring(0, 10) + '...',
      tokenLength: token?.length
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
    
    // Unir el array de tokens en un string (catch-all route devuelve array)
    const token = Array.isArray(resolvedParams.token) 
      ? resolvedParams.token.join('/') 
      : resolvedParams.token || ''
    
    console.log('[ResetPassword] [PAGE] Paso 1 COMPLETADO - Params resueltos en', paramsTime, 'ms:', {
      token: token?.substring(0, 20) + '...',
      tokenLength: token?.length,
      tokenType: typeof token,
      tokenArray: Array.isArray(resolvedParams.token) ? resolvedParams.token : 'not array'
    })

    // Paso 2: Validar token (validación exhaustiva)
    console.log('[ResetPassword] [PAGE] Paso 2: Validando token...')
    console.log('[ResetPassword] [PAGE] Token recibido (desde token):', {
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
    const apiBaseUrl = getApiBaseUrlLazy()
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
