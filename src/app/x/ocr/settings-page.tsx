'use client'

import {Card} from '@/components/ui/card'
import {Checkbox} from '@/components/ui/checkbox'
import {useMetrics, type MetricKey} from '@/ctx/ocr/metrics'
import {
  Activity,
  CheckCircle2,
  FileText,
  Gauge,
  TrendingUp,
  User,
  XCircle,
  Palette,
  Car,
  BarChart3,
} from 'lucide-react'

const metricConfig: Array<{
  key: MetricKey
  label: string
  icon: typeof FileText
  description?: string
}> = [
  {
    key: 'totalDocuments',
    label: 'Total Documents',
    icon: FileText,
    description: 'Documents processed this week',
  },
  {
    key: 'successRate',
    label: 'Success Rate',
    icon: CheckCircle2,
    description: 'Percentage of successful OCR processing',
  },
  {
    key: 'avgConfidence',
    label: 'Average Confidence',
    icon: Gauge,
    description: 'Average OCR confidence score',
  },
  {
    key: 'failed',
    label: 'Failed Processing',
    icon: XCircle,
    description: 'Documents that failed to process',
  },
  {
    key: 'processing',
    label: 'In Progress',
    icon: Activity,
    description: 'Documents currently being processed',
  },
  {
    key: 'totalAmount',
    label: 'Total Amount',
    icon: TrendingUp,
    description: 'Total monetary amount from documents',
  },
  {
    key: 'byType',
    label: 'Documents by Type',
    icon: BarChart3,
    description: 'Breakdown of documents by type',
  },
  {
    key: 'topVehicleTypes',
    label: 'Top Vehicle Types',
    icon: Car,
    description: 'Most common vehicle types',
  },
  {
    key: 'topColors',
    label: 'Top Colors',
    icon: Palette,
    description: 'Most common vehicle colors',
  },
  {
    key: 'mostActiveUsers',
    label: 'Most Active Users',
    icon: User,
    description: 'Users with most document uploads',
  },
]

export const SettingsPage = () => {
  const {isVisible, toggleMetric} = useMetrics()

  return (
    <div className='p-4 h-[88lvh] overflow-scroll'>
      <div className='max-w-3xl mx-auto space-y-4'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-white mb-2'>Metric Settings</h1>
          <p className='text-sm text-gray-400'>
            Toggle visibility of metrics in the stats page
          </p>
        </div>

        <div className='space-y-2'>
          {metricConfig.map((metric) => {
            const Icon = metric.icon
            const visible = isVisible(metric.key)

            return (
              <Card
                key={metric.key}
                className='bg-[#1a1f2e] border-[#2a3142] hover:border-[#3a4152] transition-all duration-300 p-4 cursor-pointer'
                onClick={() => toggleMetric(metric.key)}>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3 flex-1 min-w-0'>
                    <div className='p-2 bg-[#242938] rounded-lg shrink-0'>
                      <Icon
                        className={`w-5 h-5 ${
                          visible ? 'text-cyan-400' : 'text-gray-500'
                        }`}
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <h3
                          className={`text-base font-semibold ${
                            visible ? 'text-white' : 'text-gray-500'
                          }`}>
                          {metric.label}
                        </h3>
                      </div>
                      {metric.description && (
                        <p className='text-xs text-gray-400 mt-0.5'>
                          {metric.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className='shrink-0 ml-4'>
                    <Checkbox
                      checked={visible}
                      onCheckedChange={() => toggleMetric(metric.key)}
                    />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
