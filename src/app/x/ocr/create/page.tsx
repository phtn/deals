'use client'

import {Card} from '@/components/ui/card'
import {Icon, IconName} from '@/lib/icons'
import Link from 'next/link'
import {useMemo} from 'react'

type DocumentType =
  | 'check'
  | 'payslip'
  | 'deposit_slip'
  | 'receipt'
  | 'ewallet_transfer'
  | 'invoice'
  | 'cr'
  | 'driver_license'
  | 'passport'
  | 'other'

interface DocumentTypeConfig {
  type: DocumentType
  label: string
  description: string
  hasForm: boolean
  icon: string
}

const documentTypes: DocumentTypeConfig[] = [
  {
    type: 'check',
    label: 'Check',
    description: 'Bank check or cheque',
    hasForm: true,
    icon: 'doc',
  },
  {
    type: 'deposit_slip',
    label: 'Deposit Slip',
    description: 'Bank deposit slip',
    hasForm: true,
    icon: 'doc',
  },
  {
    type: 'ewallet_transfer',
    label: 'E-Wallet Transfer',
    description: 'Digital wallet transfer receipt',
    hasForm: true,
    icon: 'doc',
  },
  {
    type: 'cr',
    label: 'Certificate of Registration',
    description: 'Vehicle registration certificate',
    hasForm: true,
    icon: 'doc',
  },
  {
    type: 'payslip',
    label: 'Payslip',
    description: 'Employee payslip',
    hasForm: false,
    icon: 'doc',
  },
  {
    type: 'receipt',
    label: 'Receipt',
    description: 'Payment receipt',
    hasForm: false,
    icon: 'doc',
  },
  {
    type: 'invoice',
    label: 'Invoice',
    description: 'Business invoice',
    hasForm: false,
    icon: 'doc',
  },
  {
    type: 'driver_license',
    label: 'Driver License',
    description: 'Driver license document',
    hasForm: false,
    icon: 'doc',
  },
  {
    type: 'passport',
    label: 'Passport',
    description: 'Passport document',
    hasForm: false,
    icon: 'doc',
  },
  {
    type: 'other',
    label: 'Other',
    description: 'Other document type',
    hasForm: false,
    icon: 'doc',
  },
]

export default function Page() {
  const typesWithForms = useMemo(
    () => documentTypes.filter((dt) => dt.hasForm),
    [],
  )
  return (
    <div className='p-4 overflow-scroll border-t-[0.33px] border-stone-400/80 dark:border-dysto'>
      <div className='mb-4 h-24'>
        <h1 className='text-2xl font-semibold tracking-tighter mb-1'>
          New Document
        </h1>
        <p className='text-sm text-gray-400'>
          Select a document type to scan and add
        </p>
      </div>

      <div className='mb-8'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {documentTypes.map((docType) => (
            <Link
              key={docType.type}
              href={`/x/ocr/create/${docType.type}`}
              className='block'>
              <Card className='shadow-sm dark:bg-terminal border-stone-400/40 dark:border-vim transition-all duration-300 p-4 cursor-pointer dark:hover:bg-terminal/80'>
                <div className='flex items-start gap-3'>
                  <div className='p-2 dark:bg-terminal rounded-lg shrink-0'>
                    <Icon
                      name={docType.icon as IconName}
                      className='size-10 rounded-lg bg-sidebar/20 text-blue-400 dark:text-cyan-400'
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-xl font-bone text-stone-600 dark:text-white mb-1'>
                      {docType.label}
                    </h3>
                    <p className='text-sm opacity-60'>{docType.description}</p>
                    {typesWithForms
                      .map((doc) => doc.label)
                      .includes(docType.label) ? (
                      <span className='inline-block mt-2 text-xs text-blue-500 dark:text-green-300 font-space font-medium'>
                        Available
                      </span>
                    ) : (
                      <span className='inline-block mt-2 text-xs text-mac-orange font-medium'>
                        OCR Only
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
