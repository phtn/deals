import {HyperList} from '@/components/list'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {useCopy} from '@/hooks/use-copy'
import {Icon, IconName} from '@/lib/icons'
import {cn} from '@/lib/utils'
import {Row} from '@tanstack/react-table'
import {useMutation} from 'convex/react'
import {FunctionReference} from 'convex/server'
import {useCallback, useState} from 'react'
import {TButton} from './buttons'

interface ISubMenuItem {
  label: string
  icon?: IconName
  fn: VoidFunction
  variant?: 'default' | 'destructive'
  shortcut?: string
}

interface CustomAction<T> {
  label: string
  icon?: IconName
  onClick: (row: T) => void
  variant?: 'default' | 'destructive'
  shortcut?: string
}

interface Props<T> {
  row: Row<T>
  icon?: IconName
  viewFn?: VoidFunction
  deleteFn?: (row: T) => void
  customActions?: CustomAction<T>[]
  /**
   * Convex mutation API reference for deleting a row (e.g., api.affiliates.m.removeOne)
   */
  deleteMutation?: FunctionReference<
    'mutation',
    'public',
    {[key: string]: unknown},
    unknown
  >
  /**
   * Field name to use as the ID for deletion (e.g., 'uid', '_id', 'id')
   * Defaults to checking common fields: '_id', 'uid', 'id'
   */
  idField?: keyof T | string
  /**
   * Key name for the mutation arguments (e.g., 'uid' or 'id')
   * Defaults to idField if provided, otherwise 'id'
   */
  deleteArgsKey?: string
}

export const RowActions = <T,>({
  row,
  icon = 'more-v',
  viewFn,
  deleteFn,
  customActions = [],
  deleteMutation,
  idField,
  deleteArgsKey,
}: Props<T>) => {
  const {copy} = useCopy({timeout: 2000})
  const [loading, setLoading] = useState(false)

  const handleView = useCallback(() => {
    if (typeof viewFn === 'function') {
      viewFn()
    }
  }, [viewFn])

  const handleDelete = useCallback(() => {
    deleteFn?.(row.original)
  }, [row.original, deleteFn])

  const handleCustomAction = useCallback(
    (action: CustomAction<T>) => {
      action.onClick(row.original)
    },
    [row.original],
  )

  const submenuItems: Array<ISubMenuItem> = [
    {label: 'CSV', icon: 'printer', fn: () => console.log('csv')},
    {
      label: 'Copy JSON',
      icon: 'content-share-solid' as IconName,
      fn: () => copy('Row', JSON.stringify(row.original, null, 2)),
    },
    {
      label: 'Advance',
      icon: 'code' as IconName,
      fn: () => console.log('delete'),
    },
  ]

  // Get the mutation hook if deleteMutation is provided
  const deleteRowMutation = useMutation(
    deleteMutation as FunctionReference<'mutation'>,
  )

  // Determine the ID field to use
  const getIdValue = useCallback((): string | undefined => {
    if (idField) {
      const value = row.getValue(idField as string)
      return value ? String(value) : undefined
    }

    // Try common ID fields in order of preference
    const commonFields: (keyof T | string)[] = ['_id', 'uid', 'id']
    for (const field of commonFields) {
      try {
        const value = row.getValue(field as string)
        if (value !== null && value !== undefined) {
          return String(value)
        }
      } catch {
        // Field doesn't exist, try next
        continue
      }
    }

    return undefined
  }, [row, idField])

  // Determine the args key name for the mutation
  const getArgsKey = useCallback((): string => {
    if (deleteArgsKey) return deleteArgsKey
    if (idField) return String(idField)
    return 'id'
  }, [deleteArgsKey, idField])

  const handleDeleteRow = useCallback(async () => {
    if (!deleteRowMutation) return

    const idValue = getIdValue()
    if (!idValue) {
      console.error('Unable to determine ID field for row deletion')
      return
    }

    const argsKey = getArgsKey()
    setLoading(true)
    try {
      await deleteRowMutation({[argsKey]: idValue} as {[key: string]: unknown})
    } catch (error) {
      console.error('Failed to delete row:', error)
    } finally {
      setLoading(false)
    }
  }, [deleteRowMutation, getIdValue, getArgsKey])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <TButton
          size='sq'
          variant='ghost'
          className='shadow-none rounded-lg cursor-pointer hover:bg-terminal/10 dark:data-[state=open]:bg-terminal/50 data-[state=open]:bg-terminal/10'
          aria-label='More'>
          <Icon
            solid
            name={loading ? 'spinners-ring' : icon}
            className={cn('text-muted-foreground size-4', {
              'dark:text-amber-400': loading,
            })}
          />
        </TButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        alignOffset={12}
        className='rounded-3xl md:p-3 p-2.5 border-origin md:min-w-40'>
        {customActions.length > 0 && (
          <DropdownMenuGroup>
            {customActions.map((action, index) => (
              <DropdownMenuItem
                key={index}
                className={cn(
                  'h-14',
                  action.variant === 'destructive'
                    ? 'text-destructive focus:text-destructive'
                    : '',
                )}
                onClick={() => handleCustomAction(action)}>
                {action.icon && (
                  <Icon name={action.icon} className='size-4 mr-2' />
                )}
                <span>{action.label}</span>
                {action.shortcut && (
                  <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}

        {customActions.length > 0 && <DropdownMenuSeparator />}

        <DropdownMenuGroup className='space-y-1 tracking-tight font-figtree'>
          {viewFn && (
            <DropdownMenuItem asChild className='h-12 rounded-2xl px-4'>
              <button onClick={handleView} className='w-full'>
                <Icon name='eye' className='size-4 mr-2' />
                <span>View</span>
              </button>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={handleDeleteRow}
            className='h-12 rounded-2xl px-4'>
            <Icon name='close' className='size-4 mr-2' />
            <span>Delete Row</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        {/*<DropdownMenuSeparator className='dark:bg-dysto/60' />*/}

        <DropdownMenuGroup className='space-y-1 tracking-tight font-figtree'>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className='h-12 rounded-2xl pl-3'>
              <Icon name='chevron-left' className='size-5 opacity-60' />
              <span className='w-full pl-3.5'>Export</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent
                className='rounded-3xl p-0 border-origin min-w-40 tracking-tight font-figtree'
                alignOffset={-8}
                sideOffset={-4}>
                <HyperList data={submenuItems} component={SubMenuItem} />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        {deleteFn && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className='text-destructive focus:text-destructive'
              onClick={handleDelete}>
              <Icon name='close' className='size-4 mr-2' />
              <span>Delete</span>
              <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const SubMenuItem = (item: ISubMenuItem) => (
  <DropdownMenuItem
    onClick={item.fn}
    className={cn(
      'cursor-pointer h-14 py-4 pl-4 pr-1 rounded-none dark:focus:bg-terminal/30',
    )}>
    <Icon
      name={item.icon ? item.icon : 'chevron-right'}
      className='size-4 mr-2'
    />
    <span>{item.label}</span>
  </DropdownMenuItem>
)
