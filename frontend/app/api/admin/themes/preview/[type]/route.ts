import { NextResponse } from 'next/server'
import { fetchJsonWithAuth, getApiBaseUrlLazy } from '@/lib/api'

export async function GET(
  request: Request,
  { params }: { params: { type: string } }
) {
  try {
    const finalUrl = `${getApiBaseUrlLazy()}/api/admin/themes/preview/${params.type}`

    const response = await fetchJsonWithAuth(finalUrl, {
      headers: { 'Content-Type': 'application/json' },
    })

    const preview = await response.json()
    return NextResponse.json(preview)
  } catch (error: any) {
    console.error('Error fetching theme preview:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch theme preview' },
      { status: error.status || 500 }
    )
  }
}