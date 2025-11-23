'use client'

import {Input} from '@/components/ui/input'
import {cn} from '@/lib/utils'
import {HTMLAttributes, useEffect, useRef, useState} from 'react'

interface EditableCellProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'number' | 'date'
}

export function EditableCell({
  label,
  value,
  onChange,
  className,
  type = 'text',
  ...props
}: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleBlur = () => {
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      setIsEditing(false)
    }
  }

  return (
    <div
      className={cn(
        'relative flex min-h-[50px] flex-col justify-between bg-white px-2 py-1 text-xs hover:bg-neutral-50 cursor-text group transition-colors',
        className,
      )}
      onClick={() => setIsEditing(true)}
      {...props}>
      <span className='font-semibold text-[10px] dark:text-background opacity-60 font-figtree uppercase tracking-wider select-none'>
        {label}
      </span>

      {isEditing ? (
        <Input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className='absolute inset-x-0 bottom-0 focus-within:outline-none md:h-10 w-full dark:bg-transparent text-center rounded-none px-2 border-none dark:border-transparent font-semibold uppercase dark:text-background outline-none focus:ring-0 focus:ring-blue-500/20'
        />
      ) : (
        <div className='flex items-end justify-center pb-0.5 max-w-[100ch]'>
          <span
            className={cn(
              'text-sm font-semibold',
              !value &&
                'hover:text-sky-600 text-transparent px-3 py-1 w-full rounded-sm bg-sky-100/30 font-normal text-sm',
              'transition-colors duration-200 ease-in-out',
            )}>
            {value || 'Click to Edit'}
          </span>
        </div>
      )}
    </div>
  )
}
