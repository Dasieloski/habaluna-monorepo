import Link from "next/link"
import { InfoPage } from "@/components/pages/info-page"

export const metadata = {
  title: "Ayuda | Habaluna",
}

export default function AyudaPage() {
  return (
    <InfoPage
      title="Ayuda"
      description="Todo lo que necesitas para comprar con confianza y resolver dudas rápidamente."
      breadcrumbs={[
        { label: "Página de inicio", href: "/" },
        { label: "Ayuda" },
      ]}
      sections={[
        {
          title: "Atención al cliente",
          content: (
            <p>
              ¿Necesitas ayuda? Visita{" "}
              <Link href="/help" className="text-primary hover:underline">
                Servicio al Cliente
              </Link>
              .
            </p>
          ),
        },
        {
          title: "Información útil",
          content: (
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <Link href="/payment" className="text-primary hover:underline">
                  Métodos de pago
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-primary hover:underline">
                  Gastos de envío
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="text-primary hover:underline">
                  Seguimiento de pedido
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-primary hover:underline">
                  Devoluciones
                </Link>
              </li>
            </ul>
          ),
        },
      ]}
    />
  )
}

