"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign, Package } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const data = await api.getDashboardStats()
      setStats(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Cargando reportes...</div>
  if (!stats) return <div className="p-8 text-center">No hay datos disponibles</div>

  // Transformar datos para gráficos
  const salesData = stats.salesByMonth?.map((item: any) => ({
    name: item.month,
    total: item.revenue
  })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-8 w-8 text-muted-foreground" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes y Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Ingresos sincronizados desde {stats.overview?.financialSource || "supernova"}
          </p>
        </div>
      </div>
      
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.overview?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">Ventas históricas según la pasarela</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Total de pedidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Usuarios registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">En catálogo</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
            <CardDescription>Ingresos de los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value: number) => formatPrice(value)}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar dataKey="total" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventario Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Inventario</CardTitle>
            <CardDescription>Estado actual del stock</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Stock Bajo</span>
              <Badge variant="outline" className="text-orange-600 bg-orange-50">{stats.inventory?.lowStockCount || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Agotados</span>
              <Badge variant="outline" className="text-red-600 bg-red-50">{stats.inventory?.outOfStockCount || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Unidades</span>
              <span className="font-bold">{stats.inventory?.totalStockUnits || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
