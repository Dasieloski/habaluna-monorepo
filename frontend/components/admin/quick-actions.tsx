"use client"

import Link from "next/link"
import { Plus, Package, Percent, Users, FileText, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const actions = [
  { label: "Nuevo producto", href: "/admin/products/new", icon: Plus, color: "from-primary to-accent" },
  { label: "Ver inventario", href: "/admin/products", icon: Package, color: "from-accent-2 to-accent-2/80" },
  { label: "Crear oferta", href: "/admin/offers/new", icon: Percent, color: "from-accent to-accent/80" },
  { label: "Clientes", href: "/admin/customers", icon: Users, color: "from-accent-2 to-accent-2/80" },
  { label: "Reportes", href: "/admin/reports", icon: FileText, color: "from-accent-2 to-accent-2/80" },
  { label: "Ajustes", href: "/admin/settings", icon: Settings, color: "from-accent to-accent/60" },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-all duration-200 hover-lift group"
        >
          <div
            className={cn(
              "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center transition-transform group-hover:scale-110",
              action.color,
            )}
          >
            <action.icon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-medium text-foreground text-center">{action.label}</span>
        </Link>
      ))}
    </div>
  )
}
