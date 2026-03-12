"use client"

import { useEffect, useState } from "react"
import { PersonalizeIcon, ReturnIcon, TruckIcon } from "@/components/icons/streamline-icons"
import { api } from "@/lib/api"

export function BenefitsBar() {
  const defaultBenefits = [
    {
      icon: PersonalizeIcon,
      title: "VARIEDAD",
      description: "Encuentra desde alimentos hasta materiales de construcción, todo en un solo lugar.",
    },
    {
      icon: ReturnIcon,
      title: "DEVOLUCIONES GRATIS",
      description: "Tienes 30 días para devolver tu producto sin costo adicional.",
    },
    {
      icon: TruckIcon,
      title: "ENTREGA RÁPIDA",
      description: "Tu pedido sale en menos de 24h y llega en tiempo récord.",
    },
  ]

  const [benefits, setBenefits] = useState(defaultBenefits)

  useEffect(() => {
    let cancelled = false
    api
      .getUiSettings()
      .then((s) => {
        if (cancelled) return
        const list = Array.isArray((s as any)?.benefits) ? (s as any).benefits : null
        if (!list || list.length === 0) return
        const next = defaultBenefits.map((b, idx) => ({
          ...b,
          title: String(list[idx]?.title || b.title),
          description: String(list[idx]?.description || b.description),
        }))
        setBenefits(next)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="py-20 md:py-24">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="rounded-[2rem] border border-slate-200/80 bg-gradient-to-br from-white via-slate-50 to-sky-50/60 p-8 shadow-[0_32px_80px_rgba(15,23,42,0.12)] dark:border-white/10 dark:from-white/[0.07] dark:via-white/[0.03] dark:to-cyan-400/[0.04] md:p-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon
              return (
                <div key={index} className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(99,102,241,0.16)] dark:border-white/10 dark:bg-white/[0.03]">
                  <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-sky-200/90 bg-gradient-to-br from-sky-100 to-cyan-100 text-sky-700 dark:border-cyan-300/30 dark:from-cyan-300/20 dark:to-indigo-300/20 dark:text-cyan-300">
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-heading text-base font-semibold tracking-tight text-foreground md:text-lg">{benefit.title}</h3>
                  <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
