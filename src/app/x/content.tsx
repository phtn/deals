'use client'

import {Metrics} from './affiliates/top-metrics'

export const Content = () => {
  return (
    <main className='w-full space-y-6 px-4 md:px-6 pb-8 overflow-x-hidden'>
      <Metrics />
      <div className='text-xl font-bold tracking-tight'>Events</div>
    </main>
  )
}
