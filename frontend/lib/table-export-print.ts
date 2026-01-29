/**
 * Utilidades de exportación e impresión de tablas del panel admin.
 * Formatos: CSV, PDF, Excel (XLSX). Misma estructura de datos para todos.
 */

export type ExportTableColumn = {
  key: string
  label: string
  format?: (value: unknown) => string
}

const DEFAULT_LOGO_URL = "/logo.png"

function getExportDate(date: Date = new Date()): string {
  return date.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export type ExportTableOptions = {
  /** Título del documento (PDF, impresión, nombre de hoja Excel) */
  title: string
  /** Nombre base del archivo (sin extensión). Se añade .csv, .pdf o .xlsx según formato */
  filename: string
  columns: ExportTableColumn[]
  /** Datos a exportar: debe ser el conjunto completo según filtros activos (no la página actual) */
  data: Record<string, unknown>[]
  /** URL del logo (esquina superior). Por defecto /logo.png */
  logoUrl?: string
  /** Fecha/hora de exportación. Por defecto ahora */
  exportedAt?: Date
}

/** Formatea una celda según la columna (normalizado para export/import) */
function formatCell(row: Record<string, unknown>, col: ExportTableColumn): string {
  const value = row[col.key]
  const formatted = col.format
    ? col.format(value)
    : value == null || value === ""
      ? ""
      : String(value).trim()
  return formatted
}

/** Devuelve encabezados y filas formateadas (mismo orden de columnas en todos los formatos) */
function getFormattedRows(options: ExportTableOptions): { headers: string[]; rows: string[][] } {
  const { columns, data } = options
  const headers = columns.map((c) => c.label)
  const rows = data.map((row) => columns.map((col) => formatCell(row, col)))
  return { headers, rows }
}

/**
 * Exporta la tabla a CSV (estándar, UTF-8 con BOM, encabezados claros).
 * Valores normalizados; compatibilidad con Excel y sistemas externos.
 */
export function exportTableToCSV(options: ExportTableOptions): void {
  const { filename, columns, data, exportedAt = new Date() } = options
  const { headers, rows } = getFormattedRows(options)
  const dateStr = getExportDate(exportedAt)

  const escape = (val: string): string => {
    const s = val.replace(/\r/g, "").replace(/\n/g, " ")
    if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`
    return s
  }

  const commentLine = `# Exportado: ${dateStr}`
  const csv = [commentLine, headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\r\n")
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

/**
 * Exporta la tabla a PDF con apariencia profesional.
 * Encabezados en negrita, tabla estructurada, márgenes y saltos de página correctos.
 */
/** Carga el logo como data URL para incrustar en PDF. Devuelve null si falla. */
async function fetchLogoDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    return new Promise((resolve) => {
      const r = new FileReader()
      r.onloadend = () => resolve(r.result as string)
      r.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

export async function exportTableToPDF(options: ExportTableOptions): Promise<void> {
  const { title, filename, logoUrl = DEFAULT_LOGO_URL, exportedAt = new Date() } = options
  const { headers, rows } = getFormattedRows(options)
  const dateStr = getExportDate(exportedAt)

  const { jsPDF } = await import("jspdf")
  const autotableMod = await import("jspdf-autotable")
  const autoTable = (autotableMod as any).default ?? (autotableMod as any).autoTable

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
  const pageWidth = doc.getPageWidth()
  const pageHeight = doc.getPageHeight()
  const margin = 14
  const logoSize = 18
  const logoX = pageWidth - margin - logoSize

  const logoDataUrl = await fetchLogoDataUrl(logoUrl)
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", logoX, 6, logoSize, logoSize)
    } catch {
      /* ignorar si el formato no es compatible */
    }
  }

  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text(title, margin, 12)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(`Exportado: ${dateStr}`, margin, 18)
  doc.setTextColor(0, 0, 0)

  const tableBody = rows.map((row) => [...row])
  autoTable(doc, {
    head: [headers],
    body: tableBody,
    startY: 24,
    margin: { left: margin, right: margin },
    tableWidth: "max",
    styles: {
      fontSize: 9,
      cellPadding: { top: 4, right: 5, bottom: 4, left: 5 },
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [30, 41, 59],
      fontStyle: "bold",
      halign: "left",
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didDrawPage: (data: { pageNumber: number }) => {
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(120, 120, 120)
      if (data.pageNumber > 1 && logoDataUrl) {
        try {
          doc.addImage(logoDataUrl, "PNG", logoX, 6, logoSize * 0.7, logoSize * 0.7)
        } catch {
          /* ignorar */
        }
      }
      if (data.pageNumber > 1) {
        doc.text(`${title} — Página ${data.pageNumber}`, margin, 10)
        doc.text(`Exportado: ${dateStr}`, pageWidth - margin - 55, 10)
      }
      doc.text(
        `Exportado: ${dateStr}`,
        pageWidth / 2,
        pageHeight - 8,
        { align: "center" }
      )
      doc.setTextColor(0, 0, 0)
    },
    rowPageBreak: "avoid",
  } as any)

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`)
}

/**
 * Exporta la tabla a Excel (XLSX) con formato de tabla.
 * Cabecera en negrita, fondo sutil, bordes ligeros, ancho de columna automático.
 */
export async function exportTableToXLSX(options: ExportTableOptions): Promise<void> {
  const { title, filename } = options
  const { headers, rows } = getFormattedRows(options)

  const ExcelJS = await import("exceljs")
  const wb = new ExcelJS.Workbook()
  const sheetName = title.slice(0, 31).replace(/[*?:/\\[\]]/g, " ")
  const ws = wb.addWorksheet(sheetName, { views: [{ state: "frozen", ySplit: 1 }] })

  const headerRow = ws.addRow(headers)
  headerRow.font = { bold: true }
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF1F5F9" },
  }
  headerRow.alignment = { horizontal: "left", vertical: "middle" }
  headerRow.height = 22

  rows.forEach((row) => ws.addRow(row))

  for (let i = 1; i <= headers.length; i++) {
    const col = ws.getColumn(i)
    let max = 12
    col.eachCell?.({ includeEmpty: true }, (cell) => {
      const len = String(cell.value ?? "").length
      if (len > max) max = Math.min(len, 50)
    })
    col.width = max + 2
  }

  ws.eachRow((row, rowNumber) => {
    if (rowNumber != null && rowNumber <= 2) return
    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      }
      cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true }
    })
  })

  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`
  link.click()
  URL.revokeObjectURL(link.href)
}

/**
 * Abre una ventana de impresión con solo la tabla formateada (sin navegación ni botones).
 */
export function printTableOnly(options: {
  title: string
  columns: ExportTableColumn[]
  data: Record<string, unknown>[]
}): void {
  const { title, columns, data } = options
  const win = window.open("", "_blank")
  if (!win) return

  const head = columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join("")
  const body = data
    .map(
      (row) =>
        `<tr>${columns
          .map((col) => {
            const val = formatCell(row, col)
            return `<td>${escapeHtml(val || "—")}</td>`
          })
          .join("")}</tr>`
    )
    .join("")

  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; padding: 24px; color: #1e293b; }
    h1 { font-size: 1.25rem; margin-bottom: 12px; font-weight: 600; }
    p.meta { font-size: 0.875rem; color: #64748b; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-size: 0.875rem; }
    th { background: #f1f5f9; font-weight: 600; }
    tr:nth-child(even) { background: #f8fafc; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">Generado el ${new Date().toLocaleString("es-ES")}</p>
  <table>
    <thead><tr>${head}</tr></thead>
    <tbody>${body}</tbody>
  </table>
</body>
</html>
  `)
  win.document.close()
  win.focus()
  setTimeout(() => {
    win.print()
    win.close()
  }, 250)
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
