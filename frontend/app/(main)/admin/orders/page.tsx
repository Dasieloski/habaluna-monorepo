"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Eye, Filter, Printer } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
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

const statusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  PROCESSING: { label: "Procesando", color: "bg-blue-100 text-blue-800" },
  SHIPPED: { label: "Enviado", color: "bg-purple-100 text-purple-800" },
  DELIVERED: { label: "Entregado", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-800" },
  COMPLETED: { label: "Completado", color: "bg-gray-100 text-gray-800" },
}

const paymentStatusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "Pagado", color: "bg-green-100 text-green-800" },
  FAILED: { label: "Fallido", color: "bg-red-100 text-red-800" },
  REFUNDED: { label: "Reembolsado", color: "bg-orange-100 text-orange-800" },
}

export default function AdminOrdersPage() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(ADMIN_TABLE_PAGE_SIZE)

  useEffect(() => {
    const q = searchParams.get("search")
    if (q != null && q !== "") setSearch(q)
  }, [searchParams])

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [search, statusFilter, orders])

  useEffect(() => {
    setPage(0)
  }, [search, statusFilter])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const data = await api.getAdminOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let result = [...orders]

    if (search) {
      const lowerSearch = search.toLowerCase()
      result = result.filter(
        (order) =>
          order.orderNumber?.toLowerCase().includes(lowerSearch) ||
          order.user?.email?.toLowerCase().includes(lowerSearch) ||
          order.user?.firstName?.toLowerCase().includes(lowerSearch) ||
          order.shippingAddress?.firstName?.toLowerCase().includes(lowerSearch)
      )
    }

    if (statusFilter !== "ALL") {
      result = result.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(result)
  }

  const totalPages = getTotalPages(filteredOrders.length, pageSize)
  const displayedOrders = getPaginatedSlice(filteredOrders, page, pageSize)
  useEffect(() => {
    if (page >= totalPages && totalPages > 0) setPage(Math.max(0, totalPages - 1))
  }, [page, totalPages])

  const orderColumns = [
    { key: "orden", label: "Nº Orden" },
    { key: "fecha", label: "Fecha", format: (v: unknown) => (v ? format(new Date(v as string), "dd/MM/yyyy", { locale: es }) : "—") },
    { key: "cliente", label: "Cliente" },
    { key: "estado", label: "Estado" },
    { key: "pago", label: "Pago" },
    { key: "total", label: "Total (USD)", format: (v: unknown) => (v != null ? formatPrice(Number(v)) : "—") },
  ]
  const orderTableData = filteredOrders.map((o) => ({
    orden: o.orderNumber || o.id?.slice(0, 8) || "—",
    fecha: o.createdAt,
    cliente: [o.user?.firstName, o.user?.lastName].filter(Boolean).join(" ") || o.user?.email || "—",
    estado: statusMap[o.status]?.label || o.status,
    pago: paymentStatusMap[o.paymentStatus]?.label || o.paymentStatus,
    total: o.total,
  }))

  const handlePrintOrders = () => {
    printTableOnly({
      title: "Pedidos — Listado",
      columns: orderColumns,
      data: orderTableData,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <div className="flex gap-2">
          <ExportTableDropdown
            title="Pedidos — Listado"
            filename={`pedidos-${format(new Date(), "yyyy-MM-dd")}`}
            columns={orderColumns}
            data={orderTableData}
            />
          <Button variant="outline" onClick={handlePrintOrders}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir tabla
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por número, cliente o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="PENDING">Pendientes</SelectItem>
                <SelectItem value="PROCESSING">Procesando</SelectItem>
                <SelectItem value="SHIPPED">Enviados</SelectItem>
                <SelectItem value="DELIVERED">Entregados</SelectItem>
                <SelectItem value="CANCELLED">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Cargando pedidos...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No se encontraron pedidos
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber || order.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.createdAt), "dd MMM yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>
                            {order.user?.firstName} {order.user?.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {order.user?.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusMap[order.status]?.color}
                        >
                          {statusMap[order.status]?.label || order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={paymentStatusMap[order.paymentStatus]?.color}
                        >
                          {paymentStatusMap[order.paymentStatus]?.label || order.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver detalle</span>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {filteredOrders.length > pageSize && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                Mostrando {page * pageSize + 1}-{Math.min((page + 1) * pageSize, filteredOrders.length)} de {filteredOrders.length}
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
                    let p: number
                    if (totalPages <= 5) p = i
                    else if (page < 3) p = i
                    else if (page >= totalPages - 2) p = totalPages - 5 + i
                    else p = page - 2 + i
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
