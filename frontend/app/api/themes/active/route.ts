import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Llamar al backend para obtener el tema activo
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/themes/active`, {
      cache: 'no-store' // No cachear para obtener el tema actual en tiempo real
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