import Link from "next/link"
import { Wrench, Lock } from "lucide-react"

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-habaluna-blue via-background to-habaluna-mint flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-2xl border bg-background/80 backdrop-blur shadow-2xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-habaluna-blue-dark flex items-center justify-center text-primary-foreground shadow">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Estamos en mantenimiento</h1>
            <p className="text-sm text-muted-foreground">Volvemos en breve. Gracias por tu paciencia.</p>
          </div>
        </div>

        <div className="rounded-xl border bg-secondary/30 p-4 text-sm text-muted-foreground">
          <p>
            El sitio está temporalmente en modo mantenimiento para aplicar mejoras.
            Por seguridad, la navegación pública está deshabilitada.
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-4 h-4" />
            Acceso restringido
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold bg-gradient-to-r from-primary to-habaluna-blue-dark text-primary-foreground hover:opacity-90 transition"
          >
            Ir al panel admin
          </Link>
        </div>
      </div>
    </div>
  )
}

