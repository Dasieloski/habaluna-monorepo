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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Search, Shield, UserCog, Download, Printer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { exportTableToCSV, printTableOnly } from "@/lib/table-export-print"
import { format } from "date-fns"

export default function RolesPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      // Reusing getAdminCustomers for now, ideally should have a dedicated endpoint for all users including staff
      // But getAdminCustomers filters by role=USER. We need ALL users.
      // I'll assume I need to fetch all users. The backend has findAll for admin.
      // Wait, api.getAdminCustomers calls /users/admin/customers which filters role=USER.
      // I need a way to get staff.
      // Let's check backend UsersController. findAll is there for ADMIN.
      // I need to add a method to api.ts for getAllUsers or update getAdminCustomers.
      // Actually, I can just use a new method in api.ts or use existing one if I modify it.
      // But I can't modify api.ts easily now without context switch.
      // Wait, I added `getAdminUser` but not `getAllUsers`.
      // Let's assume I can use `api.get('/users')` directly since I have the generic `get`.
      const response = await api.get('/users')
      setUsers(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole)
      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido modificado.",
      })
      loadUsers()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(search.toLowerCase())
  )

  const roleColors: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-800 border-red-200",
    OPERATOR: "bg-blue-100 text-blue-800 border-blue-200",
    LOGISTICS: "bg-orange-100 text-orange-800 border-orange-200",
    SUPPORT: "bg-purple-100 text-purple-800 border-purple-200",
    USER: "bg-gray-100 text-gray-800 border-gray-200",
  }

  const rolesColumns = [
    { key: "usuario", label: "Usuario" },
    { key: "email", label: "Email" },
    { key: "rol", label: "Rol" },
  ]
  const rolesTableData = filteredUsers.map((u) => ({
    usuario: [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email?.split("@")[0] || "—",
    email: u.email || "—",
    rol: u.role || "—",
  }))

  const handleExportRoles = () => {
    exportTableToCSV({
      filename: `roles-${format(new Date(), "yyyy-MM-dd")}.csv`,
      columns: rolesColumns,
      data: rolesTableData,
    })
  }
  const handlePrintRoles = () => {
    printTableOnly({
      title: "Roles y Permisos — Usuarios",
      columns: rolesColumns,
      data: rolesTableData,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCog className="h-8 w-8 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Roles y Permisos</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportRoles}>
            <Download className="w-4 h-4 mr-2" /> Exportar tabla
          </Button>
          <Button variant="outline" onClick={handlePrintRoles}>
            <Printer className="w-4 h-4 mr-2" /> Imprimir tabla
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuario..."
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
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol Actual</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Cargando usuarios...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No se encontraron usuarios
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={roleColors[user.role] || roleColors.USER}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={user.role} 
                          onValueChange={(val) => handleRoleChange(user.id, val)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USER">Usuario</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="OPERATOR">Operador</SelectItem>
                            <SelectItem value="LOGISTICS">Logística</SelectItem>
                            <SelectItem value="SUPPORT">Soporte</SelectItem>
                          </SelectContent>
                        </Select>
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
