"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-slate-200/70 bg-[linear-gradient(180deg,#030712_0%,#020617_40%,#01040d_100%)] text-slate-200">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_25%,rgba(14,165,233,0.18),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(129,140,248,0.18),transparent_35%)]" />

      <div className="relative py-20 md:py-24">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
            <div className="space-y-5 md:col-span-1">
              <Link href="/" className="inline-flex rounded-2xl bg-white/95 px-3 py-2 shadow-[0_10px_30px_rgba(59,130,246,0.25)]">
                <Image src="/uploads/logo.png" alt="Habaluna" width={180} height={64} className="h-10 w-auto" />
              </Link>
              <p className="text-sm text-slate-300/85">Una experiencia de compra moderna y premium, pensada para Cuba.</p>
              <p className="flex items-center gap-2 text-sm text-slate-300/85">
                <Image src="/flags/cuba.png" alt="Cuba" width={20} height={14} className="h-4 w-auto rounded-sm" />
                Envíos en Cuba
              </p>
            </div>

            <div>
              <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Ayuda</h4>
              <ul className="space-y-3 text-sm text-slate-300/85">
                <li><Link href="/help" className="transition-colors hover:text-sky-300">Servicio al Cliente</Link></li>
                <li><Link href="/payment" className="transition-colors hover:text-sky-300">Métodos de pago</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Sobre Habaluna</h4>
              <ul className="space-y-3 text-sm text-slate-300/85">
                <li><Link href="/about" className="transition-colors hover:text-sky-300">Quiénes somos</Link></li>
                <li><Link href="/cookies" className="transition-colors hover:text-sky-300">Política de Cookies</Link></li>
                <li><Link href="/shipping" className="transition-colors hover:text-sky-300">Gastos de envío</Link></li>
                <li><Link href="/tracking" className="transition-colors hover:text-sky-300">Seguimiento de pedido</Link></li>
                <li><Link href="/returns" className="transition-colors hover:text-sky-300">Devoluciones</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">Pago seguro</h4>
              <div className="flex flex-wrap gap-2.5">
                {[
                  { label: "VISA", icon: "/payments/visa.svg", w: 44, h: 16 },
                  { label: "Mastercard", icon: "/payments/mastercard.svg", w: 56, h: 16 },
                  { label: "PayPal", icon: "/payments/paypal.svg", w: 52, h: 16 },
                  { label: "Apple Pay", icon: "/payments/applepay.svg", w: 56, h: 16 },
                ].map((m) => (
                  <div key={m.label} className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/[0.06] px-3 py-2 backdrop-blur">
                    <Image src={m.icon} alt={m.label} width={m.w} height={m.h} className="h-4 w-auto" unoptimized />
                    <span className="text-xs font-medium text-slate-100">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 py-6">
        <div className="container mx-auto max-w-6xl px-4 md:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-slate-300/80 md:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-5">
              <Link href="/terms" className="transition-colors hover:text-sky-300">Términos y condiciones</Link>
              <Link href="/privacy" className="transition-colors hover:text-sky-300">Privacidad</Link>
              <Link href="/company" className="transition-colors hover:text-sky-300">Aviso legal</Link>
            </div>
            <p>© {new Date().getFullYear()} Habaluna</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
