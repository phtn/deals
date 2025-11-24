'use client'

import {Icon} from '@/lib/icons'
import {useState} from 'react'

interface EditableFieldProps {
  value: string
  onChange: (value: string) => void
  className?: string
  type?: 'text' | 'number' | 'date' | 'time'
}

function EditableField({
  value,
  onChange,
  className = '',
  type = 'text',
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempValue, setTempValue] = useState(value)

  if (isEditing) {
    return (
      <input
        type={type}
        value={tempValue}
        onChange={(e) => setTempValue(e.target.value)}
        onBlur={() => {
          onChange(tempValue)
          setIsEditing(false)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onChange(tempValue)
            setIsEditing(false)
          }
        }}
        className={`bg-white/50 border border-emerald-500 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${className}`}
        autoFocus
      />
    )
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-white/30 rounded px-1 ${className}`}>
      {value}
    </span>
  )
}

export default function EditableFundTransfer() {
  const [amount, setAmount] = useState('2,500.00')
  const [senderName, setSenderName] = useState('John Doe')
  const [senderAccount, setSenderAccount] = useState('**** 4521')
  const [recipientName, setRecipientName] = useState('Sarah Johnson')
  const [recipientAccount, setRecipientAccount] = useState('**** 7890')
  const [date, setDate] = useState('March 15, 2024')
  const [time, setTime] = useState('2:45 PM')
  const [refNumber, setRefNumber] = useState('TXN20240315124578')
  const [transactionId, setTransactionId] = useState('9876543210ABCDEF')
  const [notes, setNotes] = useState('Payment for services rendered')

  return (
    <div className='w-full max-w-md mx-auto bg-linear-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-xl overflow-hidden'>
      {/* Success Header */}
      <div className='bg-linear-to-r from-emerald-500 to-teal-500 text-white p-8 text-center'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full'>
          <Icon name='check' className='w-10 h-10' strokeWidth={3} />
        </div>
      </div>

      {/* Amount Section */}
      <div className='bg-white/60 backdrop-blur-sm p-6 text-center border-b border-emerald-100'>
        <p className='text-sm text-greyed mb-1 font-space'>
          Amount Transferred
        </p>
        <div className='flex items-center justify-center gap-1'>
          <span className='text-2xl font-bold text-emerald-600'>$</span>
          <EditableField
            value={amount}
            onChange={setAmount}
            className='text-2xl min-w-28 font-bold text-emerald-600'
          />
        </div>
      </div>

      {/* Transaction Details */}
      <div className='space-y-4'>
        {/* From Section */}
        <div className='bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-emerald-100'>
          <p className='text-xs text-gray-500 uppercase tracking-wide mb-2'>
            SENDER
          </p>
          <div className='flex justify-between items-start'>
            <div>
              <EditableField
                value={senderName}
                onChange={setSenderName}
                className='font-semibold text-gray-800 block mb-1'
              />
              <EditableField
                value={senderAccount}
                onChange={setSenderAccount}
                className='text-sm text-greyed'
              />
            </div>
          </div>
        </div>

        {/* To Section */}
        <div className='bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-emerald-100'>
          <p className='text-xs text-gray-500 uppercase tracking-wide mb-2'>
            RECIPIENT
          </p>
          <div className='flex justify-between items-start'>
            <div>
              <EditableField
                value={recipientName}
                onChange={setRecipientName}
                className='font-semibold text-gray-800 block mb-1'
              />
              <EditableField
                value={recipientAccount}
                onChange={setRecipientAccount}
                className='text-sm text-greyed'
              />
            </div>
          </div>
        </div>

        {/* Transaction Info */}
        <div className='bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-emerald-100 space-y-3'>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-greyed'>Date & Time</span>
            <div className='flex gap-2 text-right'>
              <EditableField
                value={date}
                onChange={setDate}
                className='text-sm font-medium text-gray-800'
              />
              <EditableField
                value={time}
                onChange={setTime}
                className='text-sm font-medium text-gray-800'
              />
            </div>
          </div>

          <div className='flex justify-between items-center'>
            <span className='text-sm text-greyed'>Reference Number</span>
            <EditableField
              value={refNumber}
              onChange={setRefNumber}
              className='text-sm font-space font-medium text-greyed'
            />
          </div>

          <div className='flex justify-between items-center'>
            <span className='text-sm font-space text-greyed'>
              Transaction ID
            </span>
            <EditableField
              value={transactionId}
              onChange={setTransactionId}
              className='text-sm font-medium font-space text-greyed'
            />
          </div>

          <div className='flex justify-between items-start pt-2 border-t border-emerald-100'>
            <span className='text-sm text-greyed'>Notes</span>
            <EditableField
              value={notes}
              onChange={setNotes}
              className='text-sm text-gray-800 text-right max-w-[200px]'
            />
          </div>
        </div>

        {/* Status Badge */}
      </div>

      {/* Footer */}
      <div className='bg-linear-to-r from-emerald-500/10 to-teal-500/10 px-6 py-4 text-center border-t border-emerald-100'></div>
    </div>
  )
}
