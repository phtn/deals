'use client'

import {Button} from '@/components/ui/button'
import {DockItems, MobileDock} from '@/components/ui/mobile-dock'
import {useOCRView} from '@/ctx/ocr/view'
import {VehicleRegistration} from '@/lib/vision/parse-lto'
import {useCallback, useMemo, useState} from 'react'
import {AddDocument} from './add-document'
import {CertificateOfRegistrationForm} from './cr'
import {DocumentUploader} from './document-uploader'
import {SettingsPage} from './settings-page'
import {StatsPage} from './stats-page'
import {DataTablePage} from './table-page'

export const Content = () => {
  const {view} = useOCRView()
  const voidFn = () => console.log('void')
  const [isScanning] = useState(false)

  const dockItems = useMemo(
    () =>
      ({
        nav: [{id: 'back', icon: 'table', fn: voidFn, label: 'Dashboard'}],
        toolbar: [
          {
            name: 'start scan',
            fn: voidFn,
            icon: 'table',
            style: isScanning
              ? 'animate-pulse text-zinc-600 dark:text-lime'
              : 'text-blue-500 dark:text-stone-700',
          },
          {
            name: 'halt',
            fn: voidFn,
            icon: 'scan-doc',
            style: isScanning
              ? 'text-amber-500'
              : 'text-blue-500 dark:text-stone-700',
          },
          {
            name: 'sound',
            fn: voidFn,
            icon: 'scan-user',
            style: isScanning
              ? 'text-primary dark:text-blue-300'
              : 'text-blue-500 dark:text-stone-700',
          },
        ],
        options: [
          {
            name: 'clear list',
            fn: voidFn,
            icon: 'tweak',
            style: isScanning
              ? 'text-zinc-400/80 dark:text-zinc-700'
              : 'text-blue-500 dark:text-stone-700',
          },
        ],
      }) as DockItems,
    [isScanning],
  )
  const renderContent = useCallback(() => {
    switch (view) {
      case 'stats':
        return <StatsPage />
      case 'table':
        return <DataTablePage />
      case 'settings':
        return <SettingsPage />
      case 'scan-doc':
        return <CRScanner />
      case 'add-new':
        return <AddDocument />
      default:
        return null
    }
  }, [view])

  return (
    <main className='relative w-full md:min-w-0 pb-20 md:pb-0'>
      {renderContent()}
      <div className='fixed md:hidden bottom-18 w-screen md:w-full flex flex-col items-center'>
        <MobileDock dockItems={dockItems} />
      </div>
    </main>
  )
}

const CRScanner = () => {
  const [ocrData, setOcrData] = useState<VehicleRegistration | null>(null)

  return (
    <div className='w-full min-w-0'>
      <>
        <div className='flex flex-col md:flex-row space-x-0 space-y-0 w-full min-w-0'>
          <div className='w-full md:shrink-0 md:w-auto min-w-0'>
            <CertificateOfRegistrationForm ocrData={ocrData} />
          </div>
          <div className='w-full flex-1 px-0 overflow-scroll h-screen relative min-w-0'>
            <DocumentUploader onDataExtracted={setOcrData} />
          </div>
        </div>
        {ocrData && (
          <Button
            size='lg'
            type='submit'
            variant='ghost'
            className='flex-1 px-12 py-2 dark:bg-background/80 text-amber-50 hover:bg-gray-300 transition-colors rounded-none! fixed bottom-0 right-0'>
            Upload Document
          </Button>
        )}
      </>
    </div>
  )
}
