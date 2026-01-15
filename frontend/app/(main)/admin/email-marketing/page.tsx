"use client"

import { useEffect, useMemo, useState } from "react"
import { api, type EmailCampaign, type NewsletterSubscriber, type PagedResponse } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Loader2, MailPlus, Send, Users } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Template HTML por defecto - usando función para evitar problemas de evaluación en build
function getDefaultCampaignHtml(): string {
  return [
    '<p style="margin:0 0 10px;">{{firstName}}, tenemos algo bueno para ti.</p>',
    '<p style="margin:0 0 10px;">Este correo está diseñado para verse perfecto con el estilo de Habaluna (colores + logo).</p>',
    '<ul style="margin:0; padding-left:18px;">',
    '  <li>Producto destacado de la semana</li>',
    '  <li>Oferta limitada</li>',
    '  <li>Un combo recomendado</li>',
    '</ul>',
    '<p style="margin:14px 0 0;">¿Listo? Entra y mira las novedades.</p>',
  ].join('\n');
}

const defaultCampaignHtml = getDefaultCampaignHtml();

export default function AdminEmailMarketingPage() {
  const [tab, setTab] = useState<"subscribers" | "campaigns">("subscribers")

  // Subscribers
  const [subLoading, setSubLoading] = useState(true)
  const [subSearch, setSubSearch] = useState("")
  const [subs, setSubs] = useState<PagedResponse<NewsletterSubscriber> | null>(null)
  const [newEmail, setNewEmail] = useState("")
  const [newFirstName, setNewFirstName] = useState("")
  const [newLastName, setNewLastName] = useState("")
  const [subSaving, setSubSaving] = useState(false)

  // Campaigns
  const [campLoading, setCampLoading] = useState(true)
  const [camps, setCamps] = useState<PagedResponse<EmailCampaign> | null>(null)
  const [campSaving, setCampSaving] = useState(false)
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null)

  const selectedCampaign = useMemo(() => {
    if (!selectedCampaignId) return null
    return (camps?.data || []).find((c) => c.id === selectedCampaignId) || null
  }, [camps, selectedCampaignId])

  const [campName, setCampName] = useState("")
  const [campSubject, setCampSubject] = useState("")
  const [campPreheader, setCampPreheader] = useState("")
  const [campHtml, setCampHtml] = useState(defaultCampaignHtml)
  const [campText, setCampText] = useState("")

  // Preview HTML con variables reemplazadas (procesado de forma segura)
  const previewHtml = useMemo(() => {
    try {
      if (!campHtml || typeof campHtml !== "string") return ""
      let processed = String(campHtml)
      // Reemplazar variables de template de forma segura
      processed = processed.replace(/\{\{\s*firstName\s*\}\}/g, "Cliente")
      processed = processed.replace(/\{\{\s*email\s*\}\}/g, "cliente@email.com")
      // Remover scripts por seguridad
      processed = processed.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      return processed
    } catch (error) {
      console.error("Error procesando preview HTML:", error)
      return ""
    }
  }, [campHtml])

  const [testTo, setTestTo] = useState("")
  const [sendingTest, setSendingTest] = useState(false)
  const [sendingCampaign, setSendingCampaign] = useState(false)

  const loadSubscribers = async () => {
    setSubLoading(true)
    try {
      const res = await api.getEmailSubscribers({ search: subSearch || undefined, page: 1, limit: 50 })
      setSubs(res)
    } catch (e: any) {
      toast({ title: "Error", description: e?.response?.data?.message || e?.message || "No se pudo cargar suscriptores.", variant: "destructive" })
    } finally {
      setSubLoading(false)
    }
  }

  const loadCampaigns = async () => {
    setCampLoading(true)
    try {
      const res = await api.getEmailCampaigns({ page: 1, limit: 50 })
      setCamps(res)
      if (!selectedCampaignId && res.data?.length) {
        setSelectedCampaignId(res.data[0].id)
      }
    } catch (e: any) {
      toast({ title: "Error", description: e?.response?.data?.message || e?.message || "No se pudo cargar campañas.", variant: "destructive" })
    } finally {
      setCampLoading(false)
    }
  }

  useEffect(() => {
    void loadSubscribers()
  }, [])

  useEffect(() => {
    void loadCampaigns()
  }, [])

  useEffect(() => {
    if (!selectedCampaign) return
    setCampName(selectedCampaign.name || "")
    setCampSubject(selectedCampaign.subject || "")
    setCampPreheader(selectedCampaign.preheader || "")
    setCampHtml(selectedCampaign.html || "")
    setCampText(selectedCampaign.text || "")
  }, [selectedCampaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddSubscriber = async () => {
    setSubSaving(true)
    try {
      await api.upsertEmailSubscriber({
        email: newEmail.trim(),
        firstName: newFirstName.trim() || undefined,
        lastName: newLastName.trim() || undefined,
      })
      toast({ title: "Éxito", description: "Suscriptor guardado." })
      setNewEmail("")
      setNewFirstName("")
      setNewLastName("")
      await loadSubscribers()
    } catch (e: any) {
      toast({ title: "Error", description: e?.response?.data?.message || e?.message || "No se pudo guardar.", variant: "destructive" })
    } finally {
      setSubSaving(false)
    }
  }

  const handleToggleSubscriber = async (s: NewsletterSubscriber) => {
    try {
      const next = s.status === "SUBSCRIBED" ? "UNSUBSCRIBED" : "SUBSCRIBED"
      await api.updateEmailSubscriber(s.id, { status: next })
      await loadSubscribers()
    } catch (e: any) {
      toast({ title: "Error", description: e?.response?.data?.message || e?.message || "No se pudo actualizar.", variant: "destructive" })
    }
  }

  const handleCreateCampaign = async () => {
    setCampSaving(true)
    try {
      const c = await api.createEmailCampaign({
        name: campName.trim() || undefined,
        subject: (campSubject || "").trim() || "Nueva campaña",
        preheader: campPreheader.trim() || undefined,
        html: campHtml,
        text: campText.trim() || undefined,
      })
      toast({ title: "Éxito", description: "Campaña creada." })
      await loadCampaigns()
      setSelectedCampaignId(c.id)
    } catch (e: any) {
      toast({ title: "Error", description: e?.response?.data?.message || e?.message || "No se pudo crear campaña.", variant: "destructive" })
    } finally {
      setCampSaving(false)
    }
  }

  const handleSaveCampaign = async () => {
    if (!selectedCampaignId) return
    setCampSaving(true)
    try {
      await api.updateEmailCampaign(selectedCampaignId, {
        name: campName,
        subject: campSubject,
        preheader: campPreheader,
        html: campHtml,
        text: campText,
      })
      toast({ title: "Éxito", description: "Campaña guardada." })
      await loadCampaigns()
    } catch (e: any) {
      toast({ title: "Error", description: e?.response?.data?.message || e?.message || "No se pudo guardar campaña.", variant: "destructive" })
    } finally {
      setCampSaving(false)
    }
  }

  const handleSendTest = async () => {
    if (!selectedCampaignId) return
    setSendingTest(true)
    try {
      await api.sendTestEmailCampaign(selectedCampaignId, testTo.trim())
      toast({ title: "Éxito", description: "Correo de prueba enviado (si SMTP está configurado)." })
    } catch (e: any) {
      toast({ title: "Error", description: e?.response?.data?.message || e?.message || "No se pudo enviar prueba.", variant: "destructive" })
    } finally {
      setSendingTest(false)
    }
  }

  const handleSendCampaign = async () => {
    if (!selectedCampaignId) return
    setSendingCampaign(true)
    try {
      await api.sendEmailCampaign(selectedCampaignId)
      toast({ title: "Listo", description: "Envío iniciado en background. Revisa el estado en unos minutos." })
      await loadCampaigns()
    } catch (e: any) {
      toast({ title: "Error", description: e?.response?.data?.message || e?.message || "No se pudo iniciar envío.", variant: "destructive" })
    } finally {
      setSendingCampaign(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Marketing</h1>
          <p className="text-sm text-muted-foreground">Campañas, suscriptores, pruebas y envío masivo.</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList>
          <TabsTrigger value="subscribers" className="gap-2">
            <Users className="w-4 h-4" />
            Suscriptores
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2">
            <MailPlus className="w-4 h-4" />
            Campañas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="mt-4">
          <Card className="border-0 shadow-md">
            <CardContent className="p-5 space-y-5">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="md:col-span-3">
                  <Label>Buscar</Label>
                  <div className="flex gap-2">
                    <Input value={subSearch} onChange={(e) => setSubSearch(e.target.value)} placeholder="Email o nombre..." />
                    <Button variant="outline" onClick={loadSubscribers} disabled={subLoading}>
                      {subLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="cliente@email.com" />
                </div>
                <div>
                  <Label>Nombre</Label>
                  <Input value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} placeholder="Nombre" />
                </div>
                <div>
                  <Label>Apellidos</Label>
                  <Input value={newLastName} onChange={(e) => setNewLastName(e.target.value)} placeholder="Apellidos" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleAddSubscriber}
                  disabled={subSaving || !newEmail.trim()}
                  className="bg-gradient-to-r from-primary to-habaluna-blue-dark hover:opacity-90 text-primary-foreground shadow-lg"
                >
                  {subSaving ? "Guardando..." : "Añadir suscriptor"}
                </Button>
              </div>

              <div className="rounded-xl border bg-background/60">
                <div className="p-3 border-b text-sm text-muted-foreground flex items-center justify-between">
                  <span>Total: {subs?.meta.total ?? (subLoading ? "..." : 0)}</span>
                  <span className="text-xs">Click en el estado para activar/desactivar</span>
                </div>
                <div className="divide-y">
                  {subLoading && (
                    <div className="p-4 text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
                    </div>
                  )}
                  {!subLoading && (subs?.data || []).length === 0 && (
                    <div className="p-4 text-sm text-muted-foreground">No hay suscriptores todavía.</div>
                  )}
                  {(subs?.data || []).map((s) => (
                    <div key={s.id} className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground truncate">{s.email}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {(s.firstName || s.lastName) ? `${s.firstName || ""} ${s.lastName || ""}`.trim() : "—"} • {s.source || "—"}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => handleToggleSubscriber(s)}
                        className={s.status === "SUBSCRIBED" ? "border-emerald-300 text-emerald-700" : "border-muted text-muted-foreground"}
                      >
                        {s.status === "SUBSCRIBED" ? "SUBSCRIBED" : "UNSUBSCRIBED"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="mt-4">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-md lg:col-span-1">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">Campañas</p>
                  <Button variant="outline" onClick={loadCampaigns} disabled={campLoading}>
                    {campLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refrescar"}
                  </Button>
                </div>

                {campLoading && (
                  <div className="p-3 text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
                  </div>
                )}
                {!campLoading && (camps?.data || []).length === 0 && (
                  <div className="p-3 text-sm text-muted-foreground">No hay campañas todavía.</div>
                )}

                <div className="space-y-2">
                  {(camps?.data || []).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCampaignId(c.id)}
                      className={`w-full text-left rounded-xl border px-3 py-3 transition ${
                        selectedCampaignId === c.id ? "bg-gradient-to-r from-primary/10 to-habaluna-mint/10 border-primary/30" : "bg-background hover:bg-secondary/40"
                      }`}
                      type="button"
                    >
                      <p className="text-sm font-semibold text-foreground line-clamp-2">{c.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {c.status} {c.sentAt ? `• ${new Date(c.sentAt).toLocaleString()}` : ""}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md lg:col-span-2">
              <CardContent className="p-5 space-y-5">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label>Nombre (opcional)</Label>
                    <Input value={campName} onChange={(e) => setCampName(e.target.value)} placeholder="Promo enero" />
                  </div>
                  <div>
                    <Label>Asunto</Label>
                    <Input value={campSubject} onChange={(e) => setCampSubject(e.target.value)} placeholder="Oferta especial..." />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Preheader</Label>
                    <Input value={campPreheader} onChange={(e) => setCampPreheader(e.target.value)} placeholder="Texto corto que aparece en la bandeja..." />
                  </div>
                  <div className="md:col-span-2">
                    <Label>HTML (soporta variables: {{firstName}}, {{email}})</Label>
                    <Textarea value={campHtml} onChange={(e) => setCampHtml(e.target.value)} className="min-h-48 font-mono text-xs" />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Texto plano (opcional)</Label>
                    <Textarea value={campText} onChange={(e) => setCampText(e.target.value)} className="min-h-20" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                  <div className="flex gap-2">
                    <Button
                      onClick={selectedCampaignId ? handleSaveCampaign : handleCreateCampaign}
                      disabled={campSaving || !campSubject.trim() || !campHtml.trim()}
                      className="bg-gradient-to-r from-primary to-habaluna-blue-dark hover:opacity-90 text-primary-foreground shadow-lg"
                    >
                      {campSaving ? "Guardando..." : selectedCampaignId ? "Guardar campaña" : "Crear campaña"}
                    </Button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input value={testTo} onChange={(e) => setTestTo(e.target.value)} placeholder="Email para prueba" />
                    <Button variant="outline" onClick={handleSendTest} disabled={!selectedCampaignId || sendingTest || !testTo.trim()}>
                      {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Enviar test
                    </Button>
                    <Button
                      onClick={handleSendCampaign}
                      disabled={!selectedCampaignId || sendingCampaign}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-700 text-white hover:opacity-90"
                    >
                      {sendingCampaign ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Enviar campaña
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border bg-background/60">
                  <div className="p-3 border-b text-sm text-muted-foreground">Preview (se envuelve con el template de Habaluna en el backend)</div>
                  <div className="p-4">
                    <div className="rounded-lg border bg-white">
                      {previewHtml ? (
                        <div
                          className="p-4 text-sm"
                          // Preview del contenido (no del wrapper completo).
                          // El wrapper final se ve igual en el email real.
                          dangerouslySetInnerHTML={{ __html: previewHtml }}
                        />
                      ) : (
                        <div className="p-4 text-sm text-muted-foreground">No hay contenido para previsualizar.</div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Nota: el email real incluye logo, colores, footer y link de baja (unsubscribe).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

