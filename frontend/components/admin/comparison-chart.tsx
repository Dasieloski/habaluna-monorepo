"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { api } from "@/lib/api"
import { Loader2 } from "lucide-react"

const COLORS = { thisYear: "#0ea5e9", lastYear: "#cbd5e1" }

export function ComparisonChart() {
  const [data, setData] = useState<{ month: string; thisYear: number; lastYear: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const stats = await api.getDashboardStats()
        const comparison = stats.monthlyComparison
        if (Array.isArray(comparison) && comparison.length > 0) {
          setData(comparison)
        } else {
          setData([])
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
        No hay datos de comparativa anual aún
      </div>
    )
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
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
            formatter={(value: number) => [`$${Number(value).toLocaleString()}`, ""]}
          />
          <Legend formatter={(value) => <span className="text-sm text-foreground">{value}</span>} />
          <Bar dataKey="lastYear" name="Año anterior" fill={COLORS.lastYear} radius={[4, 4, 0, 0]} />
          <Bar dataKey="thisYear" name="Este año" fill={COLORS.thisYear} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
