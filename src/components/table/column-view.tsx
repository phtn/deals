import {Badge} from '@/components/ui/badge'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {Icon} from '@/lib/icons'
import {cn} from '@/lib/utils'
import {Column} from '@tanstack/react-table'

interface Props<T> {
  cols: Column<T, unknown>[]
  isMobile: boolean
}
export const ColumnView = <T,>({cols, isMobile}: Props<T>) => {
  const invisibleColumns = cols.filter((col) => !col.getIsVisible())
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='secondary'
          className='relative select-none font-sans md:aspect-auto aspect-square data-[state=open]:bg-origin/50'>
          {invisibleColumns.length > 0 && (
            <Badge className='absolute bg-amber-500 dark:bg-amber-600 rounded-full -top-1.5 md:-top-0.5 left-full -translate-x-3.5 md:-translate-1/2 size-5 aspect-square px-1 text-white font-space'>
              {invisibleColumns.length > 99 ? '99+' : invisibleColumns.length}
            </Badge>
          )}
          <Icon name='eye' className='size-4 opacity-60' />
          <span className='hidden md:flex'>View</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={isMobile ? 'end' : 'start'}
        className='bg-dark-origin dark:bg-dark-origin p-3 rounded-3xl min-w-44'>
        <DropdownMenuLabel className='flex items-center space-x-1.5 italic capitalize'>
          <Icon
            name='arrow-swap'
            className='size-4 rounded-full bg-zinc-400/80 dark:bg-background -rotate-55 text-white dark:opacity-60'
          />
          <span className='opacity-60'>Toggle columns</span>
        </DropdownMenuLabel>
        <div className='h-0.5 bg-origin/50 my-2' />
        {cols.map((column) => {
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              className={cn(
                'text-xs h-10 md:h-12 opacity-60 italic',
                column.getIsVisible() && 'opacity-100 not-italic',
              )}
              checked={column.getIsVisible()}
              onCheckedChange={(value) => column.toggleVisibility(!!value)}
              onSelect={(event) => event.preventDefault()}>
              {columns[column.id]}
            </DropdownMenuCheckboxItem>
          )
        })}
        <DropdownMenuSeparator className='dark:bg-origin/30' />
        <Button
          onClick={() => cols.forEach((col) => col.toggleVisibility(true))}
          className='w-full tracking-tight font-medium font-figtree rounded-2xl hover:bg-origin dark:hover:bg-origin/20 hover:border-origin dark:hover:border-origin/80 h-12'
          variant='outline'>
          Restore defaults
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const columns: Record<string, string> = {
  serialNumber: 'Serial Number',
  ownerId: 'Owner',
  createdByName: 'Created By',
  isActive: 'Status',
  createdAt: 'Created At',
  group: 'Group',
  series: 'Series',
  Batch: 'Batch',
}
