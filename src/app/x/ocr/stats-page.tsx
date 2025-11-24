'use client'

import {Card} from '@/components/ui/card'
import {useMobile} from '@/hooks/use-mobile'
import {useToggle} from '@/hooks/use-toggle'
import {useMetrics} from '@/ctx/ocr/metrics'
import {useQuery} from 'convex/react'
import {
  Activity,
  CheckCircle2,
  FileText,
  Gauge,
  TrendingUp,
  User,
  XCircle,
} from 'lucide-react'
import {useEffect, useMemo, useRef} from 'react'
import {api} from '../../../../convex/_generated/api'
import MiniChart from '../affiliates/mini-chart'

export const StatsPage = () => {
  const {on, toggle} = useToggle()
  const isMobile = useMobile()
  const {isVisible} = useMetrics()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const weeklyDocs = useQuery(api.documents.q.getWeeklyDocuments)

  // Calculate stats from weekly documents
  const stats = useMemo(() => {
    if (!weeklyDocs) {
      return {
        total: 0,
        completed: 0,
        failed: 0,
        processing: 0,
        successRate: 0,
        avgConfidence: 0,
        byType: {} as Record<string, number>,
        byDay: [] as Array<{day: string; count: number}>,
        totalAmount: 0,
        topVehicleTypes: [] as Array<{type: string; count: number}>,
        topColors: [] as Array<{color: string; count: number}>,
        mostActiveUsers: [] as Array<{
          name: string
          userId: string
          count: number
        }>,
      }
    }

    const total = weeklyDocs.length
    const completedDocs = weeklyDocs.filter((d) => d.ocrStatus === 'completed')
    const completed = completedDocs.length
    const failed = weeklyDocs.filter((d) => d.ocrStatus === 'failed').length
    const processing = weeklyDocs.filter(
      (d) => d.ocrStatus === 'processing' || d.ocrStatus === 'pending',
    ).length

    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0

    // Calculate average confidence
    const confidences = completedDocs
      .map((doc) => doc.ocrResults?.confidence)
      .filter((c): c is number => typeof c === 'number')
    const avgConfidence =
      confidences.length > 0
        ? Math.round(
            (confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100,
          )
        : 0

    // Documents by type
    const byType: Record<string, number> = {}
    weeklyDocs.forEach((doc) => {
      byType[doc.documentType] = (byType[doc.documentType] || 0) + 1
    })

    // Documents by day (last 7 days)
    const byDayMap = new Map<string, number>()
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dayKey = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
      byDayMap.set(dayKey, 0)
    }

    weeklyDocs.forEach((doc) => {
      const docDate = new Date(doc.createdAt)
      const dayKey = docDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
      if (byDayMap.has(dayKey)) {
        byDayMap.set(dayKey, (byDayMap.get(dayKey) || 0) + 1)
      }
    })

    const byDay = Array.from(byDayMap.entries()).map(([day, count]) => ({
      day,
      count,
    }))

    // Total amount from metadata
    const totalAmount = weeklyDocs.reduce((sum, doc) => {
      const amount = doc.metadata?.amount || 0
      return sum + amount
    }, 0)

    // Top vehicle types and colors from OCR results
    const vehicleTypes: Record<string, number> = {}
    const colors: Record<string, number> = {}

    completedDocs.forEach((doc) => {
      const fields = doc.ocrResults?.fields
      if (fields) {
        if (fields.vehicleType) {
          vehicleTypes[fields.vehicleType] =
            (vehicleTypes[fields.vehicleType] || 0) + 1
        }
        if (fields.color) {
          colors[fields.color] = (colors[fields.color] || 0) + 1
        }
      }
    })

    const topVehicleTypes = Object.entries(vehicleTypes)
      .map(([type, count]) => ({type, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const topColors = Object.entries(colors)
      .map(([color, count]) => ({color, count}))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Most active users
    const userCounts: Record<
      string,
      {name: string; userId: string; count: number}
    > = {}
    weeklyDocs.forEach((doc) => {
      if (doc.uploadedBy) {
        const userId = doc.uploadedBy
        if (!userCounts[userId]) {
          userCounts[userId] = {
            name: doc.uploadedByName || 'Unknown User',
            userId,
            count: 0,
          }
        }
        userCounts[userId].count++
      }
    })

    const mostActiveUsers = Object.values(userCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      total,
      completed,
      failed,
      processing,
      successRate,
      avgConfidence,
      byType,
      byDay,
      totalAmount,
      topVehicleTypes,
      topColors,
      mostActiveUsers,
    }
  }, [weeklyDocs])

  // Scroll to top on mount
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({top: 0, behavior: 'smooth'})
    } else {
      window.scrollTo({top: 0, behavior: 'smooth'})
    }
  }, [])

  useEffect(() => {
    if (!on || !isMobile) return

    const el = scrollRef.current
    if (!el) return

    const TRANSITION_MS = 550

    const doScroll = () => {
      // Measure navbar height (assumes Navbar is the first header-like element in flow)
      const navbarEl =
        document.getElementById('mobile-navbar')?.closest('nav') ??
        document.querySelector(
          'header, nav, [data-navbar], [role="navigation"]',
        )

      const navbarHeight =
        (navbarEl instanceof HTMLElement
          ? navbarEl.getBoundingClientRect().height
          : 42) || 0

      // Target top Y of the activation section relative to document
      const elTopDoc = window.scrollY + el.getBoundingClientRect().top

      // Scroll so that the activation section sits just below the navbar
      const targetY = Math.max(0, elTopDoc - navbarHeight - 4)

      window.scrollTo({top: targetY, behavior: 'smooth'})

      // After initial scroll, ensure the bottom is fully visible and nudge Chrome's address bar to hide
      window.setTimeout(() => {
        const viewportH = window.visualViewport?.height ?? window.innerHeight
        const rect = el.getBoundingClientRect()
        const visibleBottom = rect.bottom
        const extra = visibleBottom - (viewportH - 2) // keep a tiny gutter

        if (extra > 0) {
          window.scrollBy({top: extra + 8, behavior: 'smooth'})
        } else {
          // Nudge by 1px to encourage Chrome to hide the address bar on small pages
          window.scrollBy({top: 1, behavior: 'auto'})
        }
      }, 250)
    }

    const id = window.setTimeout(doScroll, TRANSITION_MS)
    toggle()
    return () => window.clearTimeout(id)
  }, [on, isMobile, toggle])

  const chartData = stats.byDay.map((d) => ({value: d.count}))

  return (
    <div ref={containerRef} className='p-4 h-[88lvh] overflow-scroll'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0'>
        {/* Total Documents */}
        {isVisible('totalDocuments') && (
          <Card className='bg-[#1a1f2e] border-[#1a1f2e] hover:border-[#3a4152] transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0'>
          <div className='flex items-start justify-between mb-3'>
            <div className='p-2 bg-[#242938] rounded-lg'>
              <FileText className='w-5 h-5 text-cyan-400' />
            </div>
          </div>
          <div className='space-y-1'>
            <div className='flex items-baseline gap-2'>
              <span className='text-3xl font-bold text-white'>
                {stats.total}
              </span>
            </div>
            <p className='text-sm text-gray-400'>Documents This Week</p>
          </div>
          {chartData.length > 0 && (
            <div className='mt-4 h-12'>
              <MiniChart data={chartData} color='#06b6d4' />
            </div>
          )}
        </Card>
        )}

        {/* Success Rate */}
        {isVisible('successRate') && (
          <Card className='bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0'>
          <div className='flex items-start justify-between mb-3'>
            <div className='p-2 bg-[#242938] rounded-lg'>
              <CheckCircle2 className='w-5 h-5 text-green-400' />
            </div>
            <div className='text-xs text-gray-400'>
              {stats.completed}/{stats.total}
            </div>
          </div>
          <div className='space-y-1'>
            <div className='flex items-baseline gap-2'>
              <span className='text-3xl font-bold text-white'>
                {stats.successRate}
              </span>
              <span className='text-sm text-gray-400'>%</span>
            </div>
            <p className='text-sm text-gray-400'>Success Rate</p>
          </div>
          <div className='mt-4 h-1 bg-[#2a3142] rounded-full overflow-hidden'>
            <div
              className='h-full bg-linear-to-r from-green-500 to-emerald-500 transition-all duration-700'
              style={{width: `${stats.successRate}%`}}
            />
          </div>
        </Card>
        )}

        {/* Average Confidence */}
        {isVisible('avgConfidence') && (
          <Card className='bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0'>
          <div className='flex items-start justify-between mb-3'>
            <div className='p-2 bg-[#242938] rounded-lg'>
              <Gauge className='w-5 h-5 text-blue-400' />
            </div>
            <div className='relative inline-flex'>
              <svg width='48' height='48' className='transform -rotate-90'>
                <circle
                  cx='24'
                  cy='24'
                  r='20'
                  stroke='#2a3142'
                  strokeWidth='4'
                  fill='none'
                />
                <circle
                  cx='24'
                  cy='24'
                  r='20'
                  stroke='#3b82f6'
                  strokeWidth='4'
                  fill='none'
                  strokeDasharray={`${stats.avgConfidence * 1.25} ${125.6}`}
                  strokeLinecap='round'
                  className='transition-all duration-700'
                />
              </svg>
            </div>
          </div>
          <div className='space-y-1'>
            <div className='flex items-baseline gap-2'>
              <span className='text-3xl font-bold text-white'>
                {stats.avgConfidence}
              </span>
              <span className='text-sm text-gray-400'>%</span>
            </div>
            <p className='text-sm text-gray-400'>Avg Confidence</p>
          </div>
        </Card>
        )}

        {/* Failed Documents */}
        {isVisible('failed') && (
          <Card className='bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0'>
          <div className='flex items-start justify-between mb-3'>
            <div className='p-2 bg-[#242938] rounded-lg'>
              <XCircle className='w-5 h-5 text-red-400' />
            </div>
          </div>
          <div className='space-y-1'>
            <div className='flex items-baseline gap-2'>
              <span className='text-3xl font-bold text-white'>
                {stats.failed}
              </span>
            </div>
            <p className='text-sm text-gray-400'>Failed Processing</p>
          </div>
        </Card>
        )}

        {/* Processing */}
        {isVisible('processing') && (
          <Card className='bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0'>
          <div className='flex items-start justify-between mb-3'>
            <div className='p-2 bg-[#242938] rounded-lg'>
              <Activity className='w-5 h-5 text-orange-400' />
            </div>
          </div>
          <div className='space-y-1'>
            <div className='flex items-baseline gap-2'>
              <span className='text-3xl font-bold text-white'>
                {stats.processing}
              </span>
            </div>
            <p className='text-sm text-gray-400'>In Progress</p>
          </div>
        </Card>
        )}

        {/* Total Amount */}
        {isVisible('totalAmount') && stats.totalAmount > 0 && (
          <Card className='bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0'>
            <div className='flex items-start justify-between mb-3'>
              <div className='p-2 bg-[#242938] rounded-lg'>
                <TrendingUp className='w-5 h-5 text-purple-400' />
              </div>
            </div>
            <div className='space-y-1'>
              <div className='flex items-baseline gap-2'>
                <span className='text-3xl font-bold text-white'>
                  ₱{stats.totalAmount.toLocaleString()}
                </span>
              </div>
              <p className='text-sm text-gray-400'>Total Amount</p>
            </div>
          </Card>
        )}

        {/* Documents by Type */}
        {isVisible('byType') && Object.keys(stats.byType).length > 0 && (
          <Card className='bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0 md:col-span-2 lg:col-span-3'>
            <h3 className='text-lg font-semibold text-white mb-4'>
              Documents by Type
            </h3>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className='space-y-1'>
                  <div className='text-2xl font-bold text-white'>{count}</div>
                  <p className='text-xs text-gray-400 capitalize'>{type}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Top Vehicle Types */}
        {isVisible('topVehicleTypes') && stats.topVehicleTypes.length > 0 && (
          <Card className='bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0'>
            <h3 className='text-lg font-semibold text-white mb-4'>
              Top Vehicle Types
            </h3>
            <div className='space-y-2'>
              {stats.topVehicleTypes.map(({type, count}) => (
                <div key={type} className='flex items-center justify-between'>
                  <span className='text-sm text-gray-300 capitalize'>
                    {type}
                  </span>
                  <span className='text-sm font-bold text-white'>{count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Top Colors */}
        {isVisible('topColors') && stats.topColors.length > 0 && (
          <Card className='bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0'>
            <h3 className='text-lg font-semibold text-white mb-4'>
              Top Colors
            </h3>
            <div className='space-y-2'>
              {stats.topColors.map(({color, count}) => (
                <div key={color} className='flex items-center justify-between'>
                  <span className='text-sm text-gray-300 capitalize'>
                    {color}
                  </span>
                  <span className='text-sm font-bold text-white'>{count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Most Active Users */}
        {isVisible('mostActiveUsers') && stats.mostActiveUsers.length > 0 && (
          <Card className='bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0'>
            <div className='flex items-start justify-between mb-4'>
              <div className='p-2 bg-[#242938] rounded-lg'>
                <User className='w-5 h-5 text-indigo-400' />
              </div>
            </div>
            <h3 className='text-lg font-semibold text-white mb-4'>
              Most Active Users
            </h3>
            <div className='space-y-3'>
              {stats.mostActiveUsers.map(({name, count}, index) => (
                <div
                  key={`${name}-${index}`}
                  className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    {index === 0 && (
                      <span className='text-xs font-bold text-yellow-400'>
                        👑
                      </span>
                    )}
                    <span className='text-sm text-gray-300 truncate max-w-[150px]'>
                      {name}
                    </span>
                  </div>
                  <span className='text-sm font-bold text-white'>{count}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
