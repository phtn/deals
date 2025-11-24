'use client'

import {createContext, ReactNode, useContext, useEffect, useState} from 'react'

export type MetricKey =
  | 'totalDocuments'
  | 'successRate'
  | 'avgConfidence'
  | 'failed'
  | 'processing'
  | 'totalAmount'
  | 'byType'
  | 'topVehicleTypes'
  | 'topColors'
  | 'mostActiveUsers'

interface MetricsContextType {
  visibleMetrics: Set<MetricKey>
  toggleMetric: (metric: MetricKey) => void
  isVisible: (metric: MetricKey) => boolean
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined)

const STORAGE_KEY = 'ocr-metrics-visibility'
const DEFAULT_VISIBLE: MetricKey[] = [
  'totalDocuments',
  'successRate',
  'avgConfidence',
  'failed',
  'processing',
  'totalAmount',
  'byType',
  'topVehicleTypes',
  'topColors',
  'mostActiveUsers',
]

function loadFromStorage(): Set<MetricKey> {
  if (typeof window === 'undefined') {
    return new Set(DEFAULT_VISIBLE)
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as MetricKey[]
      return new Set(parsed)
    }
  } catch (error) {
    console.error('Failed to load metrics visibility from storage:', error)
  }

  return new Set(DEFAULT_VISIBLE)
}

function saveToStorage(metrics: Set<MetricKey>) {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(metrics)))
  } catch (error) {
    console.error('Failed to save metrics visibility to storage:', error)
  }
}

export function MetricsProvider({children}: {children: ReactNode}) {
  const [visibleMetrics, setVisibleMetrics] = useState<Set<MetricKey>>(() =>
    loadFromStorage(),
  )

  useEffect(() => {
    saveToStorage(visibleMetrics)
  }, [visibleMetrics])

  const toggleMetric = (metric: MetricKey) => {
    setVisibleMetrics((prev) => {
      const next = new Set(prev)
      if (next.has(metric)) {
        next.delete(metric)
      } else {
        next.add(metric)
      }
      return next
    })
  }

  const isVisible = (metric: MetricKey) => {
    return visibleMetrics.has(metric)
  }

  return (
    <MetricsContext.Provider value={{visibleMetrics, toggleMetric, isVisible}}>
      {children}
    </MetricsContext.Provider>
  )
}

export function useMetrics() {
  const context = useContext(MetricsContext)
  if (context === undefined) {
    throw new Error('useMetrics must be used within MetricsProvider')
  }
  return context
}

