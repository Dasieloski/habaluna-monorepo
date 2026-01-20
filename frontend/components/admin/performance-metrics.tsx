"use client"

import { Card, CardContent } from "@/components/ui/card"
import { weeklyStats } from "@/lib/mock-data"
import { TrendingUp, ShoppingBag, Target, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"

const metrics = [
  { label: "Valor medio pedido", value: `€${weeklyStats.avgOrderValue.toFixed(2)}`, change: "+5.2%", icon: ShoppingBag, color: "bg-primary" },
  { label: "Tasa de conversión", value: `${weeklyStats.conversionRate}%`, change: "+0.3%", icon: Target, color: "bg-primary" },
  { label: "Clientes nuevos", value: weeklyStats.newCustomers.toString(), change: "+12", icon: UserPlus, color: "bg-accent" },
  { label: "Clientes recurrentes", value: weeklyStats.returningCustomers.toString(), change: "+8.4%", icon: TrendingUp, color: "bg-accent" },
]

interface PerformanceMetricsProps {
  isLoaded: boolean
}

export function PerformanceMetrics({ isLoaded }: PerformanceMetricsProps) {
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
