"use client"

import { useState, useEffect } from 'react'

export interface ThemeConfig {
  type: string
  name: string
  config?: Record<string, any>
  isActive: boolean
}

export function useTheme() {
  const [activeTheme, setActiveTheme] = useState<ThemeConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActiveTheme()
  }, [])

  const loadActiveTheme = async () => {
    try {
      const response = await fetch('/api/themes/active')
      if (response.ok) {
        const theme = await response.json()
        setActiveTheme(theme)
      }
    } catch (error) {
      console.error('Error loading active theme:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshTheme = () => {
    loadActiveTheme()
  }

  return {
    activeTheme,
    loading,
    refreshTheme
  }
}