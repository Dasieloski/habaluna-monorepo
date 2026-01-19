"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { api } from "@/lib/api"

const schema = z.object({
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe incluir al menos una mayúscula")
    .regex(/[a-z]/, "La contraseña debe incluir al menos una minúscula")
    .regex(/[0-9]/, "La contraseña debe incluir al menos un número")
    .regex(/[^A-Za-z0-9]/, "La contraseña debe incluir al menos un símbolo"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

type Form = z.infer<typeof schema>

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [code, setCode] = useState<string>("")

  useEffect(() => {
    const codeParam = searchParams.get("code")
    if (!codeParam || !/^\d{6}$/.test(codeParam)) {
      setError("Código inválido. Por favor, verifica el código primero.")
      setTimeout(() => {
        router.push("/auth/verify-code")
      }, 3000)
      return
    }
    setCode(codeParam)
  }, [searchParams, router])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    if (!code) {
      setError("Código no válido. Por favor, verifica el código primero.")
      return
    }

    try {
      setError("")
      setMessage("")
      await api.resetPassword(code, data.password)
      setMessage("Contraseña actualizada correctamente. Redirigiendo...")
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "No se pudo actualizar la contraseña."
      setError(msg)
    }
  }

  if (!code) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
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
          <span className="text-foreground">Restablecer contraseña</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 leading-tight">Restablecer contraseña</h1>
            <p className="text-muted-foreground">Ingresa tu nueva contraseña</p>
          </div>

          <div className="bg-white border border-sky-100 rounded-xl p-6 md:p-8 shadow-lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}
              {message && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
                  {message}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Nueva contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Nueva contraseña"
                  {...register("password")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition-all"
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                  Confirmar contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirmar contraseña"
                  {...register("confirmPassword")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition-all"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Actualizando..." : "Actualizar contraseña"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
