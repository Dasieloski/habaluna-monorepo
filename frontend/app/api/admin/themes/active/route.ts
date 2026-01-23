import { NextResponse } from 'next/server'
import { fetchJsonWithAuth, getApiBaseUrlLazy } from '@/lib/api'

export async function GET() {
  try {
    const finalUrl = `${getApiBaseUrlLazy()}/api/admin/themes/active`

    const response = await fetchJsonWithAuth(finalUrl, {
      headers: { 'Content-Type': 'application/json' },
    })

    const theme = await response.json()
    return NextResponse.json(theme)
  } catch (error: any) {
    console.error('Error fetching active theme:', error)
    // Si no hay tema activo o hay error de autenticación, devolver null
    return NextResponse.json(null)
  }
}