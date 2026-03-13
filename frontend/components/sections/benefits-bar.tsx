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
        <div 
          className="rounded-3xl p-8 md:p-12 backdrop-blur-xl"
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(200, 230, 255, 0.4) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 32px 80px rgba(15, 23, 42, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
          }}
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon
              return (
                <div 
                  key={index} 
                  className="group rounded-2xl p-8 text-center transition-all duration-300 hover:scale-105 hover:-translate-y-2 cursor-pointer"
                  style={{
                    background: "rgba(255, 255, 255, 0.6)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    boxShadow: "0 8px 32px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                  }}
                >
                  {/* Icon with gradient background */}
                  <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 group-hover:shadow-lg group-hover:shadow-cyan-500/30"
                    style={{
                      background: "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(34, 211, 238, 0.1) 100%)",
                      border: "1px solid rgba(59, 130, 246, 0.25)",
                    }}
                  >
                    <IconComponent className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  
                  {/* Text content */}
                  <h3 className="mb-3 font-heading text-lg font-bold tracking-tight text-slate-900 dark:text-white transition-colors group-hover:text-primary">
                    {benefit.title}
                  </h3>
                  <p className="mx-auto max-w-xs text-sm leading-relaxed text-slate-700 dark:text-slate-400">
                    {benefit.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
