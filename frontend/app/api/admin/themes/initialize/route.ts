import { NextResponse } from 'next/server'
import { fetchJsonWithAuth, getApiBaseUrlLazy } from '@/lib/api'

export async function POST() {
  try {
    const finalUrl = `${getApiBaseUrlLazy()}/api/admin/themes/initialize`

    const response = await fetchJsonWithAuth(finalUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error initializing themes:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initialize themes' },
      { status: error.status || 500 }
    )
  }
}