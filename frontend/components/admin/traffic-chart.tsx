"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { Loader2 } from "lucide-react"

const colors = ["bg-sky-400", "bg-orange-400", "bg-amber-400", "bg-violet-400", "bg-emerald-400"]

export function TrafficChart() {
  const [trafficSources, setTrafficSources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTraffic = async () => {
      try {
        const data = await api.getDashboardStats()
        setTrafficSources(Array.isArray(data?.trafficSources) ? data.trafficSources : [])
      } catch (error) {
        console.error("Error loading traffic sources:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTraffic()
  }, [])

  const total = trafficSources.reduce((acc, s) => acc + Number(s.visits || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {trafficSources.map((source, index) => (
        <div key={source.source} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground font-medium">{source.source}</span>
            <span className="text-muted-foreground">
              {source.visits.toLocaleString()} ({source.percentage}%)
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all duration-500", colors[index])}
              style={{ width: `${source.percentage}%` }}
            />
          </div>
        </div>
      ))}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total registros</span>
          <span className="text-lg font-bold text-foreground">{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
