"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { api } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const schema = z.object({
  email: z.string().email("Email inválido"),
})

type Form = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [message, setMessage] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [showCodeModal, setShowCodeModal] = useState(false)
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""])
  const [codeError, setCodeError] = useState<string>("")
  const [isValidatingCode, setIsValidatingCode] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    try {
      setError("")
      setMessage("")
      const res = await api.forgotPassword(data.email)
      setMessage(res.message || "Si el correo está registrado, enviaremos un código de 6 dígitos.")
      // Abrir el modal para ingresar el código
      setShowCodeModal(true)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "No se pudo procesar la solicitud."
      setError(msg)
    }
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return // Solo un dígito por input
    if (!/^\d*$/.test(value)) return // Solo números

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    setCodeError("")

    // Auto-focus al siguiente input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-input-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()
    if (!/^\d{6}$/.test(pastedData)) {
      setCodeError("El código debe ser de 6 dígitos")
      return
    }

    const digits = pastedData.split("")
    setCode(digits)
    setCodeError("")
    
    // Focus en el último input
    const lastInput = document.getElementById("code-input-5")
    lastInput?.focus()
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    const fullCode = code.join("")
    
    if (fullCode.length !== 6) {
      setCodeError("Por favor ingresa el código completo de 6 dígitos")
      return
    }

    setIsValidatingCode(true)
    setCodeError("")

    try {
      await api.validateResetCode(fullCode)
      // Si el código es válido, redirigir a la página de reset password con el código
      router.push(`/auth/reset-password?code=${fullCode}`)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Código inválido o expirado"
      setCodeError(msg)
      // Limpiar el código en caso de error
      setCode(["", "", "", "", "", ""])
      const firstInput = document.getElementById("code-input-0")
      firstInput?.focus()
    } finally {
      setIsValidatingCode(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/50 to-white">
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
          <span className="text-foreground">Recuperar contraseña</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight">Recuperar contraseña</h1>
            <p className="text-muted-foreground">Te enviaremos un código de 6 dígitos válido por 15 minutos.</p>
          </div>

          <div className="bg-white border border-sky-100 rounded-xl p-6 md:p-8 shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
              )}
              {message && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                  {message}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-foreground">
                  Dirección E-Mail <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Dirección E-Mail"
                  {...register("email")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition-all"
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Enviando..." : "Enviar código"}
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

      {/* Modal para ingresar código de verificación */}
      <Dialog open={showCodeModal} onOpenChange={setShowCodeModal}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Ingresa el código de verificación</DialogTitle>
            <DialogDescription>
              Hemos enviado un código de 6 dígitos a tu correo electrónico. Ingresa el código para continuar.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleVerifyCode} className="space-y-4">
            {codeError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {codeError}
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
                    id={`code-input-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                    onPaste={index === 0 ? handleCodePaste : undefined}
                    className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition-all"
                    autoFocus={index === 0}
                    disabled={isValidatingCode}
                  />
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                El código expira en 15 minutos
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowCodeModal(false)
                  setCode(["", "", "", "", "", ""])
                  setCodeError("")
                }}
                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isValidatingCode}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isValidatingCode || code.join("").length !== 6}
                className="flex-1 py-2.5 px-4 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidatingCode ? "Verificando..." : "Verificar"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

