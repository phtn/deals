import {Icon} from '@/lib/icons'
import {cn} from '@/lib/utils'
import {Row} from '@tanstack/react-table'
import {useCallback, useState} from 'react'
import {TButton} from './buttons'

interface DeleteButtonProps<T, I> {
  rows: Row<T>[]
  onDelete: (ids: I[]) => void | Promise<void>
  idAccessor: keyof T
  disabled?: boolean
}

export const DeleteButton = <T, I>({
  rows,
  onDelete,
  idAccessor,
  disabled = false,
}: DeleteButtonProps<T, I>) => {
  const [loading, setLoading] = useState(false)
  // rows is already filtered to only selected rows from table.getSelectedRowModel().rows
  const selectedCount = rows.length
  const hasSelection = selectedCount > 0

  const handleDelete = useCallback(() => {
    if (!hasSelection) return
    setLoading(true)

    const selectedIds = rows.map((row) => {
      const value = row.original[idAccessor]
      return typeof value === 'string' ? value : String(value)
    }) as I[]

    if (selectedIds.length > 0) {
      Promise.resolve(onDelete(selectedIds)).finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [rows, onDelete, idAccessor, hasSelection])

  if (!hasSelection) {
    return null
  }

  return (
    <TButton
      variant='secondary'
      className='relative aspect-square select-none'
      onClick={handleDelete}
      disabled={disabled || !hasSelection}>
      <Icon
        name={loading ? 'spinners-ring' : 'close'}
        className={cn('md:size-5 size-4 text-mac-red dark:text-red-500', {
          'opacity-50': disabled || !hasSelection,
        })}
      />
      <span className='hidden md:flex'>Delete</span>
      {selectedCount > 0 && (
        <span className='absolute z-50 pointer-events-none select-none rounded-full -top-1.5 md:-top-0.5 left-full -translate-x-3.5 md:-translate-1/2 size-5 aspect-square px-1 text-white font-space bg-mac-red flex items-center justify-center text-xs'>
          {selectedCount > 99 ? '99+' : selectedCount}
        </span>
      )}
    </TButton>
  )
}
