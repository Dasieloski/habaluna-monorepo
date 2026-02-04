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
import { Badge } from "@/components/ui/badge"D
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { printTableOnly } from "@/lib/table-export-print"
import { ExportTableDropdown } from "@/components/admin/export-table-dropdown"

export default function FinancePage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    refundedAmount: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const orders = await api.getAdminOrders()
      // Filtrar órdenes que tienen intentos de pago o son relevantes financieramente
      const relevantOrders = Array.isArray(orders) ? orders.filter((o: any) => o.paymentStatus !== "PENDING" || o.paymentIntentId) : []
      
      setTransactions(relevantOrders)

      // Calcular stats
      const totalRevenue = relevantOrders
        .filter((o: any) => o.paymentStatus === "PAID")
        .reduce((sum: number, o: any) => sum + Number(o.total), 0)

      const successfulTransactions = relevantOrders.filter((o: any) => o.paymentStatus === "PAID").length
      const failedTransactions = relevantOrders.filter((o: any) => o.paymentStatus === "FAILED").length
      const refundedAmount = relevantOrders
        .filter((o: any) => o.paymentStatus === "REFUNDED")
        .reduce((sum: number, o: any) => sum + Number(o.total), 0)

      setStats({
        totalRevenue,
        successfulTransactions,
        failedTransactions,
        refundedAmount
      })

    } catch (error) {
      console.error("Error loading finance data:", error)
    } finally {
      setLoading(false)
    }
  }

  const financeColumns = [
    { key: 'fecha', label: 'Fecha', format: (v: unknown) => (v ? format(new Date(v as string), "dd/MM/yyyy HH:mm", { locale: es }) : '—') },
    { key: 'orden', label: 'Nº Orden' },
    { key: 'transaccion', label: 'ID Transacción' },
    { key: 'metodo', label: 'Método' },
    { key: 'estado', label: 'Estado' },
    { key: 'monto', label: 'Monto (USD)', format: (v: unknown) => (v != null ? formatPrice(Number(v)) : '—') },
  ] as const

  const tableData = transactions.map((t) => ({
    fecha: t.createdAt,
    orden: t.orderNumber || t.id?.slice(0, 8) || '—',
    transaccion: t.paymentIntentId || '—',
    metodo: 'Tarjeta',
    estado: t.paymentStatus,
    monto: t.total,
  }))

  const handlePrint = () => {
    printTableOnly({
      title: 'Finanzas — Historial de Transacciones',
      columns: financeColumns,
      data: tableData,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Finanzas y Transacciones</h1>
        <div className="flex gap-2">
          <ExportTableDropdown
            title="Finanzas — Historial de Transacciones"
            filename={`finanzas-${format(new Date(), "yyyy-MM-dd")}`}
            columns={[...financeColumns]}
            data={tableData}
          />
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Imprimir tabla
          </Button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatPrice(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Volumen bruto procesado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones Exitosas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successfulTransactions}</div>
            <p className="text-xs text-muted-foreground">Pagos completados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagos Fallidos</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failedTransactions}</div>
            <p className="text-xs text-muted-foreground">Intentos rechazados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reembolsos</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatPrice(stats.refundedAmount)}</div>
            <p className="text-xs text-muted-foreground">Total devuelto</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Transacciones</CardTitle>
          <CardDescription>Registro de pagos asociados a órdenes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>ID Transacción / Orden</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Cargando transacciones...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No hay transacciones registradas
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>
                        {format(new Date(t.createdAt), "dd MMM HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-muted-foreground">
                            {t.paymentIntentId || "-"}
                          </span>
                          <span className="text-sm font-medium">
                            Ord: {t.orderNumber || t.id.slice(0, 8)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>Stripe/Card</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            t.paymentStatus === "PAID" ? "border-green-500 text-green-600" :
                            t.paymentStatus === "FAILED" ? "border-red-500 text-red-600" :
                            t.paymentStatus === "REFUNDED" ? "border-orange-500 text-orange-600" :
                            ""
                          }
                        >
                          {t.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(t.total)}
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
