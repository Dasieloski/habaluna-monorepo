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
import { FileText, Plus, Pencil, Trash2, Printer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
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
import { Textarea } from "@/components/ui/textarea"
import { printTableOnly } from "@/lib/table-export-print"
import { ExportTableDropdown } from "@/components/admin/export-table-dropdown"
import { format } from "date-fns"

export default function ContentPage() {
  const { toast } = useToast()
  const [contents, setContents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  
  // Form state
  const [slug, setSlug] = useState("")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [section, setSection] = useState("")

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setLoading(true)
      const data = await api.getContentBlocks()
      setContents(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      await api.upsertContentBlock({ slug, title, content, section })
      toast({ title: "Contenido guardado" })
      setIsDialogOpen(false)
      loadContent()
      resetForm()
    } catch (error) {
      toast({ title: "Error al guardar", variant: "destructive" })
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm("¿Estás seguro?")) return
    try {
      await api.deleteContentBlock(slug)
      toast({ title: "Eliminado" })
      loadContent()
    } catch (error) {
      toast({ title: "Error", variant: "destructive" })
    }
  }

  const openEdit = (item: any) => {
    setEditingItem(item)
    setSlug(item.slug)
    setTitle(item.title)
    setContent(item.content)
    setSection(item.section || "")
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingItem(null)
    setSlug("")
    setTitle("")
    setContent("")
    setSection("")
  }

  const contentColumns = [
    { key: "slug", label: "Slug (ID)" },
    { key: "titulo", label: "Título" },
    { key: "seccion", label: "Sección" },
  ]
  const contentTableData = contents.map((item) => ({
    slug: item.slug,
    titulo: item.title || "—",
    seccion: item.section || "—",
  }))

  const handleExportContent = () => {
    exportTableToCSV({
      filename: `contenido-cms-${format(new Date(), "yyyy-MM-dd")}.csv`,
      columns: contentColumns,
      data: contentTableData,
    })
  }
  const handlePrintContent = () => {
    printTableOnly({
      title: "Contenido CMS — Bloques",
      columns: contentColumns,
      data: contentTableData,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-muted-foreground" />
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Contenido</h1>
        </div>
        <div className="flex gap-2">
          <ExportTableDropdown
            title="Contenido CMS — Bloques"
            filename={`contenido-cms-${format(new Date(), "yyyy-MM-dd")}`}
            columns={contentColumns}
            data={contentTableData}
          />
          <Button variant="outline" onClick={handlePrintContent}>
            <Printer className="h-4 w-4 mr-2" /> Imprimir tabla
          </Button>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Bloque
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Bloques de Texto (CMS)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slug (ID)</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Sección</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">Cargando...</TableCell></TableRow>
                ) : contents.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">No hay contenido</TableCell></TableRow>
                ) : (
                  contents.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.slug}</TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell>{item.section || "-"}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-red-600" onClick={() => handleDelete(item.slug)}>
                          <Trash2 className="h-4 w-4" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Contenido" : "Nuevo Contenido"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Slug (Identificador único)</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} disabled={!!editingItem} placeholder="ej: home-banner" />
              </div>
              <div className="space-y-2">
                <Label>Sección (Opcional)</Label>
                <Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="ej: legal" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Contenido (HTML o Texto)</Label>
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} className="h-40 font-mono text-sm" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
