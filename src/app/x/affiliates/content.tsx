'use client'

import {useAffiliateView} from '@/ctx/affiliate/view'
import {Icon} from '@/lib/icons'
import {CreateAffiliateForm} from './create-affiliate-form'
import {Metrics} from './top-metrics'

export const Content = () => {
  const {view} = useAffiliateView()

  const renderView = () => {
    switch (view) {
      case 'stats':
        return <Metrics />
      case 'table':
        return (
          <div className='flex items-center gap-2 text-xl font-semibold tracking-tighter opacity-80'>
            <span>Table View</span>
            <Icon
              name='checkbox-indeterminate-2'
              className='size-4 rotate-45'
            />
          </div>
        )
      case 'calendar':
        return (
          <div className='flex items-center gap-2 text-xl font-semibold tracking-tighter opacity-80'>
            <span>Calendar View</span>
            <Icon
              name='checkbox-indeterminate-2'
              className='size-4 rotate-45'
            />
          </div>
        )
      case 'add-new':
        return <CreateAffiliateForm />
      default:
        return <Metrics />
    }
  }

  return (
    <div className='w-full min-w-0 md:size-full space-y-6 px-2 sm:px-4 md:px-6 pb-8 overflow-x-hidden'>
      {renderView()}
    </div>
  )
}
