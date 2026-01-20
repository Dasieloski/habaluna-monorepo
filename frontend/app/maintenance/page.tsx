"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from "framer-motion"
import { Wrench, Construction, Boxes, BellRing } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

const SCENES = [
  { title: "La tienda por dentro", subtitle: "Estanterías vacías… por ahora." },
  { title: "Ups… se nos cayeron los productos", subtitle: "Estamos reordenando los precios… uno se nos escapó 😅" },
  { title: "Casi listo", subtitle: "Todo vuelve a su lugar. ¿Te avisamos cuando abramos?" },
]

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export default function MaintenancePage() {
  const prefersReducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [scene, setScene] = useState(0)

  const [email, setEmail] = useState("")
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    try {
      const existing = window.localStorage.getItem("habanaluna_notify_email") || ""
      if (existing) {
        setEmail(existing)
        setSaved(true)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onScroll = () => {
      const h = el.clientHeight || 1
      const next = clamp(Math.round(el.scrollTop / h), 0, SCENES.length - 1)
      setScene(next)
    }

    onScroll()
    el.addEventListener("scroll", onScroll, { passive: true })
    return () => el.removeEventListener("scroll", onScroll as any)
  }, [])

  const { scrollYProgress } = useScroll({ container: containerRef })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25, mass: 0.8 })
  const progressWidth = useTransform(progress, [0, 1], ["0%", "100%"])

  const floatingProducts = useMemo(
    () => [
      { label: "🍍", x: "12%", y: "20%" },
      { label: "🥑", x: "78%", y: "16%" },
      { label: "🧴", x: "86%", y: "62%" },
      { label: "🍫", x: "10%", y: "70%" },
      { label: "🧃", x: "52%", y: "30%" },
    ],
    []
  )

  const saveEmail = async () => {
    const value = email.trim()
    setSaved(false)
    if (!value) return

    setSaving(true)
    try {
      window.localStorage.setItem("habanaluna_notify_email", value)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* barra superior + progreso */}
      <div className="sticky top-0 z-20 border-b bg-background/60 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">Estamos en mantenimiento</p>
              <p className="text-xs text-muted-foreground truncate">
                {SCENES[scene]?.subtitle ?? "Volvemos en breve. Gracias por tu paciencia."}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Construction className="w-4 h-4" />
              {scene + 1}/{SCENES.length}
            </span>
          </div>
        </div>
        <div className="h-1 w-full bg-secondary/60">
          <motion.div className="h-1 bg-primary" style={{ width: progressWidth }} />
        </div>
      </div>

      {/* contenedor scrolleable con escenas */}
      <div
        ref={containerRef}
        className="h-[calc(100vh-57px)] overflow-y-auto snap-y snap-mandatory scroll-smooth"
        style={{ WebkitOverflowScrolling: "touch" as any }}
      >
        {/* Decoración global */}
        {!prefersReducedMotion && (
          <div className="pointer-events-none fixed inset-0 -z-10 opacity-60">
            {floatingProducts.map((p, idx) => (
              <motion.div
                key={idx}
                className="absolute text-2xl drop-shadow"
                style={{ left: p.x, top: p.y }}
                animate={{ y: [0, -10, 0], rotate: [0, -2, 0] }}
                transition={{ duration: 3 + idx * 0.4, repeat: Infinity, ease: "easeInOut" }}
              >
                {p.label}
              </motion.div>
            ))}
          </div>
        )}

        {/* Escena 1 */}
        <section className="snap-start h-[calc(100vh-57px)] flex items-center">
          <div className="mx-auto max-w-6xl px-4 w-full grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 backdrop-blur px-3 py-1 text-xs text-muted-foreground">
                <Boxes className="w-4 h-4" />
                Escena 1 — La tienda “por dentro”
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground">
                Estamos “adentro” arreglando la tienda.
              </h1>
              <p className="mt-3 text-muted-foreground max-w-prose">
                No es cierre: es mejora. Estamos ordenando estanterías, revisando precios y dejando todo listo para que la
                compra sea más rápida y bonita.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Tip: desliza hacia abajo — cada scroll es una mini escena.
              </p>
            </div>

            <div className="relative rounded-2xl border bg-background/70 backdrop-blur shadow-2xl p-6 overflow-hidden">
              <div className="absolute inset-0 bg-card" />
              <div className="relative">
                <div className="grid gap-3">
                  {/* estanterías */}
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-16 rounded-xl border bg-secondary/30 relative overflow-hidden">
                      <div className="absolute bottom-0 left-0 right-0 h-3 bg-secondary/60" />
                      <div className="absolute left-4 top-4 h-2 w-24 rounded bg-muted/60" />
                      <div className="absolute left-4 top-9 h-2 w-16 rounded bg-muted/50" />
                    </div>
                  ))}
                </div>

                {/* caja caminando */}
                {!prefersReducedMotion ? (
                  <motion.div
                    className="absolute -bottom-1 left-4 text-3xl"
                    animate={{ x: [0, 220, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    aria-hidden
                  >
                    📦
                  </motion.div>
                ) : (
                  <div className="absolute -bottom-1 left-4 text-3xl" aria-hidden>
                    📦
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Escena 2 */}
        <section className="snap-start h-[calc(100vh-57px)] flex items-center">
          <div className="mx-auto max-w-6xl px-4 w-full grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 backdrop-blur px-3 py-1 text-xs text-muted-foreground">
                <Construction className="w-4 h-4" />
                Escena 2 — Caos controlado
              </div>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground">Ups… algo chocó con el cartel de “cerrado”.</h2>
              <p className="mt-3 text-muted-foreground max-w-prose">
                Un carrito se emocionó demasiado y tiró un par de cositas. Tranquilo: el equipo (y un bot) ya lo está arreglando.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">Microcopy del día: “Estamos reordenando los precios… uno se nos escapó 😅”</p>
            </div>

            <div className="relative rounded-2xl border bg-background/70 backdrop-blur shadow-2xl p-6 overflow-hidden">
              <div className="absolute inset-0 bg-card" />
              <div className="relative h-80">
                {/* cartel */}
                <div className="absolute right-6 top-6 rounded-xl border bg-background/80 px-4 py-3 shadow">
                  <p className="text-sm font-semibold text-foreground">CERRADO</p>
                  <p className="text-xs text-muted-foreground">Volvemos pronto</p>
                </div>

                {/* carrito chocando */}
                {!prefersReducedMotion ? (
                  <motion.div
                    className="absolute left-0 top-20 text-4xl"
                    animate={{ x: [0, 210, 185, 210, 185], rotate: [0, 0, -6, 0, -6] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                    aria-hidden
                  >
                    🛒💥
                  </motion.div>
                ) : (
                  <div className="absolute left-0 top-20 text-4xl" aria-hidden>
                    🛒💥
                  </div>
                )}

                {/* bot arreglando */}
                {!prefersReducedMotion ? (
                  <motion.div
                    className="absolute left-10 bottom-6 text-4xl"
                    animate={{ y: [0, -6, 0], rotate: [0, 2, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    aria-hidden
                  >
                    🤖🔧
                  </motion.div>
                ) : (
                  <div className="absolute left-10 bottom-6 text-4xl" aria-hidden>
                    🤖🔧
                  </div>
                )}

                {/* productos cayendo */}
                {!prefersReducedMotion && (
                  <>
                    {["🍍", "🥑", "🍫", "🧃", "🧴"].map((e, idx) => (
                      <motion.div
                        key={idx}
                        className="absolute text-3xl"
                        style={{ left: `${30 + idx * 12}%`, top: 0 }}
                        initial={false}
                        animate={scene === 1 ? { y: [0, 240, 220], rotate: [0, 12, -6] } : { y: 0, opacity: 0 }}
                        transition={{ duration: 1.2, delay: idx * 0.08, ease: "easeOut" }}
                        aria-hidden
                      >
                        {e}
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Escena 3 */}
        <section className="snap-start h-[calc(100vh-57px)] flex items-center">
          <div className="mx-auto max-w-6xl px-4 w-full grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 backdrop-blur px-3 py-1 text-xs text-muted-foreground">
                <BellRing className="w-4 h-4" />
                Escena 3 — Todo listo
              </div>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-foreground">Ya casi abrimos.</h2>
              <p className="mt-3 text-muted-foreground max-w-prose">
                Estamos dejando los productos en su sitio y afinando detalles para que cuando entres, todo funcione perfecto.
              </p>

              <div className="mt-6 rounded-2xl border bg-background/70 backdrop-blur p-5 shadow-lg">
                <p className="text-sm font-semibold text-foreground">Avísame cuando abran</p>
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
                      className="mt-2 text-xs text-emerald-700 dark:text-emerald-400"
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

            <div className="relative rounded-2xl border bg-background/70 backdrop-blur shadow-2xl p-6 overflow-hidden">
              <div className="absolute inset-0 bg-card" />
              <div className="relative h-80">
                <div className="absolute left-6 top-6 rounded-xl border bg-background/80 px-4 py-3 shadow">
                  <p className="text-sm font-semibold text-foreground">Re-stock</p>
                  <p className="text-xs text-muted-foreground">Volviendo a su lugar…</p>
                </div>

                {/* productos flotando y “volviendo” */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {!prefersReducedMotion ? (
                    <>
                      {["🍍", "🥑", "🍫", "🧃", "🧴", "🍯"].map((e, idx) => (
                        <motion.div
                          key={idx}
                          className="absolute text-4xl drop-shadow"
                          style={{
                            left: `${18 + (idx % 3) * 28}%`,
                            top: `${22 + Math.floor(idx / 3) * 26}%`,
                          }}
                          animate={{ y: [0, -12, 0], rotate: [0, 2, 0] }}
                          transition={{ duration: 2.6 + idx * 0.2, repeat: Infinity, ease: "easeInOut" }}
                          aria-hidden
                        >
                          {e}
                        </motion.div>
                      ))}
                    </>
                  ) : (
                    <div className="text-4xl" aria-hidden>
                      🍍🥑🍫🧃🧴🍯
                    </div>
                  )}
                </div>

                {/* personaje “arreglando” */}
                {!prefersReducedMotion ? (
                  <motion.div
                    className="absolute right-8 bottom-8 text-4xl"
                    animate={{ rotate: [0, -3, 0], y: [0, -4, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    aria-hidden
                  >
                    🧑‍🔧✨
                  </motion.div>
                ) : (
                  <div className="absolute right-8 bottom-8 text-4xl" aria-hidden>
                    🧑‍🔧✨
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

