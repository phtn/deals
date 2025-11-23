import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {useCopy} from '@/hooks/use-copy'
import {Icon, IconName} from '@/lib/icons'
import {cn} from '@/lib/utils'
import {Table} from '@tanstack/react-table'
import {useCallback, useMemo} from 'react'

interface Props<T> {
  loading: boolean
  table: Table<T>
  tableName?: string
}

interface IMenuItem {
  id: string
  label: string
  icon: IconName
  fn: VoidFunction
  disabled?: boolean
}

export const ExportTable = <T,>({table, tableName = '', loading}: Props<T>) => {
  const {copy} = useCopy({timeout: 2000})
  const handleCopy = useCallback(async () => {
    const data = table.getRowModel().rows.map((row) => row.original)
    await copy(`Table: ${tableName}`, JSON.stringify(data, null, 2))
  }, [table, tableName, copy])

  const exportOptions = useMemo(
    () =>
      [
        {
          id: 'csv',
          label: 'CSV',
          icon: 'code-square',
          fn: () => console.log('csv'),
        },
        {
          id: 'copy-json',
          label: 'Copy JSON',
          icon: 'json',
          fn: handleCopy(),
          // fn: () => copy('Row', JSON.stringify(row.original, null, 2)),
        },
        {
          id: 'print',
          label: 'Print',
          icon: 'printer',
          fn: () => console.log('delete'),
        },
      ] as IMenuItem[],
    [handleCopy],
  )
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='secondary'
            className={cn(
              'ml-auto bg-background/30 translate-x-0 transition-transform duration-200 ease-in-out md:aspect-auto aspect-square select-none',
            )}>
            <Icon
              name={loading ? 'spinners-ring' : 'download'}
              className='size-4 opacity-60'
            />
            <span className='font-sans md:inline-flex items-center gap-2 hidden'>
              {loading ? 'Loading' : 'Export'}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align='end'
          alignOffset={12}
          className='rounded-3xl md:p-3 p-2.5 border-origin md:min-w-40'>
          <DropdownMenuGroup className='space-y-1 tracking-tight font-figtree'>
            {exportOptions.map((option) => (
              <DropdownMenuItem
                key={option.id}
                asChild
                className='h-12 rounded-2xl px-4'>
                <button onClick={option.fn} className='w-full'>
                  <Icon name={option.icon} className='size-4 mr-2' />
                  <span>{option.label}</span>
                </button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
