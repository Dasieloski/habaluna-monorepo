"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { formatPrice } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Mail, ShoppingCart } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AbandonedCartsPage() {
  const { toast } = useToast()
  const [carts, setCarts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCarts()
  }, [])

  const loadCarts = async () => {
    try {
      setLoading(true)
      const data = await api.getAbandonedCarts()
      setCarts(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading carts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendRecoveryEmail = (email: string) => {
    // Aquí iría la llamada al backend para enviar el email
    // Por ahora solo simulamos
    toast({
      title: "Email enviado",
      description: `Se ha enviado un recordatorio a ${email}`,
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Carritos Abandonados</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Oportunidades de Recuperación</CardTitle>
          <CardDescription>
            Usuarios con productos en el carrito que no han finalizado la compra en la última hora.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead>Total Potencial</TableHead>
                  <TableHead>Abandonado hace</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Buscando carritos...
                    </TableCell>
                  </TableRow>
                ) : carts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No hay carritos abandonados recientes
                    </TableCell>
                  </TableRow>
                ) : (
                  carts.map((cart, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{cart.user?.firstName || "Usuario"} {cart.user?.lastName}</span>
                          <span className="text-xs text-muted-foreground">{cart.user?.email}</span>
                          {cart.user?.phone && <span className="text-xs text-muted-foreground">{cart.user.phone}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {cart.items.slice(0, 3).map((item: any, i: number) => (
                            <span key={i} className="text-sm">
                              {item.quantity}x {item.productName} {item.variantName ? `(${item.variantName})` : ""}
                            </span>
                          ))}
                          {cart.items.length > 3 && (
                            <span className="text-xs text-muted-foreground italic">
                              +{cart.items.length - 3} más...
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {formatPrice(cart.totalPotentialUSD)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(new Date(cart.lastUpdatedAt), { addSuffix: true, locale: es })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSendRecoveryEmail(cart.user?.email)}
                          disabled={!cart.user?.email}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Recuperar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
