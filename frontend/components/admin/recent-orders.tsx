"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { formatPrice } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Loader2 } from "lucide-react"

const statusConfig: Record<string, { label: string; className: string }> = {
  COMPLETED: { label: "Completado", className: "bg-green-100 text-green-700 border-green-200" },
  PROCESSING: { label: "Procesando", className: "bg-blue-100 text-blue-700 border-blue-200" },
  PENDING: { label: "Pendiente", className: "bg-amber-100 text-amber-700 border-amber-200" },
  SHIPPED: { label: "Enviado", className: "bg-purple-100 text-purple-700 border-purple-200" },
  DELIVERED: { label: "Entregado", className: "bg-green-100 text-green-700 border-green-200" },
}

export function RecentOrders() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await api.getDashboardStats()
        setOrders(data.recentOrders || [])
      } catch (error) {
        console.error("Error loading recent orders:", error)
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay pedidos recientes
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {orders.slice(0, 5).map((order, index) => {
        const statusInfo = statusConfig[order.status] || { label: order.status, className: "bg-gray-100 text-gray-700 border-gray-200" }
        return (
          <div
            key={order.id}
            className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center">
                <span className="text-xs font-bold text-primary">{order.orderNumber?.slice(-3) || order.id.slice(-3)}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{order.customer || "Cliente"}</p>
                <p className="text-xs text-muted-foreground">Pedido #{order.orderNumber || order.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{formatPrice(Number(order.total) || 0)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true, locale: es })}
                </p>
              </div>
              <Badge
                variant="outline"
                className={cn("text-[10px] font-medium", statusInfo.className)}
              >
                {statusInfo.label}
              </Badge>
            </div>
          </div>
        )
      })}
    </div>
  )
}
