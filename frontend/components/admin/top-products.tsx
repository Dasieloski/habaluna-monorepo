"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { formatPrice } from "@/lib/utils"
import { Loader2 } from "lucide-react"

export function TopProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTopProducts = async () => {
      try {
        const data = await api.getDashboardStats()
        setProducts(data.topProducts || [])
      } catch (error) {
        console.error("Error loading top products:", error)
      } finally {
        setLoading(false)
      }
    }
    loadTopProducts()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No hay productos vendidos aún
      </div>
    )
  }

  const maxSales = Math.max(...products.map((p) => p.sales))

  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div key={product.name || index} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground">
                {product.rank || index + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-foreground line-clamp-1">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.sales} ventas</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground">{formatPrice(product.revenue)}</p>
            </div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${(product.sales / maxSales) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
