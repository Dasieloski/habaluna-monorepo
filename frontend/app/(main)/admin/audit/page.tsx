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
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Search, Printer } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { printTableOnly } from "@/lib/table-export-print"
import { ExportTableDropdown } from "@/components/admin/export-table-dropdown"
import {
  ADMIN_TABLE_PAGE_SIZE,
  getPaginatedSlice,
  getTotalPages,
} from "@/lib/admin-table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(ADMIN_TABLE_PAGE_SIZE)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    try {
      setLoading(true)
      // En una implementación real usaríamos paginación del backend
      // Por ahora traemos los últimos 100
      const data = await api.getAuditLogs({ limit: 100 })
      setLogs(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrado simple en cliente
  const filteredLogs = logs.filter(log => 
    search === "" || 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.resource.toLowerCase().includes(search.toLowerCase()) ||
    log.user?.email.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    setPage(0)
  }, [search])

  const getActionColor = (action: string) => {
    if (action.includes("CREATE")) return "bg-green-100 text-green-800"
    if (action.includes("UPDATE")) return "bg-blue-100 text-blue-800"
    if (action.includes("DELETE")) return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  const auditColumns = [
    { key: "fecha", label: "Fecha", format: (v: unknown) => (v ? format(new Date(v as string), "dd/MM/yyyy HH:mm", { locale: es }) : "—") },
    { key: "usuario", label: "Usuario" },
    { key: "accion", label: "Acción" },
    { key: "recurso", label: "Recurso" },
    { key: "detalles", label: "Detalles", format: (v: unknown) => (v != null ? (typeof v === "string" ? v : JSON.stringify(v)) : "—") },
    { key: "ip", label: "IP" },
  ]
  const totalPages = getTotalPages(filteredLogs.length, pageSize)
  const displayedLogs = getPaginatedSlice(filteredLogs, page, pageSize)
  useEffect(() => {
    if (page >= totalPages && totalPages > 0) setPage(Math.max(0, totalPages - 1))
  }, [page, totalPages])

  const auditTableData = filteredLogs.map((log) => ({
    fecha: log.createdAt,
    usuario: [log.user?.firstName, log.user?.email].filter(Boolean).join(" — ") || "—",
    accion: log.action,
    recurso: log.resource + (log.resourceId ? ` #${log.resourceId.slice(0, 8)}` : ""),
    detalles: log.changes != null ? (typeof log.changes === "string" ? log.changes : JSON.stringify(log.changes)) : "—",
    ip: log.ipAddress || "—",
  }))

  const handlePrintAudit = () => {
    printTableOnly({
      title: "Auditoría — Registro de Actividad",
      columns: auditColumns,
      data: auditTableData,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Auditoría y Seguridad</h1>
        <div className="flex gap-2">
          <ExportTableDropdown
            title="Auditoría — Registro de Actividad"
            filename={`auditoria-${format(new Date(), "yyyy-MM-dd")}`}
            columns={auditColumns}
            data={auditTableData}
          />
          <Button variant="outline" onClick={handlePrintAudit}>
            <Printer className="w-4 h-4 mr-2" /> Imprimir tabla
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Registro de Actividad</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
             <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por acción, recurso o usuario..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Detalles</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Cargando registros...
                    </TableCell>
                  </TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No hay registros de actividad
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.createdAt), "dd MMM HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{log.user?.firstName}</span>
                          <span className="text-xs text-muted-foreground">{log.user?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{log.resource}</span>
                        {log.resourceId && <span className="text-xs text-muted-foreground block">#{log.resourceId.slice(0, 8)}</span>}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                        {log.changes ? JSON.stringify(log.changes) : "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {log.ipAddress || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredLogs.length > pageSize && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Mostrando {page * pageSize + 1}-{Math.min((page + 1) * pageSize, filteredLogs.length)} de {filteredLogs.length}
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (page > 0) setPage(page - 1)
                      }}
                      className={page <= 0 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = totalPages <= 5 ? i : page < 3 ? i : page >= totalPages - 2 ? totalPages - 5 + i : page - 2 + i
                    return (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            setPage(p)
                          }}
                          isActive={page === p}
                        >
                          {p + 1}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (page < totalPages - 1) setPage(page + 1)
                      }}
                      className={page >= totalPages - 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
