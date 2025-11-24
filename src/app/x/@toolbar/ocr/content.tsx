'use client'

import {useOCRView, ViewType} from '@/ctx/ocr/view'
import {Icon, IconName} from '@/lib/icons'
import {cn} from '@/lib/utils'

export const Content = () => {
  const {setView} = useOCRView()
  const handleToolbarClick = (view: ViewType) => () => {
    setView(view)
  }

  return (
    <div className='w-full flex items-center justify-between font-space pr-8'>
      <div></div>
      <div className='flex item-center gap-6 md:gap-12'>
        {Object.entries(toolbar).map(([key, value]) => (
          <Icon
            key={key}
            onClick={handleToolbarClick(key as ViewType)}
            name={value}
            className={cn(
              'hover:bg-background/60 hover:text-blue-500 dark:hover:text-amber-50 cursor-pointer rounded-sm',
              'transition-transform duration-250 active:scale-90 active:rotate-3 ease-out',
              'select-none text-blue-400 dark:text-white size-6',
            )}
          />
        ))}
      </div>
      <div></div>
    </div>
  )
}

const toolbar: Record<ViewType, IconName> = {
  stats: 'chart',
  table: 'table',
  'scan-doc': 'scan-doc',
  'scan-id': 'scan-user',
  settings: 'tweak',
}
