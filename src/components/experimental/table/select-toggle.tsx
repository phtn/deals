import {Badge} from '@/components/ui/badge'
import {Icon} from '@/lib/icons'
import {cn} from '@/lib/utils'
import {Row} from '@tanstack/react-table'
import {TButton} from './buttons'

interface SelectToggleProps<T> {
  on: boolean
  toggleFn: VoidFunction
  rows: Row<T>[]
}

export const SelectToggle = <T,>({
  on,
  toggleFn,
  rows,
}: SelectToggleProps<T>) => {
  // rows already contains only selected rows from table.getSelectedRowModel().rows
  const selectedCount = rows.length

  return (
    <div className='relative inline-block'>
      {selectedCount > 0 && (
        <Badge
          variant='default'
          className='absolute bg-mac-blue z-100 pointer-events-none select-none rounded-full -top-2 -right-2 size-5 min-w-5 aspect-square px-1 text-white font-space flex items-center justify-center shadow-lg'>
          {selectedCount > 99 ? '99+' : selectedCount}
        </Badge>
      )}
      <TButton
        variant='secondary'
        className='relative aspect-square select-none'
        onClick={toggleFn}>
        <Icon
          name={'checkbox-indeterminate-2'}
          className={cn('size-4', on ? 'text-blue-400' : 'opacity-40')}
        />
        <span className='hidden md:flex'>Select</span>
      </TButton>
    </div>
  )
}
