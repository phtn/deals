'use client'

import {Card} from '@/components/ui/card'
import {Icon} from '@/lib/icons'
import {useQuery} from 'convex/react'
import {useMemo} from 'react'
import {api} from '../../../../convex/_generated/api'
import MiniChart from './mini-chart'

const generateChartData = (value: number, max: number) => {
  // Generate 20 data points that trend around the current value
  const baseValue = (value / max) * 100
  return Array.from({length: 20}, (_, i) => ({
    value: Math.max(
      0,
      Math.min(100, baseValue + (Math.random() - 0.5) * 20 + i),
    ),
  }))
}

export const Metrics = () => {
  const metrics = useQuery(api.affiliates.q.getMetrics)

  const chartData = useMemo(() => {
    if (!metrics) return []
    const max = Math.max(metrics.total, 100)
    return generateChartData(metrics.active, max)
  }, [metrics])

  if (metrics === undefined) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0'>
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className='bg-[#1a1f2e] border-[#1a1f2e] hover:border-[#3a4152] transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0'>
            <div className='animate-pulse'>
              <div className='h-8 bg-[#242938] rounded-lg mb-3 w-16' />
              <div className='h-10 bg-[#242938] rounded mb-2 w-32' />
              <div className='h-4 bg-[#242938] rounded w-24' />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0'>
      <Card className='bg-neutral-100 transition-all duration-300 p-3 sm:p-4 md:p-4 min-w-0'>
        <div className='flex items-start justify-between'>
          <Icon name='user-profile' className='text-cyan-500' />
          <span className='text-3xl font-poly'>
            {metrics.total.toLocaleString()}
          </span>
        </div>
        <div className='mt-0'>
          <MiniChart data={chartData} color='#06b6d4' />
        </div>
      </Card>

      <Card className='bg-neutral-100 transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0'>
        <div className='flex items-start justify-between mb-3'>
          <Icon name='user-profile' className='text-orange-400' />
          <span className='text-3xl font-poly'>
            {metrics.active.toLocaleString()}
          </span>
        </div>
        <div className='mt-0 h-1 rounded-full overflow-hidden'>
          <div
            className='h-full bg-linear-to-r from-orange-500 to-red-500 transition-all duration-700'
            style={{width: `${metrics.activePercentage}%`}}
          />
        </div>
      </Card>

      <Card className='bg-neutral-100 transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0'>
        <div className='flex items-start justify-between mb-3'>
          <Icon name='user-profile' className='text-orange-400' />

          <span className='text-3xl font-poly'>
            <span>{metrics.activePercentage}</span>
            <span className='text-sm text-gray-400'>%</span>
          </span>
        </div>
        <div className='space-y-1'></div>
      </Card>
    </div>
  )
}
