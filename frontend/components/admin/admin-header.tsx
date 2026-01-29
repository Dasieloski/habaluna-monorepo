"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Search, User, LogOut, Settings, Menu, X, Package, Users, Percent, ClipboardList, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { api } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

const SEARCH_DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 2
const LIMIT_PER_TYPE = 5

interface AdminHeaderProps {
  onMenuToggle?: () => void
  isMenuOpen?: boolean
}

export function AdminHeader({ onMenuToggle, isMenuOpen }: AdminHeaderProps) {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [alerts, setAlerts] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const [searchQuery, setSearchQuery] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<{ products: any[]; customers: any[]; offers: any[] }>({ products: [], customers: [], offers: [] })
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchQuery.trim().length < MIN_QUERY_LENGTH) {
      setSearchResults({ products: [], customers: [], offers: [] })
      setSearchOpen(false)
      return
    }
    const t = setTimeout(async () => {
      setSearchLoading(true)
      setSearchOpen(true)
      try {
        const res = await api.getAdminGlobalSearch(searchQuery.trim(), LIMIT_PER_TYPE)
        setSearchResults({
          products: res.products || [],
          customers: res.customers || [],
          offers: res.offers || [],
        })
      } catch {
        setSearchResults({ products: [], customers: [], offers: [] })
      } finally {
        setSearchLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [searchQuery])

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
  }, [])

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [handleClickOutside])

  const hasResults =
    searchResults.products.length > 0 ||
    searchResults.customers.length > 0 ||
    searchResults.offers.length > 0
  const showPanel = searchOpen && (searchQuery.trim().length >= MIN_QUERY_LENGTH) && (searchLoading || hasResults)

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const response = await api.getAlerts()
        const alertsData = Array.isArray(response.data) ? response.data : []
        
        // Filtrar según preferencias de notificación
        const NOTIFICATION_PREFS_KEY = 'admin_notification_preferences'
        let prefs: Record<string, boolean> = { newOrders: true, lowStock: true, outOfStock: true, reviews: true }
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem(NOTIFICATION_PREFS_KEY)
          if (saved) {
            try {
              prefs = JSON.parse(saved)
            } catch {}
          }
        }
        
        // Mapeo de tipos de alerta a preferencias
        const alertTypeToPref: Record<string, string> = {
          'LOW_STOCK': 'lowStock',
          'OUT_OF_STOCK': 'outOfStock',
          'PENDING_PAYMENT': 'newOrders',
        }
        
        const filteredAlerts = alertsData.filter((alert: any) => {
          const prefKey = alertTypeToPref[alert.type]
          return !prefKey || prefs[prefKey] !== false // Mostrar si no hay pref o está activa
        })
        
        setAlerts(filteredAlerts)
        setUnreadCount(filteredAlerts.filter((a: any) => a.status === 'NEW').length)
      } catch (error) {
        console.error("Error loading alerts:", error)
      }
    }
    loadAlerts()
    // Refrescar cada 30 segundos
    const interval = setInterval(loadAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }
  
  const userDisplayName = user?.firstName 
    ? `${user.firstName} ${user.lastName || ''}`.trim() 
    : user?.email || "Admin"

  const getAlertLink = (alert: any) => {
    if (alert.type.includes('STOCK')) return '/admin/inventory'
    if (alert.type.includes('PAYMENT')) return '/admin/orders'
    return '/admin/alerts'
  }

  return (
    <header className="h-16 bg-card border-b border-border px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Mobile menu button */}
      <Button 
        variant="ghost" 
        size="icon" 
        className="lg:hidden"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onMenuToggle?.()
        }}
        type="button"
      >
        {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Búsqueda global */}
      <div className="hidden md:flex items-center flex-1 max-w-md" ref={searchRef}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar productos, clientes, pedidos, ofertas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim().length >= MIN_QUERY_LENGTH && setSearchOpen(true)}
            className="pl-10 bg-secondary/50 border-transparent focus:border-primary h-10"
            aria-label="Búsqueda global"
            aria-expanded={showPanel}
          />
          {showPanel && (
            <div
              className="absolute left-0 right-0 top-full mt-1 z-50 bg-card border border-border rounded-md shadow-lg max-h-[min(70vh,400px)] overflow-y-auto"
              role="listbox"
            >
              {searchLoading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Buscando...</span>
                </div>
              ) : (
                <>
                  {searchResults.products.length > 0 && (
                    <div className="p-2 border-b border-border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1 flex items-center gap-2">
                        <Package className="w-3.5 h-3.5" /> Productos
                      </p>
                      <ul className="mt-1">
                        {searchResults.products.slice(0, LIMIT_PER_TYPE).map((p: any) => (
                          <li key={p.id}>
                            <Link
                              href={`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`}
                              className="block px-3 py-2 text-sm rounded hover:bg-accent hover:text-accent-foreground truncate"
                              onClick={() => setSearchOpen(false)}
                            >
                              {p.name}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href={`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`}
                            className="block px-3 py-2 text-xs text-primary hover:underline"
                            onClick={() => setSearchOpen(false)}
                          >
                            Ver todos los productos →
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                  {searchResults.customers.length > 0 && (
                    <div className="p-2 border-b border-border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5" /> Clientes
                      </p>
                      <ul className="mt-1">
                        {searchResults.customers.slice(0, LIMIT_PER_TYPE).map((c: any) => (
                          <li key={c.id}>
                            <Link
                              href={`/admin/customers?search=${encodeURIComponent(searchQuery.trim())}`}
                              className="block px-3 py-2 text-sm rounded hover:bg-accent hover:text-accent-foreground truncate"
                              onClick={() => setSearchOpen(false)}
                            >
                              {[c.firstName, c.lastName].filter(Boolean).join(" ") || c.email || c.id}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href={`/admin/customers?search=${encodeURIComponent(searchQuery.trim())}`}
                            className="block px-3 py-2 text-xs text-primary hover:underline"
                            onClick={() => setSearchOpen(false)}
                          >
                            Ver todos los clientes →
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                  {searchResults.offers.length > 0 && (
                    <div className="p-2 border-b border-border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1 flex items-center gap-2">
                        <Percent className="w-3.5 h-3.5" /> Ofertas
                      </p>
                      <ul className="mt-1">
                        {searchResults.offers.slice(0, LIMIT_PER_TYPE).map((o: any) => (
                          <li key={o.id}>
                            <Link
                              href={`/admin/offers?search=${encodeURIComponent(searchQuery.trim())}`}
                              className="block px-3 py-2 text-sm rounded hover:bg-accent hover:text-accent-foreground truncate"
                              onClick={() => setSearchOpen(false)}
                            >
                              {o.name || o.code || o.id}
                            </Link>
                          </li>
                        ))}
                        <li>
                          <Link
                            href={`/admin/offers?search=${encodeURIComponent(searchQuery.trim())}`}
                            className="block px-3 py-2 text-xs text-primary hover:underline"
                            onClick={() => setSearchOpen(false)}
                          >
                            Ver todas las ofertas →
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 py-1 flex items-center gap-2">
                      <ClipboardList className="w-3.5 h-3.5" /> Pedidos
                    </p>
                    <Link
                      href={`/admin/orders?search=${encodeURIComponent(searchQuery.trim())}`}
                      className="block px-3 py-2 text-sm rounded hover:bg-accent hover:text-accent-foreground"
                      onClick={() => setSearchOpen(false)}
                    >
                      Buscar en pedidos
                    </Link>
                  </div>
                  {!hasResults && !searchLoading && (
                    <p className="px-4 py-3 text-sm text-muted-foreground">Sin resultados para &quot;{searchQuery.trim()}&quot;</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        <ThemeToggle className="shrink-0" />
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {alerts.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No hay notificaciones
              </div>
            ) : (
              alerts.slice(0, 5).map((alert) => (
                <DropdownMenuItem
                  key={alert.id}
                  onClick={() => router.push(getAlertLink(alert))}
                  className="flex flex-col items-start p-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-semibold text-muted-foreground">{alert.type}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                  <span className="text-sm">{alert.message}</span>
                </DropdownMenuItem>
              ))
            )}
            {alerts.length > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/admin/alerts')}>
                  Ver todas las notificaciones
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 px-3 hover:bg-secondary">
              <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground">{userDisplayName}</p>
                <p className="text-xs text-muted-foreground">{user?.role || "Admin"}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
