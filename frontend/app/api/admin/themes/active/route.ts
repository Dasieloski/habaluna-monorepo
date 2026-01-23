import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/themes/active`, {
      headers: {
        // TODO: Agregar autenticación cuando esté disponible
      }
    })

    if (!response.ok) {
      // Si no hay tema activo, devolver null
      return NextResponse.json(null)
    }

    const theme = await response.json()
    return NextResponse.json(theme)
  } catch (error) {
    console.error('Error fetching active theme:', error)
    return NextResponse.json(null)
  }
}