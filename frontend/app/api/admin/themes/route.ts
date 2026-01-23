import { NextResponse } from 'next/server'
import { fetchJsonWithAuth, getApiBaseUrlLazy } from '@/lib/api'

export async function GET() {
  try {
    const finalUrl = `${getApiBaseUrlLazy()}/api/admin/themes`

    const response = await fetchJsonWithAuth(finalUrl, {
      headers: { 'Content-Type': 'application/json' },
    })

    const themes = await response.json()
    return NextResponse.json(themes)
  } catch (error: any) {
    console.error('Error fetching themes:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch themes' },
      { status: error.status || 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const finalUrl = `${getApiBaseUrlLazy()}/api/admin/themes`

    const response = await fetchJsonWithAuth(finalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const theme = await response.json()
    return NextResponse.json(theme)
  } catch (error: any) {
    console.error('Error creating theme:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create theme' },
      { status: error.status || 500 }
    )
  }
}