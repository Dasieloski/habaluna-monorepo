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
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Check, X, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReturnsPage() {
  const { toast } = useToast()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [refundAmount, setRefundAmount] = useState("")
  const [refundMethod, setRefundMethod] = useState("balance")

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const response = await api.getReturnRequests()
      setRequests(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error("Error loading returns:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.updateReturnStatus(id, status)
      toast({ title: "Estado actualizado" })
      loadRequests()
    } catch (error) {
      toast({ title: "Error al actualizar", variant: "destructive" })
    }
  }

  const handleRefund = async () => {
    if (!selectedRequest || !refundAmount) return
    try {
      await api.processRefund(selectedRequest.id, {
        amount: Number(refundAmount),
        method: refundMethod,
        reason: "Reembolso por devolución aprobada"
      })
      toast({ title: "Reembolso procesado exitosamente" })
      setSelectedRequest(null)
      loadRequests()
    } catch (error) {
      toast({ title: "Error al procesar reembolso", variant: "destructive" })
    }
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      REQUESTED: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-blue-100 text-blue-800",
      REJECTED: "bg-red-100 text-red-800",
      REFUNDED: "bg-green-100 text-green-800",
    }
    return <Badge variant="outline" className={map[status] || ""}>{status}</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <RotateCcw className="h-8 w-8 text-muted-foreground" />
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Devoluciones</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Monto Solicitado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">Cargando...</TableCell></TableRow>
                ) : requests.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">No hay solicitudes</TableCell></TableRow>
                ) : (
                  requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{format(new Date(req.createdAt), "dd MMM", { locale: es })}</TableCell>
                      <TableCell className="font-mono">{req.order?.orderNumber}</TableCell>
                      <TableCell>{req.user?.firstName} {req.user?.lastName}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={req.reason}>{req.reason}</TableCell>
                      <TableCell>{req.refundAmount ? formatPrice(req.refundAmount) : "-"}</TableCell>
                      <TableCell>{getStatusBadge(req.status)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {req.status === 'REQUESTED' && (
                          <>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleStatusUpdate(req.id, 'APPROVED')}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleStatusUpdate(req.id, 'REJECTED')}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {req.status === 'APPROVED' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" onClick={() => {
                                setSelectedRequest(req)
                                setRefundAmount(req.refundAmount || "0")
                              }}>
                                Reembolsar
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Procesar Reembolso</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Monto a reembolsar</Label>
                                  <Input 
                                    type="number" 
                                    value={refundAmount} 
                                    onChange={(e) => setRefundAmount(e.target.value)} 
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Método</Label>
                                  <Select value={refundMethod} onValueChange={setRefundMethod}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="balance">Saldo en cuenta</SelectItem>
                                      <SelectItem value="original_payment">Método original</SelectItem>
                                      <SelectItem value="cash">Efectivo</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button onClick={handleRefund}>Confirmar</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
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
