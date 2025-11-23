'use client'

import {Button} from '@/components/ui/button'
import {VehicleRegistration} from '@/lib/vision/parse-lto'
import {useState} from 'react'
import {CertificateOfRegistrationForm} from './cr'
import {DocumentUploader} from './document-uploader'

export const Content = () => {
  const [ocrData, setOcrData] = useState<VehicleRegistration | null>(null)

  return (
    <main className='relative overflow-scroll h-screen border-t-[0.33px] border-foreground/60'>
      <div className='flex space-x-0'>
        <CertificateOfRegistrationForm ocrData={ocrData} />
        <div className='w-full flex-1 px-0 overflow-scroll h-screen relative'>
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
    </main>
  )
}
