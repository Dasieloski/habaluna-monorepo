"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="pt-16 pb-12 md:pt-20 md:pb-16">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-16">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="hidden md:inline-block mb-6">
                <Image src="/uploads/logo.png" alt="Habaluna" width={180} height={64} className="h-12 w-auto" />
              </Link>
              <p className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
                <Image src="/flags/cuba.png" alt="Cuba" width={20} height={14} className="h-4 w-auto rounded-sm" />
                Envíos en Cuba
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-foreground text-sm">Ayuda</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-primary transition-colors">
                    Servicio al Cliente
                  </Link>
                </li>
                <li>
                  <Link href="/payment" className="hover:text-primary transition-colors">
                    Métodos de pago
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-foreground text-sm">Sobre Habaluna</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors">
                    Quiénes somos
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-primary transition-colors">
                    Política de Cookies
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-primary transition-colors">
                    Gastos de envío
                  </Link>
                </li>
                <li>
                  <Link href="/tracking" className="hover:text-primary transition-colors">
                    Seguimiento de pedido
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="hover:text-primary transition-colors">
                    Devoluciones
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-6 text-foreground text-sm">Pago seguro</h4>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                {/* Logo en móvil, al lado del bloque de pago */}
                <Link href="/" className="md:hidden shrink-0">
                  <Image
                    src="/uploads/logo.png"
                    alt="Habaluna"
                    width={240}
                    height={86}
                    className="h-16 w-auto"
                    priority
                  />
                </Link>

                <div className="flex flex-wrap gap-3">
                {[
                  { label: "VISA", icon: "/payments/visa.svg", w: 44, h: 16 },
                  { label: "Mastercard", icon: "/payments/mastercard.svg", w: 56, h: 16 },
                  { label: "PayPal", icon: "/payments/paypal.svg", w: 52, h: 16 },
                  { label: "Apple Pay", icon: "/payments/applepay.svg", w: 56, h: 16 },
                ].map((m) => (
                  <div key={m.label} className="bg-muted/50 border border-border px-3 py-2 rounded-lg flex items-center gap-2">
                    <Image 
                      src={m.icon} 
                      alt={m.label} 
                      width={m.w} 
                      height={m.h} 
                      className="h-4 w-auto" 
                      unoptimized={true}
                    />
                    <span className="text-xs font-medium">{m.label}</span>
                  </div>
                ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border py-6 md:py-8">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              <Link href="/terms" className="hover:text-primary transition-colors">
                Términos y condiciones
              </Link>
              <Link href="/privacy" className="hover:text-primary transition-colors">
                Privacidad
              </Link>
              <Link href="/company" className="hover:text-primary transition-colors">
                Aviso legal
              </Link>
            </div>
            <p>© {new Date().getFullYear()} Habaluna</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
