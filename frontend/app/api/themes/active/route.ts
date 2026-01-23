import { NextResponse } from 'next/server'
import { getApiBaseUrlLazy } from '@/lib/api'

export async function GET() {
  try {
    // Llamar al backend para obtener el tema activo
    const finalUrl = `${getApiBaseUrlLazy()}/api/admin/themes/active`

    const response = await fetch(finalUrl, {
      cache: 'no-store', // No cachear para obtener el tema actual en tiempo real
      headers: { 'Content-Type': 'application/json' }
    })

    if (!response.ok) {
      // Si no hay tema activo, devolver null
      return NextResponse.json(null)
    }

    const theme = await response.json()
    return NextResponse.json(theme)
  } catch (error) {
    console.error('Error fetching active theme:', error)
    // En caso de error, devolver null (sin tema)
    return NextResponse.json(null)
  }
}