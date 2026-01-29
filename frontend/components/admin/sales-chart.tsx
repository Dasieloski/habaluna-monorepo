"use client"

import { useState, useEffect } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Bar,
} from "recharts"
import { salesDataDaily } from "@/lib/mock-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { api } from "@/lib/api"
import { Loader2 } from "lucide-react"

export function SalesChart() {
  const [salesData, setSalesData] = useState(salesDataDaily)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSalesData = async () => {
      try {
        const data = await api.getDashboardStats()
        // Usar datos reales si están disponibles, sino mock data
        if (data.salesByMonth && data.salesByMonth.length > 0) {
          // Convertir datos mensuales a formato diario aproximado
          const dailyData = data.salesByMonth.map((item: any) => ({
            date: item.month,
            sales: Math.round(item.revenue),
            orders: 0, // Se puede calcular si hay datos
            visitors: 0,
          }))
          setSalesData(dailyData.length > 0 ? dailyData : salesDataDaily)
        }
      } catch (error) {
        console.error("Error loading sales data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadSalesData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="combined">Combinado</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesDataDaily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7dd3fc" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7dd3fc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value) => `€${value}`}
                  tickMargin={10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
                    padding: "12px 16px",
                  }}
                  labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                  formatter={(value: number) => [`€${value.toLocaleString()}`, "Ventas"]}
                />
                <Area type="monotone" dataKey="sales" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#salesGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesDataDaily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickMargin={10} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
                    padding: "12px 16px",
                  }}
                  labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                  formatter={(value: number) => [value, "Pedidos"]}
                />
                <Area type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2.5} fill="url(#ordersGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="combined">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={salesDataDaily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickFormatter={(value) => `€${value}`}
                  tickMargin={10}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickMargin={10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.15)",
                    padding: "12px 16px",
                  }}
                  labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                />
                <Bar yAxisId="right" dataKey="visitors" fill="#e2e8f0" radius={[4, 4, 0, 0]} name="Visitantes" />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sales"
                  stroke="#0ea5e9"
                  strokeWidth={2.5}
                  dot={false}
                  name="Ventas (€)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={false}
                  name="Pedidos"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
