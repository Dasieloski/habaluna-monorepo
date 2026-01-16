"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"

export default function VerifyCodePage() {
  const router = useRouter()
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""])
  const [error, setError] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return // Solo un dígito por input
    if (!/^\d*$/.test(value)) return // Solo números

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setError("")

    // Auto-focus al siguiente input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()
    if (!/^\d{6}$/.test(pastedData)) {
      setError("El código debe ser de 6 dígitos")
      return
    }

    const digits = pastedData.split("")
    setCode(digits)
    setError("")
    
    // Focus en el último input
    const lastInput = document.getElementById("code-5")
    lastInput?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join("")
    
    if (fullCode.length !== 6) {
      setError("Por favor ingresa el código completo de 6 dígitos")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await api.validateResetCode(fullCode)
      // Si el código es válido, redirigir a la página de reset password con el código
      router.push(`/auth/reset-password?code=${fullCode}`)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Código inválido o expirado"
      setError(msg)
      // Limpiar el código en caso de error
      setCode(["", "", "", "", "", ""])
      const firstInput = document.getElementById("code-0")
      firstInput?.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-sky-500 transition-colors">
            Home
          </Link>
          <span>&gt;</span>
          <Link href="/auth/login" className="hover:text-sky-500 transition-colors">
            Acceso del cliente
          </Link>
          <span>&gt;</span>
          <span className="text-foreground">Verificar código</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Verificar código</h1>
            <p className="text-muted-foreground">
              Ingresa el código de 6 dígitos que recibiste por correo electrónico
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-sm font-medium text-foreground text-center">
                  Código de verificación
                </label>
                <div className="flex justify-center gap-3">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition-all"
                      autoFocus={index === 0}
                      disabled={isSubmitting}
                    />
                  ))}
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  El código expira en 15 minutos
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || code.join("").length !== 6}
                className="w-full py-3.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Verificando..." : "Verificar código"}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                <Link href="/auth/login" className="text-sky-500 hover:text-sky-600 hover:underline font-medium">
                  Volver a iniciar sesión
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
