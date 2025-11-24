'use client'

import {useState} from 'react'

interface DepositFields {
  date: string
  customerName: string
  accountNumber: string
  cash: string
  check: string
  validation: string
  subtotal: string
  total: string
}

export default function EditableDepositSlip() {
  const [fields, setFields] = useState<DepositFields>({
    date: '',
    customerName: '',
    accountNumber: '',
    cash: '',
    validation: '',
    check: '',
    subtotal: '',
    total: '',
  })

  const [accountType, setAccountType] = useState<
    'checking' | 'savings' | 'chase-liquid'
  >('checking')
  const [editingField, setEditingField] = useState<keyof DepositFields | null>(
    null,
  )

  const handleFieldChange = (field: keyof DepositFields, value: string) => {
    setFields((prev) => ({...prev, [field]: value}))
  }

  const handleFieldClick = (field: keyof DepositFields) => {
    setEditingField(field)
  }

  const handleFieldBlur = () => {
    setEditingField(null)
  }

  const renderEditableField = (
    field: keyof DepositFields,
    placeholder: string,
    className = '',
  ) => {
    const isEditing = editingField === field

    return isEditing ? (
      <input
        type='text'
        value={fields[field]}
        onChange={(e) => handleFieldChange(field, e.target.value)}
        onBlur={handleFieldBlur}
        autoFocus
        className={`bg-transparent border-b border-gray-400 outline-none ${className}`}
        placeholder={placeholder}
      />
    ) : (
      <span
        onClick={() => handleFieldClick(field)}
        className={`cursor-pointer hover:bg-gray-100/50 px-1 rounded min-h-6 inline-block ${className}`}>
        {fields[field] || placeholder}
      </span>
    )
  }

  return (
    <div className='w-full _max-w-4xl bg-white shadow-lg border border-gray-300 font-sans'>
      {/* Header Section */}
      <div className='bg-(--depslip-gradient) p-4 flex items-start justify-between mb-8 border-b-8 border-cyan-500/20'>
        <div className='flex-1'>
          <h1 className='text-2xl font-bone font-bold text-foreground/80 tracking-wide mb-2'>
            DEPOSIT SLIP
          </h1>
        </div>

        <div className='text-right space-y-1'>
          <div className='flex items-center gap-2 justify-end'>
            <span className='text-sm font-medium'>CHECKING</span>
            <button
              onClick={() => setAccountType('checking')}
              className={`w-5 h-5 border-2 border-gray-600 ${
                accountType === 'checking' ? 'bg-gray-600' : 'bg-transparent'
              }`}
            />
          </div>
          <div className='flex items-center gap-2 justify-end'>
            <span className='text-sm font-medium'>SAVINGS</span>
            <button
              onClick={() => setAccountType('savings')}
              className={`w-5 h-5 border-2 border-gray-600 ${
                accountType === 'savings' ? 'bg-gray-600' : 'bg-transparent'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex gap-8 p-6'>
        <div className='flex-1 space-y-4 w-1/3'>
          <div className='border-b border-gray-400'>
            <div className='text-sm text-gray-600'>Account Number</div>
            {renderEditableField('accountNumber', '', 'w-full')}
          </div>

          <div className='border-b border-gray-400'>
            <div className='text-sm text-gray-600'>
              Customer Name <span className='italic'></span>
            </div>
            {renderEditableField('customerName', '', 'w-full')}
          </div>
          {/* Amount Fields */}
          <div className='w-80 space-y-6 pt-8'>
            <div className='flex items-center space-x-1 border-b border-gray-400 pb-2'>
              <span className='text-sm font-medium'>CASH</span>
              <span className='text-sm opacity-60'>▶</span>
              {renderEditableField('cash', '', 'text-right w-32')}
            </div>

            <div className='flex items-center space-x-1 border-b border-gray-400 pb-2'>
              <span className='text-sm font-medium'>CHECK</span>
              <span className='text-sm opacity-60'>▶</span>
              {renderEditableField('check', '', 'text-right w-32')}
            </div>

            <div className='flex items-center space-x-2 py-8 mt-2'>
              <span className='text-lg font-bold'>TOTAL AMOUNT</span>
              <div className='flex items-center gap-2'>
                <span className='text-lg font-bold'></span>
                {renderEditableField(
                  'total',
                  '',
                  'text-right w-32 text-lg font-semibold',
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='space-y-4'>
          <div className='border border-dashed border-gray-400 p-4 w-96 h-64 font-major'>
            <div className='text-sm text-gray-600 mb-1'>Machine Validation</div>
            {renderEditableField('date', '', 'w-full')}
          </div>

          <div className='flex items-center gap-2 text-sm text-gray-600 mt-4'>
            <div className='flex-1 border-b border-gray-400'>
              {renderEditableField('date', '', 'w-full')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
