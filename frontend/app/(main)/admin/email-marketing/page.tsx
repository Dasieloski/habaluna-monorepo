"use client"

import { useEffect, useMemo, useState } from "react"
import { api, type EmailCampaign, type NewsletterSubscriber, type PagedResponse } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, MailPlus, Send, Users, FileText, Eye, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type TemplateCategory = "welcome" | "password-reset" | "campaign" | "promotion" | "newsletter" | "all"

interface EmailTemplate {
  id: string
  name: string
  category: string
  description: string
  html: string
}

export default function AdminEmailMarketingPage() {
  const { toast } = useToast()
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
  const [campHtml, setCampHtml] = useState("")
  const [campText, setCampText] = useState("")

  // Templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [templateCategory, setTemplateCategory] = useState<TemplateCategory>("all")
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null)
  const [templatePreviewHtml, setTemplatePreviewHtml] = useState<string>("")

  // Full email preview
  const [fullPreviewHtml, setFullPreviewHtml] = useState<string>("")
  const [previewLoading, setPreviewLoading] = useState(false)
  const [showFullPreview, setShowFullPreview] = useState(false)

  const loadSubscribers = async () => {
    setSubLoading(true)
    try {
      const res = await api.getEmailSubscribers({ search: subSearch || undefined, page: 1, limit: 50 })
      setSubs(res)
    } catch (e: any) {
      toast({ title: "Ups… no cargaron los suscriptores 😅", description: e?.response?.data?.message || e?.message || "Intenta de nuevo.", variant: "destructive" })
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
      toast({ title: "Ups… no cargaron las campañas 😅", description: e?.response?.data?.message || e?.message || "Intenta de nuevo.", variant: "destructive" })
    } finally {
      setCampLoading(false)
    }
  }

  const loadTemplates = async (category?: string) => {
    setTemplatesLoading(true)
    try {
      const res = await api.getEmailTemplates(category)
      setTemplates(res)
    } catch (e: any) {
      toast({ title: "Ups… no cargaron las plantillas 😅", description: e?.response?.data?.message || e?.message || "Intenta de nuevo.", variant: "destructive" })
    } finally {
      setTemplatesLoading(false)
    }
  }

  const loadFullPreview = async () => {
    if (!campSubject.trim() || !campHtml.trim()) {
      toast({ title: "Falta algo 👀", description: "Pon asunto y contenido HTML para previsualizar.", variant: "destructive" })
      return
    }

    setPreviewLoading(true)
    try {
      const res = await api.previewEmailCampaign({
        subject: campSubject,
        preheader: campPreheader || undefined,
        html: campHtml,
      })
      setFullPreviewHtml(res.html)
      setShowFullPreview(true)
    } catch (e: any) {
      toast({ title: "Error", description: e?.response?.data?.message || e?.message || "No se pudo generar el preview.", variant: "destructive" })
    } finally {
      setPreviewLoading(false)
    }
  }

  const previewTemplate = async (templateId: string) => {
    setPreviewTemplateId(templateId)
    try {
      const template = await api.getEmailTemplate(templateId)
      const rendered = await api.renderEmailTemplate(templateId, {
        firstName: "Cliente",
        email: "cliente@email.com",
        frontendUrl: window.location.origin,
        subject: "Ejemplo de Asunto",
        content: "Este es un ejemplo de contenido para la plantilla.",
        resetUrl: `${window.location.origin}/auth/reset-password/token`,
      })
      setTemplatePreviewHtml(rendered.html)
    } catch (e: any) {
      toast({ title: "Ups… no se pudo previsualizar 😅", description: e?.response?.data?.message || e?.message || "Intenta de nuevo.", variant: "destructive" })
    }
  }

  const selectTemplate = async (templateId: string) => {
    try {
      const template = await api.getEmailTemplate(templateId)
      setCampHtml(template.html)
      setSelectedTemplateId(templateId)
      toast({ title: "Éxito", description: `Plantilla "${template.name}" cargada. Puedes editarla antes de guardar.` })
    } catch (e: any) {
      toast({ title: "Ups… no cargó la plantilla 😅", description: e?.response?.data?.message || e?.message || "Intenta de nuevo.", variant: "destructive" })
    }
  }

  useEffect(() => {
    void loadSubscribers()
  }, [])

  useEffect(() => {
    void loadCampaigns()
  }, [])

  useEffect(() => {
    void loadTemplates(templateCategory === "all" ? undefined : templateCategory)
  }, [templateCategory])

  useEffect(() => {
    if (!selectedCampaign) return
    setCampName(selectedCampaign.name || "")
    setCampSubject(selectedCampaign.subject || "")
    setCampPreheader(selectedCampaign.preheader || "")
    setCampHtml(selectedCampaign.html || "")
    setCampText(selectedCampaign.text || "")
    setSelectedTemplateId(null)
  }, [selectedCampaignId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddSubscriber = async () => {
    setSubSaving(true)
    try {
      await api.upsertEmailSubscriber({
        email: newEmail.trim(),
        firstName: newFirstName.trim() || undefined,
        lastName: newLastName.trim() || undefined,
      })
      toast({ title: "¡Suscriptor guardado! ✅", description: "Quedó en la lista." })
      setNewEmail("")
      setNewFirstName("")
      setNewLastName("")
      await loadSubscribers()
    } catch (e: any) {
      toast({ title: "Ups… no se pudo guardar 😅", description: e?.response?.data?.message || e?.message || "Intenta de nuevo.", variant: "destructive" })
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
      toast({ title: "Ups… no se pudo actualizar 😅", description: e?.response?.data?.message || e?.message || "Intenta de nuevo.", variant: "destructive" })
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
      toast({ title: "¡Campaña creada! 🎉", description: "Ya está en la lista." })
      await loadCampaigns()
      setSelectedCampaignId(c.id)
    } catch (e: any) {
      toast({ title: "Ups… no se pudo crear la campaña 😅", description: e?.response?.data?.message || e?.message || "Intenta de nuevo.", variant: "destructive" })
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
      toast({ title: "¡Campaña guardada! ✅", description: "Cambios aplicados." })
      await loadCampaigns()
    } catch (e: any) {
      toast({ title: "Ups… no se pudo guardar la campaña 😅", description: e?.response?.data?.message || e?.message || "Intenta de nuevo.", variant: "destructive" })
    } finally {
      setCampSaving(false)
    }
  }

  const [testTo, setTestTo] = useState("")
  const [sendingTest, setSendingTest] = useState(false)
  const [sendingCampaign, setSendingCampaign] = useState(false)

  const handleSendTest = async () => {
    if (!selectedCampaignId) return
    setSendingTest(true)
    try {
      await api.sendTestEmailCampaign(selectedCampaignId, testTo.trim())
      toast({ title: "Éxito", description: "Correo de prueba enviado." })
    } catch (e: any) {
      toast({ title: "Ups… no se envió la prueba 😅", description: e?.response?.data?.message || e?.message || "Intenta de nuevo.", variant: "destructive" })
    } finally {
      setSendingTest(false)
    }
  }

  const handleSendCampaign = async () => {
    if (!selectedCampaignId) return
    setSendingCampaign(true)
    try {
      await api.sendEmailCampaign(selectedCampaignId)
      toast({ title: "¡Envío en marcha! 🚀", description: "En unos minutos revisa el estado." })
      await loadCampaigns()
    } catch (e: any) {
      toast({ title: "Ups… no arrancó el envío 😅", description: e?.response?.data?.message || e?.message || "Intenta de nuevo.", variant: "destructive" })
    } finally {
      setSendingCampaign(false)
    }
  }

  // Preview HTML básico (solo contenido, sin wrapper)
  const basicPreviewHtml = useMemo(() => {
    try {
      if (!campHtml || typeof campHtml !== "string") return ""
      let processed = String(campHtml)
      processed = processed.replace(/\{\{\s*firstName\s*\}\}/g, "Cliente")
      processed = processed.replace(/\{\{\s*email\s*\}\}/g, "cliente@email.com")
      processed = processed.replace(/\{\{\s*frontendUrl\s*\}\}/g, window.location.origin)
      processed = processed.replace(/\{\{\s*subject\s*\}\}/g, campSubject || "Asunto")
      processed = processed.replace(/\{\{\s*content\s*\}\}/g, "Contenido del mensaje")
      processed = processed.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      return processed
    } catch (error) {
      console.error("Error procesando preview HTML:", error)
      return ""
    }
  }, [campHtml, campSubject])

  const categoryLabels: Record<TemplateCategory, string> = {
    all: "Todas",
    welcome: "Bienvenida",
    "password-reset": "Recuperación",
    campaign: "Campañas",
    promotion: "Promociones",
    newsletter: "Newsletter",
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Marketing</h1>
          <p className="text-sm text-muted-foreground">Campañas, suscriptores, plantillas y envío masivo.</p>
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
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg"
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
                        selectedCampaignId === c.id ? "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30" : "bg-background hover:bg-secondary/40"
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
                {/* Selector de Plantillas */}
                <Card className="border-2 border-dashed">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <CardTitle className="text-lg">Plantillas Predefinidas</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-2">
                      <Label>Categoría</Label>
                      <Select value={templateCategory} onValueChange={(v) => setTemplateCategory(v as TemplateCategory)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(categoryLabels) as TemplateCategory[]).map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {categoryLabels[cat]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {templatesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : templates.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No hay plantillas en esta categoría.</p>
                    ) : (
                      <div className="grid gap-3">
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-foreground">{template.name}</h4>
                                  {selectedTemplateId === template.id && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Seleccionada</span>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mb-3">{template.description}</p>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => selectTemplate(template.id)}
                                    className="flex-1"
                                  >
                                    <FileText className="w-3 h-3 mr-1" />
                                    Usar
                                  </Button>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => previewTemplate(template.id)}
                                      >
                                        <Eye className="w-3 h-3 mr-1" />
                                        Vista Previa
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                      <DialogHeader>
                                        <DialogTitle>{template.name}</DialogTitle>
                                        <DialogDescription>{template.description}</DialogDescription>
                                      </DialogHeader>
                                      {templatePreviewHtml && previewTemplateId === template.id ? (
                                        <div
                                          className="border rounded-lg p-4 bg-white"
                                          dangerouslySetInnerHTML={{ __html: templatePreviewHtml }}
                                        />
                                      ) : (
                                        <div className="flex items-center justify-center py-8">
                                          <Loader2 className="w-6 h-6 animate-spin" />
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

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
                    <div className="flex items-center justify-between mb-2">
                      <Label>HTML (soporta variables: {"{{firstName}}"}, {"{{email}}"}, {"{{frontendUrl}}"})</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadFullPreview}
                        disabled={previewLoading || !campSubject.trim() || !campHtml.trim()}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview Completo
                      </Button>
                    </div>
                    <Textarea value={campHtml} onChange={(e) => setCampHtml(e.target.value)} className="min-h-64 font-mono text-xs" />
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
                      className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground shadow-lg"
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

                {/* Preview Básico */}
                <Card className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Vista Previa del Contenido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {basicPreviewHtml ? (
                      <div
                        className="rounded-lg border bg-white p-4"
                        style={{ minHeight: "200px" }}
                        dangerouslySetInnerHTML={{ __html: basicPreviewHtml }}
                      />
                    ) : (
                      <div className="rounded-lg border bg-muted/50 p-8 text-center text-sm text-muted-foreground">
                        Agrega contenido HTML para ver la vista previa
                      </div>
                    )}
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para Preview Completo */}
      <Dialog open={showFullPreview} onOpenChange={setShowFullPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa Completa del Email</DialogTitle>
            <DialogDescription>
              Así se verá el email cuando se envíe (incluye logo, colores y footer de Habanaluna)
            </DialogDescription>
          </DialogHeader>
          {previewLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : fullPreviewHtml ? (
            <div
              className="border rounded-lg bg-white"
              dangerouslySetInnerHTML={{ __html: fullPreviewHtml }}
            />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No hay preview disponible
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
