import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ResetPasswordClient } from "./reset-password-client"

export const revalidate = 0

type PageProps = {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await params // Asegurar que params se resuelva
  return {
    title: "Restablecer contraseña | Habaluna",
    description: "Restablece tu contraseña de Habaluna",
    robots: "noindex, nofollow", // No indexar páginas de reset
  }
}

export default async function ResetPasswordPage({ params }: PageProps) {
  const { token } = await params

  if (!token || typeof token !== "string" || token.trim() === "") {
    notFound()
  }

  // Decodificar el token
  let decodedToken: string
  try {
    decodedToken = decodeURIComponent(token)
  } catch {
    decodedToken = token
  }

  return <ResetPasswordClient token={decodedToken} />
}
