"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

interface ThemeConfigDialogProps {
  theme: any
  open: boolean
  onClose: () => void
  onSaved: () => void
}

export function ThemeConfigDialog({ theme, open, onClose, onSaved }: ThemeConfigDialogProps) {
  const { toast } = useToast()
  const initialJson = useMemo(() => {
    return JSON.stringify(theme?.config || {}, null, 2)
  }, [theme])

  const [jsonValue, setJsonValue] = useState(initialJson)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setJsonValue(initialJson)
  }, [initialJson])

  const handleSave = async () => {
    try {
      const parsed = jsonValue.trim() ? JSON.parse(jsonValue) : {}
      setSaving(true)
      await api.updateTheme(theme.id, { config: parsed })
      toast({
        title: "Configuración guardada",
        description: `Se actualizó la configuración de "${theme.name}".`,
      })
      onSaved()
      onClose()
    } catch (error: any) {
      toast({
        title: "Error al guardar",
        description: error?.message || "JSON inválido o fallo al actualizar el tema.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] top-[6%] translate-y-0 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Configurar tema: {theme?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Edita la configuración en formato JSON. Cambios válidos se aplican al tema activo y a la previsualización.
          </p>
          <Textarea
            value={jsonValue}
            onChange={(e) => setJsonValue(e.target.value)}
            className="min-h-[320px] font-mono text-xs"
            placeholder='{"showBanner": true, "bannerMessage": "Promo de temporada"}'
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
