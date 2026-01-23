import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/themes/preview/${params.type}`, {
      headers: {
        // TODO: Agregar autenticación cuando esté disponible
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch theme preview')
    }

    const preview = await response.json()
    return NextResponse.json(preview)
  } catch (error) {
    console.error('Error fetching theme preview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch theme preview' },
      { status: 500 }
    )
  }
}