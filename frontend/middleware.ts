import { NextResponse, type NextRequest } from "next/server"

type SiteMode = "LIVE" | "MAINTENANCE" | "COMING_SOON"

function normalizeApiBaseUrl(raw: string): string {
  let url = (raw || "").trim()
  if (!url) return "http://localhost:4000"
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`
  url = url.replace(/\/api\/?$/, "")
  return url
}

// Función para obtener la URL de la API de forma robusta
function getApiBaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL
  
  // Si no hay URL configurada y estamos en producción (Railway), usar la URL conocida
  if (!url) {
    // En Railway, si la variable no está configurada durante el build,
    // usar la URL conocida del backend
    url = "https://habanaluna-backend-production.up.railway.app"
  }
  
  // Si aún no hay URL (desarrollo local), usar localhost
  if (!url) {
    url = "http://localhost:4000"
  }
  
  return normalizeApiBaseUrl(url)
}

const API_BASE_URL = getApiBaseUrl()

let cachedMode: { value: SiteMode; ts: number } | null = null

async function getSiteMode(): Promise<SiteMode> {
  const now = Date.now()
  if (cachedMode && now - cachedMode.ts < 30_000) return cachedMode.value

  try {
    const res = await fetch(`${API_BASE_URL}/api/ui-settings/public`, {
      // Edge: mantener simple; cache corto en memoria
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    const data: any = await res.json().catch(() => null)
    const mode = (data?.siteMode as SiteMode) || "LIVE"
    cachedMode = { value: mode, ts: now }
    return mode
  } catch {
    return "LIVE"
  }
}

function isBypassedPath(pathname: string) {
  if (pathname.startsWith("/admin")) return true
  if (pathname === "/maintenance" || pathname === "/coming-soon") return true
  // Rutas de autenticación (incluyendo reset-password) deben ser accesibles siempre
  if (pathname.startsWith("/auth")) return true
  // Next internals / assets
  if (pathname.startsWith("/_next")) return true
  // Static files served by Next/public (importante: no romper imágenes/css/favicon en modo mantenimiento)
  if (pathname.startsWith("/uploads")) return true
  // Si tiene extensión (ej: .png, .svg, .jpg, .css, .js) lo tratamos como asset público
  if (/\.[a-z0-9]+$/i.test(pathname)) return true
  if (pathname.startsWith("/api")) return true
  return false
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const isResetPassword = pathname.startsWith("/auth/reset-password")

  // DEBUG: Log para rutas de reset-password
  if (isResetPassword) {
    console.log('[Middleware] ========== PROCESANDO RESET-PASSWORD ==========')
    console.log('[Middleware] Pathname:', pathname)
    console.log('[Middleware] URL completa:', req.url)
    console.log('[Middleware] Method:', req.method)
    console.log('[Middleware] Headers:', Object.fromEntries(req.headers.entries()))
  }

  // CRÍTICO: Bypass inmediato y absoluto para todas las rutas de auth
  // Esto debe ser lo PRIMERO que se ejecute, antes de cualquier otra lógica
  // Incluye todas las subrutas como /auth/reset-password/[token]
  if (pathname.startsWith("/auth")) {
    if (isResetPassword) {
      console.log('[Middleware] Ruta /auth detectada - Bypass inmediato (NO debería ejecutarse por matcher)')
      console.log('[Middleware] ========== BYPASS RESET-PASSWORD ==========')
    }
    // Devolver inmediatamente sin procesar nada más
    // Esto asegura que Next.js procese la ruta dinámica sin interferencia
    return NextResponse.next()
  }

  // También verificar isBypassedPath por si acaso
  if (isBypassedPath(pathname)) {
    if (isResetPassword) {
      console.log('[Middleware] Ruta en isBypassedPath - Bypass (NO debería llegar aquí)')
    }
    return NextResponse.next()
  }

  const mode = await getSiteMode()
  if (mode === "LIVE") return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = mode === "MAINTENANCE" ? "/maintenance" : "/coming-soon"
  return NextResponse.redirect(url)
}

export const config = {
  // CRÍTICO: El matcher debe excluir completamente /auth para que Next.js procese las rutas dinámicas
  // Si el matcher incluye /auth, el middleware se ejecuta y puede interferir
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next (Next.js internals - static files, image optimization, etc)
     * - favicon.ico (favicon file)
     * - auth (auth routes - DEBE estar excluido completamente del matcher)
     * - admin (admin routes)
     * - maintenance and coming-soon pages
     */
    '/((?!api|_next|favicon.ico|auth|admin|maintenance|coming-soon).*)',
  ],
}

