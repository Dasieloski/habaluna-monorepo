import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/themes`, {
      headers: {
        // TODO: Agregar autenticación cuando esté disponible
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch themes')
    }

    const themes = await response.json()
    return NextResponse.json(themes)
  } catch (error) {
    console.error('Error fetching themes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch themes' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/themes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Agregar autenticación cuando esté disponible
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      throw new Error('Failed to create theme')
    }

    const theme = await response.json()
    return NextResponse.json(theme)
  } catch (error) {
    console.error('Error creating theme:', error)
    return NextResponse.json(
      { error: 'Failed to create theme' },
      { status: 500 }
    )
  }
}