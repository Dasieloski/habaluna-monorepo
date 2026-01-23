import { NextResponse } from 'next/server'
import { fetchJsonWithAuth, getApiBaseUrlLazy } from '@/lib/api'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { enabled } = body
    const finalUrl = `${getApiBaseUrlLazy()}/api/admin/themes/${params.id}/toggle`

    const response = await fetchJsonWithAuth(finalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    })

    const theme = await response.json()
    return NextResponse.json(theme)
  } catch (error: any) {
    console.error('Error toggling theme:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to toggle theme' },
      { status: error.status || 500 }
    )
  }
}