"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Save, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function InventoryPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [changes, setChanges] = useState<Record<string, number>>({})

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      // Cargar suficientes productos para que sea útil el bulk edit
      const response = await api.getAdminProducts({ limit: 100 })
      setProducts(response.data || [])
      setChanges({}) // Reset changes
    } catch (error) {
      console.error("Error loading products:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStockChange = (key: string, value: string) => {
    const numValue = parseInt(value)
    if (isNaN(numValue) || numValue < 0) return
    setChanges(prev => ({ ...prev, [key]: numValue }))
  }

  const handleSave = async () => {
    if (Object.keys(changes).length === 0) return

    try {
      setSaving(true)
      const items = Object.entries(changes).map(([key, stock]) => {
        // key format: "prod_ID" or "var_ID"
        // But I need to know if it is variant or product.
        // Let's change key format to "p_PRODUCTID" or "v_VARIANTID"
        const isVariant = key.startsWith("v_")
        const id = key.substring(2)
        
        if (isVariant) {
          // Find productId for this variant (inefficient but safe)
          // Actually bulkUpdateDto expects productId as required? 
          // Let's check DTO. DTO has productId required, variantId optional.
          // So I need to find the parent product ID.
          
          let parentId = ""
          for (const p of products) {
            if (p.variants?.some((v: any) => v.id === id)) {
              parentId = p.id
              break
            }
          }
          
          return {
            productId: parentId,
            variantId: id,
            stock
          }
        } else {
          return {
            productId: id,
            stock
          }
        }
      }).filter(item => item.productId) // Ensure we found parent

      await api.bulkStockUpdate(items)

      toast({
        title: "Inventario actualizado",
        description: `Se actualizaron ${items.length} items.`,
      })
      
      // Reload to confirm
      loadProducts()
    } catch (error) {
      console.error("Error saving inventory:", error)
      toast({
        title: "Error",
        description: "Hubo un problema al guardar los cambios",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const filteredProducts = products.filter(p => 
    search === "" || 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku?.toLowerCase().includes(search.toLowerCase())
  )

  // Flatten list to show variants as rows if needed, or just nested
  // Nested rows might be better visually.

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Control de Stock</h1>
        <Button onClick={handleSave} disabled={Object.keys(changes).length === 0 || saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventario Centralizado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            {Object.keys(changes).length > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {Object.keys(changes).length} cambios sin guardar
              </Badge>
            )}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Producto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[150px]">Stock Actual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Cargando inventario...
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const hasVariants = product.variants && product.variants.length > 0
                    
                    if (hasVariants) {
                      return product.variants.map((variant: any) => (
                        <TableRow key={variant.id}>
                          <TableCell>
                            <div className="flex flex-col pl-4 border-l-2 border-muted ml-2">
                              <span className="font-medium text-sm">{product.name}</span>
                              <span className="text-xs text-muted-foreground">{variant.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">{variant.sku || product.sku || "-"}</TableCell>
                          <TableCell>
                            {!variant.isActive ? (
                              <Badge variant="outline" className="text-muted-foreground">Inactivo</Badge>
                            ) : variant.stock <= 5 ? (
                              <Badge variant="destructive">Bajo Stock</Badge>
                            ) : (
                              <Badge variant="secondary">Normal</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={changes[`v_${variant.id}`] !== undefined ? changes[`v_${variant.id}`] : variant.stock}
                              onChange={(e) => handleStockChange(`v_${variant.id}`, e.target.value)}
                              className={changes[`v_${variant.id}`] !== undefined ? "border-yellow-500 bg-yellow-50" : ""}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    }

                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-xs">{product.sku || "-"}</TableCell>
                        <TableCell>
                            {!product.isActive ? (
                              <Badge variant="outline" className="text-muted-foreground">Inactivo</Badge>
                            ) : product.stock <= 5 ? (
                              <Badge variant="destructive">Bajo Stock</Badge>
                            ) : (
                              <Badge variant="secondary">Normal</Badge>
                            )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            value={changes[`p_${product.id}`] !== undefined ? changes[`p_${product.id}`] : product.stock}
                            onChange={(e) => handleStockChange(`p_${product.id}`, e.target.value)}
                            className={changes[`p_${product.id}`] !== undefined ? "border-yellow-500 bg-yellow-50" : ""}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
