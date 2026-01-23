import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/themes/initialize`, {
      method: 'POST',
      headers: {
        // TODO: Agregar autenticación cuando esté disponible
      }
    })

    if (!response.ok) {
      throw new Error('Failed to initialize themes')
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error initializing themes:', error)
    return NextResponse.json(
      { error: 'Failed to initialize themes' },
      { status: 500 }
    )
  }
}