import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { enabled } = body

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/themes/${params.id}/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Agregar autenticación cuando esté disponible
      },
      body: JSON.stringify({ enabled })
    })

    if (!response.ok) {
      throw new Error('Failed to toggle theme')
    }

    const theme = await response.json()
    return NextResponse.json(theme)
  } catch (error) {
    console.error('Error toggling theme:', error)
    return NextResponse.json(
      { error: 'Failed to toggle theme' },
      { status: 500 }
    )
  }
}