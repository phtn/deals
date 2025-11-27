'use client'

import {Card} from '@/components/ui/card'
import {useQuery} from 'convex/react'
import {Activity, Gauge, TrendingUp, Users} from 'lucide-react'
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

  const circumference = 2 * Math.PI * 20
  const activePercentage = metrics.activePercentage
  const strokeDasharray = `${(activePercentage / 100) * circumference} ${circumference}`

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 min-w-0'>
      <Card className='bg-[#1a1f2e] border-[#1a1f2e] hover:border-[#3a4152] transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0'>
        <div className='flex items-start justify-between mb-3'>
          <div className='p-2 bg-[#242938] rounded-lg'>
            <Users className='w-5 h-5 text-cyan-400' />
          </div>
        </div>
        <div className='space-y-1'>
          <div className='flex items-baseline gap-2'>
            <span className='text-3xl font-bold text-white'>
              {metrics.total.toLocaleString()}
            </span>
            <span className='text-sm text-gray-400'>affiliates</span>
          </div>
          <p className='text-sm text-gray-400'>Total Affiliates</p>
        </div>
        <div className='mt-4 h-12'>
          <MiniChart data={chartData} color='#06b6d4' />
        </div>
      </Card>

      <Card className='bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0'>
        <div className='flex items-start justify-between mb-3'>
          <div className='p-2 bg-[#242938] rounded-lg'>
            <Activity className='w-5 h-5 text-orange-400' />
          </div>
          <div className='text-xs text-gray-400'>
            {metrics.inactive} inactive
          </div>
        </div>
        <div className='space-y-1'>
          <div className='flex items-baseline gap-2'>
            <span className='text-3xl font-bold text-white'>
              {metrics.active.toLocaleString()}
            </span>
            <span className='text-sm text-gray-400'>active</span>
          </div>
          <p className='text-sm text-gray-400'>Active Affiliates</p>
        </div>
        <div className='mt-4 h-1 bg-[#2a3142] rounded-full overflow-hidden'>
          <div
            className='h-full bg-linear-to-r from-orange-500 to-red-500 transition-all duration-700'
            style={{width: `${metrics.activePercentage}%`}}
          />
        </div>
      </Card>

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
                strokeDasharray={strokeDasharray}
                strokeLinecap='round'
                className='transition-all duration-700'
              />
            </svg>
          </div>
        </div>
        <div className='space-y-1'>
          <div className='flex items-baseline gap-2'>
            <span className='text-3xl font-bold text-white'>
              {metrics.activePercentage}
            </span>
            <span className='text-sm text-gray-400'>%</span>
          </div>
          <p className='text-sm text-gray-400'>Active Rate</p>
        </div>
      </Card>

      <Card className='bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0'>
        <div className='flex items-start justify-between mb-3'>
          <div className='p-2 bg-[#242938] rounded-lg'>
            <TrendingUp className='w-5 h-5 text-green-400' />
          </div>
        </div>
        <div className='space-y-1'>
          <div className='flex items-baseline gap-2'>
            <span className='text-3xl font-bold text-white'>
              {metrics.totalRewardPoints.toLocaleString()}
            </span>
            <span className='text-sm text-gray-400'>points</span>
          </div>
          <p className='text-sm text-gray-400'>Total Reward Points</p>
        </div>
      </Card>

      <Card className='bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0'>
        <div className='flex items-start justify-between mb-3'>
          <div className='p-2 bg-[#242938] rounded-lg'>
            <Users className='w-5 h-5 text-purple-400' />
          </div>
        </div>
        <div className='space-y-1'>
          <div className='flex items-baseline gap-2'>
            <span className='text-3xl font-bold text-white'>
              {metrics.totalReferrals.toLocaleString()}
            </span>
            <span className='text-sm text-gray-400'>referrals</span>
          </div>
          <p className='text-sm text-gray-400'>Total Referrals</p>
        </div>
      </Card>

      <Card className='bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-3 sm:p-4 md:p-5 min-w-0'>
        <div className='flex items-start justify-between mb-3'>
          <div className='p-2 bg-[#242938] rounded-lg'>
            <Activity className='w-5 h-5 text-yellow-400' />
          </div>
        </div>
        <div className='space-y-1'>
          <div className='flex items-baseline gap-2'>
            <span className='text-3xl font-bold text-white'>
              {metrics.recent}
            </span>
            <span className='text-sm text-gray-400'>new</span>
          </div>
          <p className='text-sm text-gray-400'>Last 30 Days</p>
        </div>
      </Card>
    </div>
  )
}
