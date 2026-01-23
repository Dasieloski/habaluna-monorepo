"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CalendarIcon, EyeIcon, SettingsIcon, ClockIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

interface Theme {
  id: string
  type: string
  name: string
  description?: string
  status: 'ACTIVE' | 'INACTIVE' | 'SCHEDULED'
  priority: number
  startDate?: string
  endDate?: string
  isRecurring?: boolean
  _count?: {
    ThemeSchedule: number
  }
}

interface ThemeListProps {
  onPreview: (theme: Theme) => void
  onRefresh: () => void
}

export function ThemeList({ onPreview, onRefresh }: ThemeListProps) {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadThemes()
  }, [])

  const loadThemes = async () => {
    try {
      const data = await api.getThemes()
      setThemes(data)
    } catch (error) {
      console.error('Error loading themes:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTheme = async (theme: Theme, enabled: boolean) => {
    try {
      const updatedTheme = await api.toggleTheme(theme.id, enabled)

      // Actualizar el estado local
      setThemes(prev => prev.map(t =>
        t.id === theme.id ? { ...t, status: updatedTheme.status } : t
      ))

      toast({
        title: enabled ? "Tema activado" : "Tema desactivado",
        description: `El tema "${theme.name}" ha sido ${enabled ? 'activado' : 'desactivado'}.`
      })

      onRefresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el estado del tema.",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">ACTIVO</Badge>
      case 'SCHEDULED':
        return <Badge variant="outline" className="border-blue-500 text-blue-600">
          <ClockIcon className="h-3 w-3 mr-1" />
          PROGRAMADO
        </Badge>
      default:
        return <Badge variant="secondary">INACTIVO</Badge>
    }
  }

  const getThemeIcon = (type: string) => {
    switch (type) {
      case 'CHRISTMAS':
        return '🎄'
      case 'VALENTINES':
        return '💝'
      case 'MOTHERS_DAY':
        return '👩‍👧‍👦'
      case 'EASTER':
        return '🐰'
      case 'HALLOWEEN':
        return '🎃'
      case 'NEW_YEAR':
        return '🎊'
      case 'SUMMER':
        return '☀️'
      case 'WINTER':
        return '❄️'
      case 'SPRING':
        return '🌸'
      case 'AUTUMN':
        return '🍂'
      default:
        return '🎨'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Temas Disponibles</CardTitle>
          <CardDescription>Cargando temas...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temas Disponibles</CardTitle>
        <CardDescription>
          Gestiona todos los temas estacionales disponibles
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme) => (
            <Card key={theme.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getThemeIcon(theme.type)}</span>
                    <CardTitle className="text-lg">{theme.name}</CardTitle>
                  </div>
                  {getStatusBadge(theme.status)}
                </div>
                <CardDescription>{theme.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Toggle para activar/desactivar */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Activar tema</span>
                  <Switch
                    checked={theme.status === 'ACTIVE'}
                    onCheckedChange={(checked) => toggleTheme(theme, checked)}
                  />
                </div>

                {/* Información de programaciones */}
                {theme._count?.ThemeSchedule > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{theme._count.ThemeSchedule} programaciones activas</span>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onPreview(theme)}
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    Previsualizar
                  </Button>
                  <Button variant="outline" size="sm">
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {themes.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No hay temas disponibles</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Recargar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}