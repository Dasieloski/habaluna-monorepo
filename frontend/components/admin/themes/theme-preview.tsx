"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { EyeIcon, XIcon } from "lucide-react"
import { ChristmasTheme } from "@/components/themes/christmas"

interface ThemePreviewProps {
  theme: any
  onClose: () => void
}

export function ThemePreview({ theme, onClose }: ThemePreviewProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Simular la activación del tema para preview
    setIsVisible(true)
    return () => setIsVisible(false)
  }, [theme])

  const getThemeComponent = () => {
    switch (theme.type) {
      case 'CHRISTMAS':
        return (
          <ChristmasTheme
            enabled={isVisible}
            showSnow={theme.config?.showSnow ?? true}
            showGarland={theme.config?.showGarland ?? true}
            showBanner={theme.config?.showBanner ?? true}
            bannerMessage={theme.config?.bannerMessage || "Vista Previa"}
            bannerSubMessage={theme.config?.bannerSubMessage}
          />
        )
      default:
        return (
          <div className="text-center text-muted-foreground">
            Vista previa no disponible para este tema
          </div>
        )
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
      default:
        return '🎨'
    }
  }

  return (
    <>
      {/* Overlay del tema (se renderiza fuera del modal) */}
      <div className="fixed inset-0 pointer-events-none z-50">
        {getThemeComponent()}
      </div>

      {/* Modal de preview */}
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] relative z-[60]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <EyeIcon className="h-5 w-5" />
              Vista Previa: {theme.name}
              <Badge variant="outline">{theme.type}</Badge>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6">
              {/* Información del tema */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Información del Tema</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Icono:</span> {getThemeIcon(theme.type)}
                    </div>
                    <div>
                      <span className="font-medium">Estado:</span>
                      <Badge variant={theme.status === 'ACTIVE' ? 'default' : 'secondary'} className="ml-2">
                        {theme.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-medium">Prioridad:</span> {theme.priority}
                    </div>
                    <div>
                      <span className="font-medium">Tipo:</span> {theme.type}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Configuración del tema */}
                <div>
                  <h3 className="font-medium mb-2">Configuración</h3>
                  {theme.config ? (
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto">
                      {JSON.stringify(theme.config, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-muted-foreground">Sin configuración personalizada</p>
                  )}
                </div>

                <Separator />

                {/* Preview instructions */}
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    🎨 Vista Previa Activa
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Los efectos del tema están visibles sobre el modal. Los overlays decorativos
                    (nieve, guirnaldas, banners) se muestran con pointer-events: none para no
                    interferir con la interacción.
                  </p>
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              <XIcon className="h-4 w-4 mr-2" />
              Cerrar Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}