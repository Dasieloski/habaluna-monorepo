/**
 * Exporta los datos de una tabla a CSV (compatible con Excel).
 * columnas: { key: string; label: string }[]
 * datos: array de objetos con las keys indicadas
 */
export function exportTableToCSV(
  options: {
    filename: string
    columns: { key: string; label: string; format?: (value: unknown) => string }[]
    data: Record<string, unknown>[]
  }
): void {
  const { filename, columns, data } = options
  const headers = columns.map((c) => c.label)
  const rows = data.map((row) =>
    columns.map((col) => {
      const value = row[col.key]
      const formatted = col.format ? col.format(value) : value == null ? '' : String(value)
      const escaped = formatted.includes(',') || formatted.includes('"') || formatted.includes('\n')
        ? `"${String(formatted).replace(/"/g, '""')}"`
        : formatted
      return escaped
    })
  )
  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

/**
 * Abre una ventana de impresión con solo una tabla formateada (sin navegación ni botones).
 */
export function printTableOnly(options: {
  title: string
  columns: { key: string; label: string; format?: (value: unknown) => string }[]
  data: Record<string, unknown>[]
}): void {
  const { title, columns, data } = options
  const win = window.open('', '_blank')
  if (!win) return

  const head = columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join('')
  const body = data
    .map(
      (row) =>
        `<tr>${columns
          .map((col) => {
            const value = row[col.key]
            const formatted = col.format ? col.format(value) : value == null ? '—' : String(value)
            return `<td>${escapeHtml(formatted)}</td>`
          })
          .join('')}</tr>`
    )
    .join('')

  win.document.write(`
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; padding: 24px; color: #1e293b; }
    h1 { font-size: 1.5rem; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #e2e8f0; padding: 10px 12px; text-align: left; }
    th { background: #f1f5f9; font-weight: 600; }
    tr:nth-child(even) { background: #f8fafc; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p style="margin-bottom: 16px; color: #64748b;">Generado el ${new Date().toLocaleString('es-ES')}</p>
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
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
