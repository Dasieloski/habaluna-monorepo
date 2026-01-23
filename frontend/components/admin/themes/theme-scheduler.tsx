"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, PlusIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

interface ThemeSchedulerProps {
  themes: any[]
  onScheduled: () => void
}

export function ThemeScheduler({ themes, onScheduled }: ThemeSchedulerProps) {
  const [selectedTheme, setSelectedTheme] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSchedule = async () => {
    if (!selectedTheme || !startDate) {
      toast({
        title: "Error",
        description: "Selecciona un tema y una fecha de inicio.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      await api.scheduleTheme({
        themeId: selectedTheme,
        startDate,
        endDate: endDate || undefined,
        isRecurring,
      })

      toast({
        title: "Tema programado",
        description: "El tema ha sido programado exitosamente."
      })

      // Limpiar formulario
      setSelectedTheme("")
      setStartDate("")
      setEndDate("")
      setIsRecurring(false)

      onScheduled()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo programar el tema.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Programar Tema
        </CardTitle>
        <CardDescription>
          Programa la activación automática de temas en fechas específicas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seleccionar tema */}
        <div className="space-y-2">
          <Label htmlFor="theme">Tema</Label>
          <Select value={selectedTheme} onValueChange={setSelectedTheme}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un tema" />
            </SelectTrigger>
            <SelectContent>
              {themes.map((theme) => (
                <SelectItem key={theme.id} value={theme.id}>
                  {theme.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Fecha de inicio</Label>
            <Input
              id="start-date"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">Fecha de fin (opcional)</Label>
            <Input
              id="end-date"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Opciones recurrentes */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="recurring"
            checked={isRecurring}
            onCheckedChange={(checked) => setIsRecurring(checked as boolean)}
          />
          <Label htmlFor="recurring" className="text-sm">
            Tema recurrente (se activa automáticamente cada año en estas fechas)
          </Label>
        </div>

        {/* Botón de programar */}
        <Button
          onClick={handleSchedule}
          disabled={loading || !selectedTheme || !startDate}
          className="w-full"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          {loading ? "Programando..." : "Programar Tema"}
        </Button>

        {/* Información adicional */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Los temas programados tienen menor prioridad que los activados manualmente</p>
          <p>• Si hay conflictos entre temas programados, gana el de mayor prioridad</p>
          <p>• Los temas recurrentes se activan automáticamente cada año</p>
        </div>
      </CardContent>
    </Card>
  )
}