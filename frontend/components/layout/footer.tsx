"use client"

import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      {/* Main footer */}
      <div className="pt-12 pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {/* Logo and language */}
            <div className="col-span-2 md:col-span-1">
              {/* En móvil movemos el logo al bloque "Pago seguro" para evitar huecos */}
              <Link href="/" className="hidden md:inline-block mb-5">
                <Image src="/uploads/logo.png" alt="Habaluna" width={180} height={64} className="h-12 w-auto" />
              </Link>
              <p className="flex items-center gap-2 mt-5 text-sm text-muted-foreground">
                <Image src="/flags/cuba.png" alt="Cuba" width={20} height={14} className="h-4 w-auto rounded-sm" />
                Envíos en Cuba
              </p>
            </div>

            {/* Links columns */}
            <div>
              <h4 className="font-bold mb-5 text-foreground">Ayuda</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
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
              <h4 className="font-bold mb-5 text-foreground">Sobre Habaluna</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
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
              <h4 className="font-bold mb-5 text-foreground">Pago seguro</h4>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
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

                <div className="flex flex-wrap gap-2">
                {[
                  { label: "VISA", icon: "/payments/visa.svg", w: 44, h: 16 },
                  { label: "Mastercard", icon: "/payments/mastercard.svg", w: 56, h: 16 },
                  { label: "PayPal", icon: "/payments/paypal.svg", w: 52, h: 16 },
                  { label: "Apple Pay", icon: "/payments/applepay.svg", w: 56, h: 16 },
                ].map((m) => (
                  <div key={m.label} className="bg-card border border-border px-3 py-2 rounded-lg flex items-center gap-2 transition-colors hover:border-primary/30 hover:bg-primary/5">
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

      {/* Bottom bar */}
      <div className="border-t border-border pt-6 pb-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center justify-center gap-5">
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
