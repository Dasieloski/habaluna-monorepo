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
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Printer, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { printTableOnly } from "@/lib/table-export-print"
import { ExportTableDropdown } from "@/components/admin/export-table-dropdown"

export default function FinancePage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [source, setSource] = useState<string>("supernova")
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
      const response = await api.getAdminPaymentTransactions({ perPage: 100 })
      setTransactions(Array.isArray(response.data) ? response.data : [])
      setSource(response.source || "supernova")
      setStats(response.stats || {
        totalRevenue: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        refundedAmount: 0,
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
    fecha: t.processedAt || t.createdAt,
    orden: t.orderNumber || t.providerReference || '—',
    transaccion: t.providerTransactionId || '—',
    metodo: t.paymentMethodLabel || 'Tarjeta',
    estado: (t.gatewayStatus || t.paymentStatus || 'pending').toUpperCase(),
    monto: Number(t.approvedAmount ?? t.amount ?? 0),
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
          <Button variant="outline" onClick={loadData} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualizar
          </Button>
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
          <CardDescription>
            Datos obtenidos directamente desde {source === "supernova" ? "Supernova" : source}
          </CardDescription>
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
                        {t.processedAt || t.createdAt
                          ? format(new Date(t.processedAt || t.createdAt), "dd MMM HH:mm", { locale: es })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-muted-foreground">
                            {t.providerTransactionId || "-"}
                          </span>
                          <span className="text-sm font-medium">
                            Ord: {t.orderNumber || t.providerReference || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{t.paymentMethodLabel || "Tarjeta"}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            t.gatewayStatus === "approved" || t.gatewayStatus === "success"
                              ? "border-green-500 text-green-600"
                              : t.gatewayStatus === "failed" || t.gatewayStatus === "rejected"
                                ? "border-red-500 text-red-600"
                                : t.gatewayStatus === "refunded" || t.gatewayStatus === "partially_refunded"
                                  ? "border-orange-500 text-orange-600"
                                  : ""
                          }
                        >
                          {(t.gatewayStatus || t.paymentStatus || "pending").toUpperCase()}
                        </Badge>
                        {t.localOrderPaymentStatus && t.localOrderPaymentStatus !== t.paymentStatus ? (
                          <p className="mt-1 text-xs text-amber-600">
                            Local: {t.localOrderPaymentStatus}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(Number(t.approvedAmount ?? t.amount ?? 0))}
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
