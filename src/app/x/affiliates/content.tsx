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
    <main className='relative w-full md:min-w-0 pb-20 md:pb-0 p-4'>
      {renderView()}
    </main>
  )
}
