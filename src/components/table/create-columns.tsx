import {Icon, IconName} from '@/lib/icons'
import {cn} from '@/lib/utils'
import {
  CellContext,
  ColumnDef,
  FilterFnOption,
  Row,
  Table,
} from '@tanstack/react-table'
import {AnimatePresence, motion} from 'motion/react'
import {ReactNode, Ref, useEffect, useMemo, useRef, useState} from 'react'
import {Checkbox} from '../ui/checkbox'
import {RowActions} from './row-actions'

// Generic filter function for text-based columns
export const filterFn = (
  row: Row<unknown>,
  columnId: string,
  filterValue: unknown,
): boolean => {
  const value = row.getValue(columnId)

  if (value === null || value === undefined) return false
  if (!filterValue) return true // no filter applied → keep row

  return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
}

// Generic filter function for multi-select columns (like status)
export const multiSelectFilterFn = <T,>(
  row: Row<T>,
  columnId: string,
  filterValue: string[],
): boolean => {
  if (!filterValue?.length) return true
  const status = String(row.getValue(columnId))
  return filterValue.includes(status)
}

// Column factory configuration interface
export interface ColumnConfig<T> {
  id: string
  header: ReactNode
  accessorKey: keyof T
  /**
   * Cell renderer function that receives CellContext
   *
   * @example
   * ```tsx
   * // Using textCell from cells.tsx
   * cell: textCell('name', 'font-medium')
   *
   * // Using dateCell from cells.tsx
   * cell: dateCell('createdAt', (date) => format(date, 'MMM dd, yyyy'))
   *
   * // Using booleanCell from cells.tsx
   * cell: booleanCell('isActive', { trueLabel: 'Active', falseLabel: 'Inactive' })
   *
   * // Custom cell renderer
   * cell: ({ getValue }) => {
   *   const value = getValue()
   *   return <span className={value > 100 ? 'text-green-600' : 'text-red-600'}>
   *     {value}
   *   </span>
   * }
   * ```
   */
  cell?: (ctx: CellContext<T, unknown>) => ReactNode
  size?: number
  filterFn?: FilterFnOption<T>
  enableHiding?: boolean
  enableSorting?: boolean
  meta?: Record<string, unknown>
}

// Action configuration interface
export interface ActionConfig<T> {
  viewFn?: VoidFunction
  deleteFn?: (row: T) => void
  customActions?: Array<{
    label: string
    icon?: IconName
    onClick: (row: T) => void
    variant?: 'default' | 'destructive'
    shortcut?: string
  }>
}

// Generic column factory function
export const createColumns = <T,>(
  columnConfigs: ColumnConfig<T>[],
  actionConfig?: ActionConfig<T>,
  showSelectColumn: boolean = false,
): ColumnDef<T>[] => {
  const columns: ColumnDef<T>[] = []

  // Always add select column but control visibility through animation
  columns.push({
    id: 'select',
    header: ({table}) => (
      <SelectAllCheckbox table={table} isVisible={showSelectColumn} />
    ),
    cell: ({row}) => (
      <SelectRowCheckbox row={row} isVisible={showSelectColumn} />
    ),
    size: 50,
    enableHiding: false,
    enableSorting: false,
    meta: {
      isVisible: showSelectColumn,
    },
  })

  // Add data columns based on configuration
  columnConfigs.forEach((config) => {
    const column: ColumnDef<T> = {
      header: config.header as string,
      accessorKey: config.accessorKey as string,
      size: config.size ?? 150,
      filterFn: config.filterFn ?? filterFn,
      enableHiding: config.enableHiding ?? true,
      enableSorting: config.enableSorting ?? true,
      ...config.meta,
    }

    // Apply cell renderer if provided
    if (config.cell) {
      column.cell = config.cell
    }

    columns.push(column)
  })

  // Add actions column if action config is provided
  if (
    actionConfig &&
    (actionConfig.viewFn ||
      actionConfig.deleteFn ||
      actionConfig.customActions?.length)
  ) {
    columns.push({
      id: 'actions',
      header: () => (
        <div className='w-full flex justify-center'>
          <Icon
            name='chevron-down'
            className='size-4 dark:text-cyan-200/80 text-mac-blue/50'
          />
        </div>
      ),
      cell: ({row}) => (
        <RowActions
          row={row}
          viewFn={actionConfig.viewFn}
          deleteFn={actionConfig.deleteFn}
          customActions={actionConfig.customActions}
        />
      ),
      size: 0,
      enableHiding: false,
    })
  }

  return columns
}

// Select all checkbox component for table header
const SelectAllCheckbox = <T,>({
  table,
  isVisible,
}: {
  table: Table<T>
  isVisible: boolean
}) => {
  const checkboxRef = useRef<HTMLInputElement>(null)
  const [isChecked, setIsChecked] = useState(table.getIsAllPageRowsSelected())

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = table.getIsSomePageRowsSelected()
      if (table.getIsSomePageRowsSelected()) {
        setIsChecked(false)
      }
      if (table.getIsAllPageRowsSelected()) {
        setIsChecked(true)
      }
    }
  }, [table])

  return (
    <AnimatePresence mode='wait'>
      {isVisible && (
        <motion.div
          initial={{opacity: 0.2, x: -1}}
          animate={isVisible ? {opacity: 1, x: 2} : {x: 10}}
          // exit={{x: -40}}
          className={cn('w-10 md:w-11 flex justify-center items-center')}>
          <Checkbox
            ref={checkboxRef as Ref<HTMLButtonElement>}
            defaultChecked={table.getIsAllPageRowsSelected()}
            onClick={(v) => table.getToggleAllPageRowsSelectedHandler()(v)}
            className='w-6 flex justify-center items-center'>
            <Icon
              name={
                typeof isChecked === 'boolean'
                  ? isChecked
                    ? 'checkmark-circle'
                    : 'checkbox-unchecked'
                  : 'checkbox-indeterminate'
              }
              className={cn('size-4 md:size-6 shrink-0', {
                'dark:text-amber-500 text-amber-600': isChecked === undefined,
                'text-background bg-foreground rounded-full':
                  isChecked === true,
                'text-foreground': isChecked === false,
              })}
            />
          </Checkbox>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Select row checkbox component for table cells
const SelectRowCheckbox = <T,>({
  row,
  isVisible,
}: {
  row: Row<T>
  isVisible: boolean
}) => {
  const checkboxRef = useRef<HTMLInputElement | null>(null)
  const prevVisibleRef = useRef(isVisible)

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = row.getIsSomeSelected()
    }
  }, [row])

  const [isChecked, setIsChecked] = useState(row.getIsSelected())

  useEffect(() => {
    setIsChecked(row.getIsSelected())
  }, [row])

  useEffect(() => {
    if (!isVisible) {
      prevVisibleRef.current = isVisible
    }
  }, [isVisible])

  prevVisibleRef.current = isVisible
  // Only animate on visibility changes, not on selection changes
  const shouldAnimate = useMemo(
    () => prevVisibleRef.current !== isVisible,
    [isVisible],
  )

  const initial = useMemo(
    () =>
      prevVisibleRef.current !== isVisible ? {scale: 0} : {scale: 1, x: 10},
    [isVisible],
  )

  return (
    <AnimatePresence mode='wait'>
      {isVisible && (
        <motion.div
          initial={initial}
          animate={shouldAnimate ? {scale: 1, x: 10} : {x: 10}}
          // exit={{x: shouldAnimate ? -10 : 0}}
          className={cn('w-6 flex items-center justify-center')}>
          <Checkbox
            ref={checkboxRef as Ref<HTMLButtonElement>}
            defaultChecked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={(value) => row.getToggleSelectedHandler()(value)}
            className={cn('w-6 flex justify-center items-center')}>
            <Icon
              name={isChecked ? 'check' : 'checkbox-unchecked'}
              className={cn('size-4 md:size-5 rounded-full', {
                'bg-mac-blue dark:bg-mac-blue/80 opacity-100 text-background dark:text-white':
                  isChecked,
                'bg-foreground': shouldAnimate,
              })}
            />
          </Checkbox>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
