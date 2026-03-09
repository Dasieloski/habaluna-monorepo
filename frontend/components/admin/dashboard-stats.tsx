"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { formatPrice } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface DashboardStatsProps {
  isLoaded: boolean
}

export function DashboardStats({ isLoaded }: DashboardStatsProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Error loading dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-center h-24">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statsData = [
    { 
      label: "Ventas totales", 
      value: formatPrice(stats.overview?.totalRevenue || 0), 
      change: "+0%", 
      trend: "up" as const, 
      icon: DollarSign, 
      color: "bg-primary" 
    },
    { 
      label: "Pedidos", 
      value: (stats.overview?.totalOrders || 0).toLocaleString(), 
      change: "+0%", 
      trend: "up" as const, 
      icon: ShoppingCart, 
      color: "bg-accent" 
    },
    { 
      label: "Clientes", 
      value: (stats.overview?.totalUsers || 0).toLocaleString(), 
      change: "+0%", 
      trend: "up" as const, 
      icon: Users, 
      color: "bg-accent" 
    },
    { 
      label: "Productos activos", 
      value: (stats.overview?.totalProducts || 0).toLocaleString(), 
      change: "+0%", 
      trend: "up" as const, 
      icon: Package, 
      color: "bg-accent" 
    },
  ]
  const financialSource = stats.overview?.financialSource || "supernova"

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Ingresos y transacciones sincronizados desde {financialSource}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card
            key={stat.label}
            className={cn(
              "border-0 shadow-md overflow-hidden transition-all duration-500 hover-lift",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
            )}
            style={{ transitionDelay: `${100 + index * 100}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <div className="flex items-center gap-1.5">
                    {stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-primary" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                    <span className={cn("text-sm font-medium", stat.trend === "up" ? "text-primary" : "text-destructive")}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs mes anterior</span>
                  </div>
                </div>
                <div
                  className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.color)}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
