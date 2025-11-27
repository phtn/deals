'use client'

import {EditableCheck} from '@/app/x/ocr/check'
import {CertificateOfRegistrationForm} from '@/app/x/ocr/cr'
import {EditableDepositSlip} from '@/app/x/ocr/deposit-slip'
import {DocumentUploader} from '@/app/x/ocr/document-uploader'
import EditableFundTransfer from '@/app/x/ocr/fund-transfer'
import {useEffect, useState} from 'react'
import {DocType} from '../../../../../../convex/documents/d'
import {
  CheckFields,
  DepositSlipFields,
  EwalletTransferFields,
  VehicleRegistration,
} from '../../types'

// Types are extracted from the form components
type OCRDataByDocType = {
  check: CheckFields
  payslip: Record<string, unknown>
  deposit_slip: DepositSlipFields
  receipt: Record<string, unknown>
  ewallet_transfer: EwalletTransferFields
  invoice: Record<string, unknown>
  cr: VehicleRegistration
  driver_license: Record<string, unknown>
  passport: Record<string, unknown>
  other: Record<string, unknown>
}

// Union type of all possible OCR data types
type OCRData = OCRDataByDocType[DocType]

interface PageProps {
  params: Promise<{doctype: string}>
}

export default function Page({params}: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{
    doctype: string
  } | null>(null)

  const [ocrData, setOcrData] = useState<OCRData | null>(null)

  // Resolve params promise
  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  if (!resolvedParams) {
    return <div>Loading...</div>
  }

  const doctype = resolvedParams.doctype as DocType

  const renderForm = () => {
    switch (doctype) {
      case 'check':
        return <EditableCheck data={ocrData as CheckFields} />
      case 'deposit_slip':
        return <EditableDepositSlip />
      case 'ewallet_transfer':
        return <EditableFundTransfer />
      case 'cr':
        return (
          <CertificateOfRegistrationForm
            ocrData={
              doctype === 'cr' ? (ocrData as VehicleRegistration | null) : null
            }
          />
        )
      default:
        // Generic form with DocumentUploader for other types
        return (
          <div className='w-full min-w-0'>
            <div className='p-4 mb-4'>
              <h2 className='text-xl font-semibold text-white mb-2 capitalize'>
                {doctype.replace('_', ' ')}
              </h2>
              <p className='text-sm text-gray-400'>
                Upload and scan your document using OCR
              </p>
            </div>
            {/*<div className='w-full flex-1 px-0 overflow-scroll h-screen relative min-w-0'>
              <DocumentUploader
                onDataExtracted={setOcrData}
                documentType={doctype}
              />
            </div>*/}
          </div>
        )
    }
  }

  return (
    <div className='w-full min-h-screen overflow-y-scroll border-t-[0.33px] border-stone-400/80 dark:border-greyed'>
      <div className='flex items-start w-full'>
        {renderForm()}
        <div className='w-1/2'>
          <DocumentUploader
            onDataExtracted={setOcrData}
            documentType={doctype}
          />
        </div>
      </div>
    </div>
  )
}
