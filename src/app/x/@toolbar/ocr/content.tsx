'use client'

import {Icon, IconName} from '@/lib/icons'
import {cn} from '@/lib/utils'
import {usePathname, useRouter} from 'next/navigation'

type ViewType =
  | 'stats'
  | 'table'
  | 'settings'
  | 'scan-doc'
  | 'scan-id'
  | 'create'

const toolbar: Record<ViewType, IconName> = {
  stats: 'chart',
  table: 'table',
  'scan-doc': 'scan-doc',
  'scan-id': 'scan-user',
  settings: 'tweak',
  create: 'add-square',
}

const routeMap: Record<ViewType, string> = {
  stats: '/x/ocr/stats',
  table: '/x/ocr/table',
  settings: '/x/ocr/settings',
  'scan-doc': '/x/ocr/scan-doc',
  'scan-id': '/x/ocr/scan-doc', // Map scan-id to scan-doc for now
  create: '/x/ocr/create',
}

export const Content = () => {
  const router = useRouter()
  const pathname = usePathname()

  const handleToolbarClick = (view: ViewType) => () => {
    const route = routeMap[view]
    if (route) {
      router.push(route)
    }
  }

  return (
    <div className='hidden md:flex w-full items-center justify-between font-space pr-8'>
      <div></div>
      <div className='flex item-center gap-6 md:gap-12'>
        {Object.entries(toolbar).map(([key, value]) => {
          const view = key as ViewType
          const route = routeMap[view]
          const isActive = pathname === route

          return (
            <Icon
              key={key}
              onClick={handleToolbarClick(view)}
              name={value}
              className={cn(
                'hover:bg-background/60 hover:text-blue-500 dark:hover:text-amber-50 cursor-pointer rounded-sm',
                'transition-transform duration-250 active:scale-90 active:rotate-3 ease-out',
                'select-none size-6',
                isActive
                  ? 'text-blue-500 dark:text-amber-50'
                  : 'text-blue-400 dark:text-white',
              )}
            />
          )
        })}
      </div>
      <div></div>
    </div>
  )
}
