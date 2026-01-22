"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  Boxes,
  FolderTree,
  Users,
  Percent,
  MessageSquare,
  Mail,
  Settings,
  Images,
  ChevronLeft,
  ChevronRight,
  Store,
  X,
  Truck,
  ShoppingCart,
  ShieldCheck,
  CreditCard,
  ClipboardList,
  RotateCcw,
  Receipt,
  Bell,
  FileText,
  History,
  BarChart3,
  Undo2
} from "lucide-react"
import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

// Definición de la estructura del menú
const menuGroups = [
  {
    id: "general",
    title: "General",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/reports", label: "Reportes", icon: BarChart3 },
      { href: "/admin/alerts", label: "Alertas", icon: Bell },
    ]
  },
  {
    id: "operation",
    title: "Operación",
    items: [
      { href: "/admin/orders", label: "Pedidos", icon: ClipboardList },
      { href: "/admin/returns", label: "Devoluciones", icon: RotateCcw },
      { href: "/admin/refunds", label: "Reembolsos", icon: Undo2 },
      { href: "/admin/carts", label: "Carritos", icon: ShoppingCart },
      { href: "/admin/transport", label: "Transporte", icon: Truck },
    ]
  },
  {
    id: "catalog",
    title: "Catálogo",
    items: [
      { href: "/admin/products", label: "Productos", icon: Package },
      { href: "/admin/combos", label: "Combos", icon: Boxes },
      { href: "/admin/categories", label: "Categorías", icon: FolderTree },
      { href: "/admin/offers", label: "Ofertas", icon: Percent },
      { href: "/admin/inventory", label: "Inventario", icon: Boxes },
      { href: "/admin/banners", label: "Carrusel", icon: Images },
    ]
  },
  {
    id: "customers",
    title: "Clientes",
    items: [
      { href: "/admin/customers", label: "Clientes", icon: Users },
      { href: "/admin/reviews", label: "Reseñas", icon: MessageSquare },
      { href: "/admin/email-marketing", label: "Email Marketing", icon: Mail },
    ]
  },
  {
    id: "finance",
    title: "Finanzas",
    items: [
      { href: "/admin/finance", label: "Finanzas", icon: CreditCard },
      { href: "/admin/audit", label: "Auditoría", icon: ShieldCheck },
    ]
  },
  {
    id: "system",
    title: "Sistema",
    items: [
      { href: "/admin/roles", label: "Roles y Permisos", icon: Users },
      { href: "/admin/content", label: "Contenido (CMS)", icon: FileText },
      { href: "/admin/settings", label: "Configuración", icon: Settings },
      { href: "/admin/history", label: "Historial", icon: History },
    ]
  }
]

interface AdminSidebarProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
  isCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function AdminSidebar({
  isMobileOpen = false,
  onMobileClose,
  isCollapsed: controlledIsCollapsed,
  onCollapsedChange,
}: AdminSidebarProps) {
  const pathname = usePathname()
  const [uncontrolledIsCollapsed, setUncontrolledIsCollapsed] = useState(false)
  const prevPathnameRef = useRef<string | null>(null)
  const isCollapsed = controlledIsCollapsed ?? uncontrolledIsCollapsed

  // Determinar qué grupos deben estar abiertos por defecto basado en la ruta actual
  const getDefaultValue = () => {
    const activeGroup = menuGroups.find(group => 
      group.items.some(item => pathname === item.href || pathname.startsWith(item.href + "/"))
    )
    return activeGroup ? [activeGroup.id] : ["general"]
  }

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      if (isMobileOpen && onMobileClose) {
        onMobileClose()
      }
    }
    prevPathnameRef.current = pathname
  }, [pathname, isMobileOpen, onMobileClose])

  // Componente de enlace reutilizable
  const NavItem = ({ item, isCollapsed }: { item: any, isCollapsed: boolean }) => {
    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
    
    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-all duration-200 text-sm mb-1",
          isActive
            ? "bg-accent text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground",
          isCollapsed && "justify-center px-2 py-3"
        )}
        title={isCollapsed ? item.label : undefined}
      >
        <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive && "text-primary-foreground", isCollapsed && "w-5 h-5")} />
        {!isCollapsed && <span>{item.label}</span>}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onMobileClose?.()
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-card border-r border-border flex flex-col",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:transition-none",
          isCollapsed ? "lg:w-20" : "lg:w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "w-72"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {(!isCollapsed || isMobileOpen) && (
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-md">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-logo text-xl font-bold text-foreground tracking-tight">Habaluna</span>
            </Link>
          )}
          {isCollapsed && !isMobileOpen && (
            <div className="w-10 h-10 mx-auto bg-primary rounded-xl flex items-center justify-center shadow-md">
              <Store className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
          {isMobileOpen && onMobileClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onMobileClose()
              }}
              className="lg:hidden ml-auto h-8 w-8"
              type="button"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          {isCollapsed && !isMobileOpen ? (
            // Vista colapsada (iconos planos)
            <div className="space-y-4">
              {menuGroups.map((group) => (
                <div key={group.id} className="space-y-1 pb-2 border-b border-border/50 last:border-0">
                  {group.items.map((item) => (
                    <NavItem key={item.href} item={item} isCollapsed={true} />
                  ))}
                </div>
              ))}
            </div>
          ) : (
            // Vista expandida (Acordeón)
            <Accordion type="multiple" defaultValue={getDefaultValue()} className="w-full space-y-2">
              {menuGroups.map((group) => (
                <AccordionItem key={group.id} value={group.id} className="border-none">
                  <AccordionTrigger className="py-2 px-3 hover:bg-secondary/50 rounded-md text-sm font-semibold text-foreground/80 hover:no-underline">
                    {group.title}
                  </AccordionTrigger>
                  <AccordionContent className="pb-2 pt-1 pl-1">
                    {group.items.map((item) => (
                      <NavItem key={item.href} item={item} isCollapsed={false} />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {/* Collapse button - Solo en desktop */}
        <div className="p-3 border-t border-border hidden lg:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const next = !isCollapsed
              if (onCollapsedChange) onCollapsedChange(next)
              else setUncontrolledIsCollapsed(next)
            }}
            className={cn(
              "w-full justify-center text-muted-foreground hover:text-foreground",
              !isCollapsed && "justify-start",
            )}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!isCollapsed && <span className="ml-2 text-sm">Colapsar menú</span>}
          </Button>
        </div>
      </aside>
    </>
  )
}
