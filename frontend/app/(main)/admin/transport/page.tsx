"use client"

import { useState, useEffect } from "react"
import { api, type BackendTransportConfig, type BackendTransportRule } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Truck, Plus, Trash2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const emptyRule: BackendTransportRule = { minProducts: 1, discountType: "percent", discountValue: 0 }

export default function AdminTransportPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [baseCost, setBaseCost] = useState("5.99")
  const [discountsEnabled, setDiscountsEnabled] = useState(false)
  const [rules, setRules] = useState<BackendTransportRule[]>([])
  const [noDiscountMessage, setNoDiscountMessage] = useState("")

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const c = await api.getAdminTransportConfig()
        if (cancelled) return
        setBaseCost(String(c.baseCost ?? 5.99))
        setDiscountsEnabled(Boolean(c.discountsEnabled))
        setRules(Array.isArray(c.rules) && c.rules.length > 0 ? c.rules : [])
        setNoDiscountMessage(c.noDiscountMessage ?? "")
      } catch (e: any) {
        if (!cancelled) setError(e?.response?.data?.message || e?.message || "Ups… no cargó la config. Intenta de nuevo.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const addRule = () => {
    const next = (rules[rules.length - 1]?.minProducts ?? 0) + 1
    setRules((r) => [...r, { ...emptyRule, minProducts: next }])
  }

  const removeRule = (i: number) => {
    setRules((r) => r.filter((_, j) => j !== i))
  }

  const updateRule = (i: number, field: keyof BackendTransportRule, value: number | "percent" | "fixed") => {
    setRules((r) => r.map((x, j) => (j === i ? { ...x, [field]: value } : x)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setSaving(true)
    try {
      await api.updateAdminTransportConfig({
        baseCost: Math.max(0, parseFloat(baseCost) || 0),
        discountsEnabled,
        rules: rules.map((x) => ({
          minProducts: Math.max(1, Math.floor(Number(x.minProducts) || 1)),
          discountType: x.discountType,
          discountValue: Math.max(0, parseFloat(String(x.discountValue)) || 0),
        })),
        noDiscountMessage: noDiscountMessage.trim() || null,
      })
      setSuccess("¡Transporte guardado! ✅")
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "No se pudo guardar.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-pulse text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transporte</h1>
          <p className="text-muted-foreground">Costo base, descuentos por cantidad y mensaje cuando no hay descuento</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm">{error}</div>
      )}
      {success && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Costo base</CardTitle>
            <CardDescription>Precio del transporte cuando no aplica ningún descuento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs">
              <Label htmlFor="baseCost">Costo (USD)</Label>
              <Input
                id="baseCost"
                type="number"
                min={0}
                step="0.01"
                value={baseCost}
                onChange={(e) => setBaseCost(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Descuentos por cantidad</CardTitle>
                <CardDescription>A partir de X productos (unidades) aplicar descuento en % o monto fijo</CardDescription>
              </div>
              <Switch checked={discountsEnabled} onCheckedChange={setDiscountsEnabled} />
            </div>
          </CardHeader>
          {discountsEnabled && (
            <CardContent className="space-y-4">
              {rules.map((r, i) => (
                <div
                  key={i}
                  className="flex flex-wrap items-end gap-3 p-4 rounded-xl border border-border bg-muted/30"
                >
                  <div className="w-28">
                    <Label className="text-xs">Desde (unidades)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={r.minProducts}
                      onChange={(e) => updateRule(i, "minProducts", parseInt(e.target.value, 10) || 1)}
                    />
                  </div>
                  <div className="w-36">
                    <Label className="text-xs">Tipo</Label>
                    <Select
                      value={r.discountType}
                      onValueChange={(v: "percent" | "fixed") => updateRule(i, "discountType", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percent">Porcentaje %</SelectItem>
                        <SelectItem value="fixed">Monto fijo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-28">
                    <Label className="text-xs">
                      {r.discountType === "percent" ? "Descuento %" : "Monto (USD)"}
                    </Label>
                    <Input
                      type="number"
                      min={0}
                      step={r.discountType === "percent" ? 1 : 0.01}
                      value={r.discountValue}
                      onChange={(e) => updateRule(i, "discountValue", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeRule(i)} aria-label="Quitar regla">
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addRule} className="gap-2">
                <Plus className="w-4 h-4" />
                Añadir regla
              </Button>
              <p className="text-xs text-muted-foreground">
                Ordena por &quot;Desde (unidades)&quot; de menor a mayor. Se aplica la regla con el umbral más alto que
                cumpla el pedido.
              </p>
            </CardContent>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mensaje cuando no hay descuento</CardTitle>
            <CardDescription>
              Texto amable para el cliente. Si está vacío, se usará uno por defecto (ej. &quot;Transporte calculado al
              costo justo&quot;).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Ej: 🚚 Transporte calculado al costo justo"
              value={noDiscountMessage}
              onChange={(e) => setNoDiscountMessage(e.target.value)}
              maxLength={200}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </form>
    </div>
  )
}
