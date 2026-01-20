"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Rocket, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

export default function ComingSoonPage() {
  const prefersReducedMotion = useReducedMotion()
  const [email, setEmail] = useState("")
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    try {
      const existing = window.localStorage.getItem("habanaluna_comingsoon_email") || ""
      if (existing) {
        setEmail(existing)
        setSaved(true)
      }
    } catch {
      // ignore
    }
  }, [])

  const saveEmail = async () => {
    const value = email.trim()
    setSaved(false)
    if (!value) return
    setSaving(true)
    try {
      window.localStorage.setItem("habanaluna_comingsoon_email", value)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* brillos */}
      {!prefersReducedMotion && (
        <>
          <motion.div
            className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl"
            animate={{ x: [0, 30, 0], y: [0, 18, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="pointer-events-none absolute -bottom-28 -right-28 h-96 w-96 rounded-full bg-accent/25 blur-3xl"
            animate={{ x: [0, -24, 0], y: [0, -16, 0] }}
            transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">
          <div className="rounded-2xl border bg-background/75 backdrop-blur shadow-2xl p-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow">
                <Rocket className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Próximamente</h1>
                <p className="text-sm text-muted-foreground">Estamos preparando el lanzamiento. Falta poquito.</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border bg-secondary/25 p-4 text-sm text-muted-foreground">
              <p>
                La tienda está en modo <span className="font-semibold text-foreground">“Próximamente”</span>. La navegación pública está
                deshabilitada hasta el lanzamiento.
              </p>
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                ¿Te avisamos cuando abramos?
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Guardamos tu correo localmente en este navegador (no se envía aún).</p>

              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <Input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setSaved(false)
                  }}
                  aria-label="Correo para avisarme"
                />
                <Button onClick={saveEmail} disabled={saving || !email.trim()} className="bg-primary">
                  {saving ? "Guardando..." : "Avísame"}
                </Button>
              </div>

              <AnimatePresence>
                {saved && (
                  <motion.p
                    className="mt-2 text-xs text-emerald-700 dark:text-accent"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2 }}
                  >
                    Listo: te avisaremos en cuanto esté todo en vivo.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* lado visual */}
          <div className="relative rounded-2xl border bg-background/60 backdrop-blur shadow-2xl p-8 overflow-hidden min-h-[380px]">
            <div className="absolute inset-0 bg-card" />

            <div className="relative h-full flex items-center justify-center">
              {!prefersReducedMotion ? (
                <>
                  {/* órbitas */}
                  <motion.div
                    className="absolute h-72 w-72 rounded-full border border-primary/20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
                    aria-hidden
                  />
                  <motion.div
                    className="absolute h-56 w-56 rounded-full border border-accent/25"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
                    aria-hidden
                  />

                  {/* cohete */}
                  <motion.div
                    className="text-6xl drop-shadow"
                    animate={{ y: [0, -16, 0], rotate: [0, -2, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    aria-hidden
                  >
                    🚀
                  </motion.div>

                  {/* estrellitas */}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute text-xl"
                      style={{
                        left: `${10 + (i * 8) % 80}%`,
                        top: `${12 + (i * 13) % 76}%`,
                      }}
                      animate={{ opacity: [0.2, 1, 0.2], scale: [0.9, 1.15, 0.9] }}
                      transition={{ duration: 1.8 + (i % 4) * 0.3, repeat: Infinity, ease: "easeInOut" }}
                      aria-hidden
                    >
                      ✨
                    </motion.div>
                  ))}
                </>
              ) : (
                <div className="text-6xl" aria-hidden>
                  🚀
                </div>
              )}
            </div>

            <p className="relative mt-6 text-center text-xs text-muted-foreground">
              “Estamos cocinando algo bonito… y sí, huele a estreno.”
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

