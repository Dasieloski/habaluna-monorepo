"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText } from "lucide-react"
import {
  type ExportTableOptions,
  exportTableToCSV,
  exportTableToPDF,
  exportTableToXLSX,
} from "@/lib/table-export-print"
import { useToast } from "@/hooks/use-toast"

type ExportTableDropdownProps = ExportTableOptions & {
  /** Texto del botón (por defecto "Exportar tabla") */
  buttonLabel?: string
  /** Clase adicional para el botón */
  className?: string
}

/**
 * Dropdown para exportar la tabla en PDF, Excel (XLSX) o CSV.
 * Reutiliza la misma estructura de datos (columns, data) para todos los formatos.
 */
export function ExportTableDropdown({
  title,
  filename,
  columns,
  data,
  buttonLabel = "Exportar tabla",
  className,
}: ExportTableDropdownProps) {
  const { toast } = useToast()
  const exportedAt = new Date()
  const options: ExportTableOptions = { title, filename, columns, data, exportedAt, logoUrl: "/logo.png" }

  const handleExport = async (format: "csv" | "pdf" | "xlsx") => {
    try {
      if (format === "csv") {
        exportTableToCSV(options)
        toast({ title: "Exportado", description: "Archivo CSV descargado." })
        return
      }
      if (format === "pdf") {
        await exportTableToPDF(options)
        toast({ title: "Exportado", description: "Archivo PDF descargado." })
        return
      }
      if (format === "xlsx") {
        await exportTableToXLSX(options)
        toast({ title: "Exportado", description: "Archivo Excel descargado." })
      }
    } catch (err) {
      console.error("Export error:", err)
      toast({
        title: "Error al exportar",
        description: "No se pudo generar el archivo. Comprueba que las dependencias estén instaladas.",
        variant: "destructive",
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className}>
          <Download className="w-4 h-4 mr-2" />
          {buttonLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText className="w-4 h-4 mr-2" />
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("xlsx")}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Excel (XLSX)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileText className="w-4 h-4 mr-2" />
          CSV
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
