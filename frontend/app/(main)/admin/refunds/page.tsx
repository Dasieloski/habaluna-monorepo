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
import { Badge } from "@/components/ui/badge"
import { Undo2, Printer } from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { printTableOnly } from "@/lib/table-export-print"
import { ExportTableDropdown } from "@/components/admin/export-table-dropdown"
import { Button } from "@/components/ui/button"

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRefunds()
  }, [])

  const loadRefunds = async () => {
    try {
      setLoading(true)
      const response = await api.getRefunds()
      setRefunds(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const refundsColumns = [
    { key: "fecha", label: "Fecha", format: (v: unknown) => (v ? format(new Date(v as string), "dd/MM/yyyy HH:mm", { locale: es }) : "—") },
    { key: "orden", label: "Orden" },
    { key: "cliente", label: "Cliente" },
    { key: "monto", label: "Monto (USD)", format: (v: unknown) => (v != null ? formatPrice(Number(v)) : "—") },
    { key: "metodo", label: "Método" },
    { key: "estado", label: "Estado" },
  ]
  const refundsTableData = refunds.map((r) => ({
    fecha: r.createdAt,
    orden: r.order?.orderNumber || "—",
    cliente: r.returnRequest?.user?.email || "—",
    monto: r.amount,
    metodo: r.method,
    estado: r.status,
  }))

  const handleExportRefunds = () => {
    exportTableToCSV({
      filename: `reembolsos-${format(new Date(), "yyyy-MM-dd")}.csv`,
      columns: refundsColumns,
      data: refundsTableData,
    })
  }
  const handlePrintRefunds = () => {
    printTableOnly({
      title: "Reembolsos — Historial",
      columns: refundsColumns,
      data: refundsTableData,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Undo2 className="h-8 w-8 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Reembolsos</h1>
        </div>
        <div className="flex gap-2">
          <ExportTableDropdown
            title="Reembolsos — Historial"
            filename={`reembolsos-${format(new Date(), "yyyy-MM-dd")}`}
            columns={refundsColumns}
            data={refundsTableData}
          />
          <Button variant="outline" onClick={handlePrintRefunds}>
            <Printer className="w-4 h-4 mr-2" /> Imprimir tabla
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Historial de Reembolsos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell></TableRow>
                ) : refunds.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">No hay reembolsos registrados</TableCell></TableRow>
                ) : (
                  refunds.map((refund) => (
                    <TableRow key={refund.id}>
                      <TableCell>{format(new Date(refund.createdAt), "dd MMM HH:mm", { locale: es })}</TableCell>
                      <TableCell className="font-mono">{refund.order?.orderNumber}</TableCell>
                      <TableCell>{refund.returnRequest?.user?.email || "-"}</TableCell>
                      <TableCell className="font-medium text-red-600">-{formatPrice(refund.amount)}</TableCell>
                      <TableCell className="capitalize">{refund.method}</TableCell>
                      <TableCell>
                        <Badge variant={refund.status === 'PROCESSED' ? 'default' : 'secondary'}>
                          {refund.status}
                        </Badge>
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
