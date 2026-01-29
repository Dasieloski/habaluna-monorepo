"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/lib/store/auth-store"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, Search, User, LogOut, Settings, Menu, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { api } from "@/lib/api"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

interface AdminHeaderProps {
  onMenuToggle?: () => void
  isMenuOpen?: boolean
}

export function AdminHeader({ onMenuToggle, isMenuOpen }: AdminHeaderProps) {
  const { user, logout } = useAuthStore()
  const router = useRouter()
  const [alerts, setAlerts] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

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

      {/* Search */}
      <div className="hidden md:flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar productos, clientes..."
            className="pl-10 bg-secondary/50 border-transparent focus:border-primary h-10"
          />
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
