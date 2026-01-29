"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Store, Bell, Lock, Globe, Palette } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const NOTIFICATION_PREFS_KEY = 'admin_notification_preferences'

const notificationTypes = [
  { key: 'newOrders', label: "Nuevos pedidos", desc: "Recibe alertas cuando lleguen nuevos pedidos", alertType: 'PENDING_PAYMENT' },
  { key: 'lowStock', label: "Stock bajo", desc: "Alerta cuando un producto tenga poco stock", alertType: 'LOW_STOCK' },
  { key: 'outOfStock', label: "Productos agotados", desc: "Alerta cuando un producto esté agotado", alertType: 'OUT_OF_STOCK' },
  { key: 'reviews', label: "Reseñas", desc: "Cuando un cliente deje una reseña", alertType: 'REVIEW' },
]

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [notificationPrefs, setNotificationPrefs] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(NOTIFICATION_PREFS_KEY)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return { newOrders: true, lowStock: true, outOfStock: true, reviews: true }
        }
      }
    }
    return { newOrders: true, lowStock: true, outOfStock: true, reviews: true }
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(notificationPrefs))
    }
  }, [notificationPrefs])

  const handleSave = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    toast({ title: "Configuración guardada" })
  }

  const handleNotificationToggle = (key: string, checked: boolean) => {
    setNotificationPrefs(prev => ({ ...prev, [key]: checked }))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-1">Gestiona los ajustes de tu tienda</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-secondary/50 p-1">
          <TabsTrigger value="general" className="gap-2 data-[state=active]:bg-card">
            <Store className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-card">
            <Bell className="w-4 h-4" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 data-[state=active]:bg-card">
            <Lock className="w-4 h-4" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Store className="w-5 h-5" />
                Información de la tienda
              </CardTitle>
              <CardDescription>Datos básicos de tu negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Nombre de la tienda</Label>
                  <Input
                    id="storeName"
                    defaultValue="Habaluna"
                    className="bg-secondary/50 border-transparent focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email de contacto</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="info@habaluna.com"
                    className="bg-secondary/50 border-transparent focus:border-primary"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  defaultValue="Tu tienda de productos originales. Descubre productos únicos: alimentos, materiales y mucho más."
                  className="bg-secondary/50 border-transparent focus:border-primary resize-none"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    defaultValue="+34 912 345 678"
                    className="bg-secondary/50 border-transparent focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Moneda</Label>
                  <Input
                    id="currency"
                    defaultValue="USD ($)"
                    className="bg-secondary/50 border-transparent focus:border-primary"
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Globe className="w-5 h-5" />
                SEO
              </CardTitle>
              <CardDescription>Optimización para buscadores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta título</Label>
                <Input
                  id="metaTitle"
                  defaultValue="Habaluna - Tu tienda de productos originales"
                  className="bg-secondary/50 border-transparent focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaDesc">Meta descripción</Label>
                <Textarea
                  id="metaDesc"
                  defaultValue="Descubre productos únicos: alimentos, materiales y mucho más. Calidad y originalidad en cada compra."
                  className="bg-secondary/50 border-transparent focus:border-primary resize-none"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Bell className="w-5 h-5" />
                Preferencias de notificación
              </CardTitle>
              <CardDescription>Configura cómo quieres recibir alertas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {notificationTypes.map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
                  <div>
                    <p className="font-medium text-foreground">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch 
                    checked={notificationPrefs[item.key] ?? true}
                    onCheckedChange={(checked) => handleNotificationToggle(item.key, checked)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Lock className="w-5 h-5" />
                Cambiar contraseña
              </CardTitle>
              <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña actual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  className="bg-secondary/50 border-transparent focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  className="bg-secondary/50 border-transparent focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="bg-secondary/50 border-transparent focus:border-primary"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Palette className="w-5 h-5" />
                Sesiones activas
              </CardTitle>
              <CardDescription>Dispositivos con sesión iniciada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div>
                    <p className="font-medium text-foreground">Este dispositivo</p>
                    <p className="text-sm text-muted-foreground">Chrome en Windows • Ahora</p>
                  </div>
                  <span className="text-xs text-green-600 font-medium">Activa</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-primary hover:opacity-90 text-primary-foreground shadow-lg px-8"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              <span>Guardando...</span>
            </div>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
