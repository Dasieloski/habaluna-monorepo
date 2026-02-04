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
        // Mantener íconos actuales y solo cambiar texto
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
    <section className="py-16 md:py-24 border-y border-border bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-6 text-primary rounded-lg bg-card border border-border">
                  <IconComponent className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
