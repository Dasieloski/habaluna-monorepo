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

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/themes/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Agregar autenticación cuando esté disponible
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error('Failed to schedule theme')
    }

    const schedule = await response.json()
    return NextResponse.json(schedule)
  } catch (error) {
    console.error('Error scheduling theme:', error)
    return NextResponse.json(
      { error: 'Failed to schedule theme' },
      { status: 500 }
    )
  }
}