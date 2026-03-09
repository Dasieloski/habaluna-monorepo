"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, ShoppingBag, Target, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { Loader2 } from "lucide-react"

interface PerformanceMetricsProps {
  isLoaded: boolean
}

export function PerformanceMetrics({ isLoaded }: PerformanceMetricsProps) {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.getDashboardStats()
        setStats(data?.performance || null)
      } catch (error) {
        console.error("Error loading performance metrics:", error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-0 shadow-md">
            <CardContent className="p-4 flex items-center justify-center min-h-[96px]">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const metrics = [
    {
      label: "Valor medio pedido",
      value: `$${Number(stats?.avgOrderValue || 0).toFixed(2)}`,
      change: `${Number(stats?.avgOrderValueChange || 0) >= 0 ? "+" : ""}${Number(stats?.avgOrderValueChange || 0).toFixed(1)}%`,
      icon: ShoppingBag,
      color: "bg-primary",
    },
    {
      label: "Tasa de conversión",
      value: `${Number(stats?.conversionRate || 0).toFixed(1)}%`,
      change: `${Number(stats?.conversionRateChange || 0) >= 0 ? "+" : ""}${Number(stats?.conversionRateChange || 0).toFixed(1)}%`,
      icon: Target,
      color: "bg-primary",
    },
    {
      label: "Clientes nuevos",
      value: String(stats?.newCustomers || 0),
      change: `${Number(stats?.newCustomersChange || 0) >= 0 ? "+" : ""}${stats?.newCustomersChange || 0}`,
      icon: UserPlus,
      color: "bg-accent",
    },
    {
      label: "Clientes recurrentes",
      value: String(stats?.returningCustomers || 0),
      change: `${Number(stats?.returningCustomersChange || 0) >= 0 ? "+" : ""}${Number(stats?.returningCustomersChange || 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: "bg-accent",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <Card
          key={metric.label}
          className={cn(
            "border-0 shadow-md transition-all duration-500",
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          )}
          style={{ transitionDelay: `${200 + index * 50}ms` }}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div
                className={cn("w-10 h-10 rounded-xl flex items-center justify-center", metric.color)}
              >
                <metric.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{metric.value}</p>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">{metric.label}</span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-primary font-medium">{metric.change} esta semana</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
