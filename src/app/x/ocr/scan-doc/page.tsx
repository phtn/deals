'use client'

import {Button} from '@/components/ui/button'
import {CertificateOfRegistrationForm} from '../cr'
import {DocumentUploader} from '../document-uploader'
import {VehicleRegistration} from '@/lib/vision/parse-lto'
import {useState} from 'react'

export default function Page() {
  const [ocrData, setOcrData] = useState<VehicleRegistration | null>(null)

  return (
    <div className='w-full min-w-0'>
      <div className='flex flex-col md:flex-row space-x-0 space-y-0 w-full min-w-0'>
        <div className='w-full md:shrink-0 md:w-auto min-w-0'>
          <CertificateOfRegistrationForm ocrData={ocrData} />
        </div>
        <div className='w-full flex-1 px-0 overflow-scroll h-screen relative min-w-0'>
          <DocumentUploader
            onDataExtracted={setOcrData}
            documentType='cr'
          />
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
    </div>
  )
}

