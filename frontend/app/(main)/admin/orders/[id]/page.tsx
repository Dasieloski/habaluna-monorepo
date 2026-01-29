"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Truck, CreditCard, User, MapPin, Calendar, Mail, Printer } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { printTableOnly } from "@/lib/table-export-print"
import { ExportTableDropdown } from "@/components/admin/export-table-dropdown"

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (id) loadOrder()
  }, [id])

  const loadOrder = async () => {
    try {
      setLoading(true)
      const orders = await api.getAdminOrders()
      const found = orders.find((o: any) => o.id === id)
      if (found) {
        setOrder(found)
      } else {
        toast({
          title: "Error",
          description: "Pedido no encontrado",
          variant: "destructive",
        })
        router.push("/admin/orders")
      }
    } catch (error) {
      console.error("Error loading order:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true)
      await api.updateOrderStatus(order.id, newStatus)
      
      toast({
        title: "Estado actualizado",
        description: `El pedido ahora está ${newStatus}`,
      })
      
      // Recargar para ver cambios
      loadOrder()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handlePaymentStatusChange = async (newStatus: string) => {
    try {
      setUpdating(true)
      await api.updateOrderStatus(order.id, order.status, newStatus)
      
      toast({
        title: "Estado de pago actualizado",
        description: `El pago ahora está ${newStatus}`,
      })
      
      loadOrder()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el pago",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="p-8 text-center">Cargando pedido...</div>
  if (!order) return <div className="p-8 text-center">Pedido no encontrado</div>

  const orderItemsColumns = [
    { key: "producto", label: "Producto" },
    { key: "variante", label: "Variante" },
    { key: "cantidad", label: "Cantidad" },
    { key: "precioUnit", label: "Precio unit. (USD)", format: (v: unknown) => (v != null ? formatPrice(Number(v)) : "—") },
    { key: "subtotal", label: "Subtotal (USD)", format: (v: unknown) => (v != null ? formatPrice(Number(v)) : "—") },
  ]
  const orderItemsData = (order.items || []).map((item: any) => ({
    producto: item.product?.name ?? item.productName ?? "—",
    variante: item.variantName ?? "—",
    cantidad: item.quantity,
    precioUnit: item.price,
    subtotal: item.price * item.quantity,
  }))

  const handlePrintOrder = () => {
    printTableOnly({
      title: `Pedido #${order.orderNumber || order.id.slice(0, 8)} — ${format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}`,
      columns: orderItemsColumns,
      data: orderItemsData,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Pedido #{order.orderNumber || order.id.slice(0, 8)}
          </h1>
          <p className="text-muted-foreground">
            Realizado el {format(new Date(order.createdAt), "PPP 'a las' p", { locale: es })}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <ExportTableDropdown
            title={`Pedido #${order.orderNumber || order.id.slice(0, 8)}`}
            filename={`pedido-${order.orderNumber || order.id}-${format(new Date(), "yyyy-MM-dd")}`}
            columns={orderItemsColumns}
            data={orderItemsData}
          />
          <Button variant="outline" onClick={handlePrintOrder}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir tabla
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna Principal: Detalles del Pedido */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Items del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex gap-4">
                      {/* Placeholder de imagen si no hay */}
                      <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center text-muted-foreground">
                         IMG
                      </div>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        {item.variantName && (
                          <p className="text-sm text-muted-foreground">Variante: {item.variantName}</p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} x {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-1.5 text-right">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span>{formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de Actividad</CardTitle>
              <CardDescription>Registro de cambios en el pedido</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                <p>• {format(new Date(order.createdAt), "PPP p", { locale: es })} - Pedido creado</p>
                {order.updatedAt !== order.createdAt && (
                  <p>• {format(new Date(order.updatedAt), "PPP p", { locale: es })} - Última actualización</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna Lateral: Info Cliente y Acciones */}
        <div className="space-y-6">
          {/* Acciones de Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado del Pedido</label>
                <Select 
                  value={order.status} 
                  onValueChange={handleStatusChange}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="PROCESSING">Procesando</SelectItem>
                    <SelectItem value="SHIPPED">Enviado</SelectItem>
                    <SelectItem value="DELIVERED">Entregado</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                    <SelectItem value="COMPLETED">Completado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Estado del Pago</label>
                <Select 
                  value={order.paymentStatus} 
                  onValueChange={handlePaymentStatusChange}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="PAID">Pagado</SelectItem>
                    <SelectItem value="FAILED">Fallido</SelectItem>
                    <SelectItem value="REFUNDED">Reembolsado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Info Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{order.user.firstName} {order.user.lastName}</p>
                  <p className="text-sm text-muted-foreground">{order.user.email}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>Dirección de Envío</span>
                </div>
                <div className="text-sm text-muted-foreground pl-6">
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="mt-1">Tel: {order.shippingAddress.phone}</p>
                </div>
              </div>

              {order.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="font-medium">Notas del Cliente</p>
                    <p className="text-sm text-muted-foreground italic">"{order.notes}"</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
