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
import { Bell, CheckCircle, Eye, Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow, format } from "date-fns"
import { es } from "date-fns/locale"
import { exportTableToCSV, printTableOnly } from "@/lib/table-export-print"

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAlerts()
  }, [])

  const loadAlerts = async () => {
    try {
      setLoading(true)
      const response = await api.getAlerts()
      setAlerts(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const markResolved = async (id: string) => {
    await api.markAlertResolved(id)
    loadAlerts()
  }

  const getSeverityColor = (type: string) => {
    if (type.includes("ERROR") || type.includes("OUT")) return "text-red-600 bg-red-50 border-red-200"
    if (type.includes("LOW") || type.includes("STUCK")) return "text-orange-600 bg-orange-50 border-orange-200"
    return "text-blue-600 bg-blue-50 border-blue-200"
  }

  const alertsColumns = [
    { key: "tipo", label: "Tipo" },
    { key: "mensaje", label: "Mensaje" },
    { key: "cuando", label: "Cuándo", format: (v: unknown) => (v ? format(new Date(v as string), "dd/MM/yyyy HH:mm", { locale: es }) : "—") },
    { key: "estado", label: "Estado" },
  ]
  const alertsTableData = alerts.map((a) => ({
    tipo: a.type,
    mensaje: a.message || "—",
    cuando: a.createdAt,
    estado: a.status,
  }))

  const handleExportAlerts = () => {
    exportTableToCSV({
      filename: `alertas-${format(new Date(), "yyyy-MM-dd")}.csv`,
      columns: alertsColumns,
      data: alertsTableData,
    })
  }
  const handlePrintAlerts = () => {
    printTableOnly({
      title: "Centro de Alertas — Notificaciones",
      columns: alertsColumns,
      data: alertsTableData,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Centro de Alertas</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportAlerts}>
            <Download className="w-4 h-4 mr-2" /> Exportar tabla
          </Button>
          <Button variant="outline" onClick={handlePrintAlerts}>
            <Printer className="w-4 h-4 mr-2" /> Imprimir tabla
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Cuándo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">Cargando...</TableCell></TableRow>
                ) : alerts.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8">No hay alertas activas</TableCell></TableRow>
                ) : (
                  alerts.map((alert) => (
                    <TableRow key={alert.id} className={alert.status === 'NEW' ? "bg-muted/30" : ""}>
                      <TableCell>
                        <Badge variant="outline" className={getSeverityColor(alert.type)}>
                          {alert.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{alert.message}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: es })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={alert.status === 'NEW' ? 'default' : 'secondary'}>
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {alert.status !== 'RESOLVED' && (
                          <Button size="sm" variant="ghost" onClick={() => markResolved(alert.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolver
                          </Button>
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
