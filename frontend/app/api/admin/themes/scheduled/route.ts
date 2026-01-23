import { NextResponse } from 'next/server'
import { fetchJsonWithAuth, getApiBaseUrlLazy } from '@/lib/api'

export async function GET() {
  try {
    const finalUrl = `${getApiBaseUrlLazy()}/api/admin/themes/scheduled`

    const response = await fetchJsonWithAuth(finalUrl, {
      headers: { 'Content-Type': 'application/json' },
    })

    const schedules = await response.json()
    return NextResponse.json(schedules)
  } catch (error: any) {
    console.error('Error fetching scheduled themes:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch scheduled themes' },
      { status: error.status || 500 }
    )
  }
}