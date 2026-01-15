import { NextResponse, type NextRequest } from "next/server"

type SiteMode = "LIVE" | "MAINTENANCE" | "COMING_SOON"

function normalizeApiBaseUrl(raw: string): string {
  let url = (raw || "").trim()
  if (!url) return "http://localhost:4000"
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`
  url = url.replace(/\/api\/?$/, "")
  return url
}

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000")

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

  // CRÍTICO: Bypass inmediato y absoluto para todas las rutas de auth
  // Esto debe ser lo PRIMERO que se ejecute, antes de cualquier otra lógica
  if (pathname.startsWith("/auth")) {
    return NextResponse.next()
  }

  // También verificar isBypassedPath por si acaso
  if (isBypassedPath(pathname)) return NextResponse.next()

  const mode = await getSiteMode()
  if (mode === "LIVE") return NextResponse.next()

  const url = req.nextUrl.clone()
  url.pathname = mode === "MAINTENANCE" ? "/maintenance" : "/coming-soon"
  return NextResponse.redirect(url)
}

export const config = {
  // Excluir completamente las rutas de auth del middleware
  // Esto asegura que Next.js procese las rutas dinámicas sin interferencia
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (auth routes including reset-password with dynamic segments) - COMPLETAMENTE EXCLUIDO
     * - admin (admin routes)
     * - maintenance and coming-soon pages
     */
    '/((?!api|_next|favicon.ico|auth|admin|maintenance|coming-soon).*)',
  ],
}

