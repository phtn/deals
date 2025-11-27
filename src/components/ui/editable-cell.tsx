'use client'

import {Input} from '@/components/ui/input'
import {useToggle} from '@/hooks/use-toggle'
import {cn} from '@/lib/utils'
import {HTMLAttributes, useEffect, useRef} from 'react'

interface EditableCellProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
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
  const {on: isEditing, toggle: toggleEdit} = useToggle()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      toggleEdit()
    }
  }

  return (
    <div
      className={cn(
        'w-full relative flex min-h-[45px] flex-col justify-between bg-white px-2 py-1 text-xs hover:bg-neutral-50 cursor-text group transition-colors',
        className,
      )}
      onClick={toggleEdit}
      {...props}>
      <span className='font-semibold text-[10px] dark:text-background opacity-60 font-figtree uppercase tracking-wide select-none'>
        {label}
      </span>

      {isEditing ? (
        <Input
          ref={inputRef}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={toggleEdit}
          onKeyDown={handleKeyDown}
          className='absolute inset-x-0 bottom-0 focus-within:outline-none md:h-10 w-full dark:bg-transparent text-center rounded-none px-2 border-none dark:border-transparent font-semibold uppercase dark:text-background outline-none focus:ring-0 focus:ring-blue-500/20'
        />
      ) : (
        <div
          className={cn('flex items-end justify-center pb-0.5 ', {
            'md:max-w-[100ch]': value !== undefined || value !== null,
          })}>
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
