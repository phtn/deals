'use client'

import {DockItems, MobileDock} from '@/components/ui/mobile-dock'
import {usePathname, useRouter} from 'next/navigation'
import {useMemo, useState} from 'react'

export default function OCRLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isScanning] = useState(false)

  const dockItems = useMemo(
    () =>
      ({
        nav: [
          {
            id: 'back',
            icon: 'table',
            fn: () => router.push('/x'),
            label: 'Dashboard',
          },
        ],
        toolbar: [
          {
            name: 'stats',
            fn: () => router.push('/x/ocr/stats'),
            icon: 'chart',
            style: pathname === '/x/ocr/stats'
              ? 'text-blue-500 dark:text-amber-50'
              : 'text-blue-500 dark:text-stone-700',
          },
          {
            name: 'table',
            fn: () => router.push('/x/ocr/table'),
            icon: 'table',
            style: pathname === '/x/ocr/table'
              ? 'text-blue-500 dark:text-amber-50'
              : 'text-blue-500 dark:text-stone-700',
          },
          {
            name: 'add new',
            fn: () => router.push('/x/ocr/add-new'),
            icon: 'add-square',
            style: pathname?.startsWith('/x/ocr/add-new')
              ? 'text-blue-500 dark:text-amber-50'
              : 'text-blue-500 dark:text-stone-700',
          },
          {
            name: 'scan doc',
            fn: () => router.push('/x/ocr/scan-doc'),
            icon: 'scan-doc',
            style: pathname === '/x/ocr/scan-doc'
              ? 'text-blue-500 dark:text-amber-50'
              : 'text-blue-500 dark:text-stone-700',
          },
          {
            name: 'settings',
            fn: () => router.push('/x/ocr/settings'),
            icon: 'tweak',
            style: pathname === '/x/ocr/settings'
              ? 'text-blue-500 dark:text-amber-50'
              : 'text-blue-500 dark:text-stone-700',
          },
        ],
        options: [
          {
            name: 'clear list',
            fn: () => console.log('clear list'),
            icon: 'tweak',
            style: isScanning
              ? 'text-zinc-400/80 dark:text-zinc-700'
              : 'text-blue-500 dark:text-stone-700',
          },
        ],
      }) as DockItems,
    [router, pathname, isScanning],
  )

  return (
    <>
      {children}
      <div className='fixed md:hidden bottom-18 w-screen md:w-full flex flex-col items-center'>
        <MobileDock dockItems={dockItems} />
      </div>
    </>
  )
}

