"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CalendarIcon, EyeIcon, SettingsIcon, PlusIcon } from "lucide-react"
import { ThemeList } from "@/components/admin/themes/theme-list"
import { ThemeScheduler } from "@/components/admin/themes/theme-scheduler"
import { ThemePreview } from "@/components/admin/themes/theme-preview"
import { ThemeConfigDialog } from "@/components/admin/themes/theme-config"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

export default function ThemesPage() {
  const [activeTheme, setActiveTheme] = useState<any>(null)
  const [themes, setThemes] = useState<any[]>([])
  const [scheduledThemes, setScheduledThemes] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [previewTheme, setPreviewTheme] = useState<any>(null)
  const [showConfig, setShowConfig] = useState(false)
  const [configTheme, setConfigTheme] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadThemes()
  }, [])

  const loadThemes = async () => {
    try {
      const [active, themesList, scheduled] = await Promise.all([
        api.getActiveTheme(),
        api.getThemes(),
        api.getScheduledThemes()
      ])

      setActiveTheme(active)
      setThemes(themesList)
      setScheduledThemes(scheduled)
    } catch (error: any) {
      console.error('Error loading themes:', error)
    }
  }

  const handlePreview = (theme: any) => {
    setPreviewTheme(theme)
    setShowPreview(true)
  }

  const handleConfigure = (theme: any) => {
    setConfigTheme(theme)
    setShowConfig(true)
  }

  const handleInitialize = async () => {
    try {
      await api.initializeThemes()
      toast({
        title: "Temas inicializados",
        description: "Los temas por defecto han sido creados exitosamente."
      })
      loadThemes()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron inicializar los temas.",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Temas / Estacionalidad</h1>
          <p className="text-muted-foreground">
            Gestiona temas estacionales, programaciones y personalizaciones
          </p>
        </div>
        <Button onClick={handleInitialize} variant="outline">
          <PlusIcon className="h-4 w-4 mr-2" />
          Inicializar Temas
        </Button>
      </div>

      {/* Estado del tema actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Tema Activo Actual
            {activeTheme && (
              <Badge variant="default" className="bg-green-500">
                ACTIVO
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {activeTheme
              ? `Tema "${activeTheme.name}" está activo`
              : "No hay ningún tema activo actualmente"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTheme ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{activeTheme.name}</h3>
                <p className="text-sm text-muted-foreground">{activeTheme.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreview(activeTheme)}
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Previsualizar
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleConfigure(activeTheme)}>
                  <SettingsIcon className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Ningún tema activo</p>
          )}
        </CardContent>
      </Card>

      {/* Lista de temas disponibles */}
      <ThemeList
        onPreview={handlePreview}
        onConfigure={handleConfigure}
        onRefresh={loadThemes}
      />

      {/* Programador de temas */}
      <ThemeScheduler
        themes={themes}
        onScheduled={loadThemes}
      />

      {/* Temas programados */}
      {scheduledThemes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Temas Programados
            </CardTitle>
            <CardDescription>
              Temas que se activarán automáticamente en fechas específicas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledThemes.map((schedule: any) => (
                <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{schedule.theme.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(schedule.startDate).toLocaleDateString()}
                      {schedule.endDate && ` - ${new Date(schedule.endDate).toLocaleDateString()}`}
                      {schedule.isRecurring && " (Recurrente)"}
                    </p>
                  </div>
                  <Badge variant="outline">
                    PROGRAMADO
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de previsualización */}
      {showPreview && previewTheme && (
        <ThemePreview
          theme={previewTheme}
          onClose={() => {
            setShowPreview(false)
            setPreviewTheme(null)
          }}
        />
      )}

      {showConfig && configTheme && (
        <ThemeConfigDialog
          theme={configTheme}
          open={showConfig}
          onClose={() => {
            setShowConfig(false)
            setConfigTheme(null)
          }}
          onSaved={loadThemes}
        />
      )}
    </div>
  )
}