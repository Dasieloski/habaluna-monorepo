import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/themes/scheduled`, {
      headers: {
        // TODO: Agregar autenticación cuando esté disponible
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch scheduled themes')
    }

    const schedules = await response.json()
    return NextResponse.json(schedules)
  } catch (error) {
    console.error('Error fetching scheduled themes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scheduled themes' },
      { status: 500 }
    )
  }
}