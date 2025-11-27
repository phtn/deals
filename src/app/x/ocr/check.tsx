'use client'

import {Icon} from '@/lib/icons'
import {useState} from 'react'
import {CheckFields} from './types'

interface EditableFieldProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

function EditableField({
  value,
  onChange,
  className = '',
  placeholder = '',
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (isEditing) {
    return (
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setIsEditing(false)}
        autoFocus
        className={`bg-transparent border-b border-stone-400 outline-none ${className}`}
        placeholder={placeholder}
      />
    )
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer border-b border-stone-500 min-h-6 ${className}`}>
      {value || <span className='text-stone-600'>{placeholder}</span>}
    </div>
  )
}

interface EditableCheckProps {
  data?: CheckFields
}

export function EditableCheck({data}: EditableCheckProps) {
  return (
    <div className='w-full max-w-5xl'>
      <div className='bg-linear-to-br from-cyan-200/80 via-cyan-200 to-cyan-100 rounded-sm shadow-xl p-8 relative overflow-hidden border-b-16 border-white'>
        {/* Decorative diagonal line */}
        <div className='absolute top-0 right-0 w-96 h-96 bg-cyan-100/50 transform rotate-45 translate-x-48 -translate-y-48' />

        <div className='relative z-10'>
          {/* Header */}
          <div className='flex justify-between items-start mb-2'>
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <Icon name='nut' className='size-6' />
                <h1 className='text-2xl font-bold text-gray-800 font-bone'>
                  {data?.bank_address ? data?.bank_address.substring(0, 3) : ''}
                  {data?.bank_info ? data?.bank_info.substring(0, 3) : ''}
                </h1>
              </div>
              <div className='text-xs text-gray-700 leading-tight'>
                <div>{data?.bank_address ? data?.bank_info : 'Address'}</div>
              </div>
            </div>
            <div className='text-xl font-major font-bold text-gray-800'>
              {data?.check_number ?? data?.checkNumber ?? '0000'}
            </div>
          </div>

          {/* Date field */}
          <div className='flex items-center gap-2 mb-6 justify-end'>
            <span className='text-sm font-semibold font-figtree text-gray-800'>
              DATE:
            </span>
            <EditableField
              value={data?.date ?? ''}
              onChange={(value) => console.log(value)}
              className='ps-4 w-40 text-sm'
              placeholder='MM/DD/YYYY'
            />
          </div>

          {/* Pay to the order of */}
          <div className='mb-4 font-figtree'>
            <div className='text-xs font-semibold text-gray-800'>
              PAY TO THE
            </div>
            <div className='-mb-4 text-xs font-semibold text-gray-800'>
              ORDER OF:
            </div>
            <EditableField
              value={data?.payee ?? data?.pay_to ?? ''}
              onChange={(value) => console.log(value)}
              className='ps-24 w-full text-sm'
              placeholder='Name of payee'
            />
          </div>

          {/* Amount section */}
          <div className='flex items-center gap-4 mb-6'>
            <div className='flex-1 border-b border-gray-800 min-h-8' />
            <div className='flex items-center gap-2'>
              <span className='text-2xl font-bold text-gray-800'>$</span>
              <EditableField
                value={data?.amount_numeric ?? data?.amount ?? ''}
                onChange={(value) => console.log(value)}
                className='w-32 text-xl font-semibold'
                placeholder='0.00'
              />
            </div>
          </div>

          {/* Dollars with lock */}
          <div className='flex items-center justify-end gap-2 mb-6'></div>

          {/* Memo and signature line */}
          <div className='flex items-end justify-between mb-0'>
            <div className='flex-1'>
              <div className='flex items-center gap-2'>
                <span className='text-xs font-semibold text-gray-800'>
                  MEMO:
                </span>
                <EditableField
                  value={data?.memo ?? data?.notes ?? ''}
                  onChange={(value) => console.log(value)}
                  className='ps-4 flex-1 text-sm'
                  placeholder='Optional memo'
                />
              </div>
            </div>
            <div className='ml-8'>
              <div className='w-48 border-b border-gray-800 mb-1' />
              <div className='text-xs text-center text-gray-700'>
                Authorized Signature
              </div>
            </div>
          </div>

          {/* Bottom routing numbers */}
          <div className='hidden _flex items-center justify-center gap-8 text-sm font-mono text-gray-800'>
            <span>{data?.micr_line ?? ''}</span>
            <span>{data?.brstn ?? ''}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
