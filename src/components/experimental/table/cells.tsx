import {ClassName} from '@/app/types'
import {cn} from '@/lib/utils'
import {CellContext} from '@tanstack/react-table'
import {useMutation} from 'convex/react'
import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react'
import {Doc, Id, TableNames} from '../../../../convex/_generated/dataModel'

// Helper type to extract table name from Doc type
type ExtractTableName<T> = T extends Doc<infer TN> ? TN : never

// Type for mutation that accepts id and data
type UpdateMutationArgs<T extends Doc<TableNames>> = {
  id: Id<ExtractTableName<T>>
  data: Partial<T>
}

// Type for mutation function reference - accepts any mutation that takes id and data
// Using Parameters to extract the exact type that useMutation accepts
type UpdateMutationRef = Parameters<typeof useMutation>[0]

interface CellOptions<T> {
  className?: ClassName
  formatter?: (
    value: string | number | symbol | Date,
    ctx: CellContext<T, unknown>,
  ) => ReactNode
  fallback?: ReactNode
}

/**
 * Generic factory for creating reusable cells.
 */
export function superCell<T>(prop: keyof T, options: CellOptions<T> = {}) {
  const CellComponent = (ctx: CellContext<T, unknown>) => {
    const rawValue = ctx.row.getValue(prop as string) as keyof T

    if (rawValue === null || rawValue === undefined) {
      return <div className={options.className}>{options.fallback ?? '—'}</div>
    }

    const value = options.formatter
      ? options.formatter(rawValue, ctx)
      : rawValue

    return <div className={options.className}>{value as string}</div>
  }
  CellComponent.displayName = `SuperCell(${String(prop)})`
  return CellComponent
}

/**
 * Specialized cells built on top of cellFactory
 */
export const textCell = <T, K extends keyof T>(
  prop: K,
  className?: ClassName,
  fallback?: ReactNode,
) => {
  const cell = superCell<T>(prop, {
    className,
    fallback,
  })
  cell.displayName = `TextCell(${String(prop)})`
  return cell
}

export const formatText = <T, K extends keyof T>(
  prop: K,
  formatter: (value: string) => string,
  className?: ClassName,
  fallback?: ReactNode,
) => {
  const cell = superCell<T>(prop, {
    className,
    fallback,
    formatter: (v) => formatter(String(v)),
  })
  cell.displayName = `TextCell(${String(prop)})`
  return cell
}

export const dateCell = <T,>(
  prop: keyof T,
  formatter: (d: string | number | symbol | Date) => string,
  className?: ClassName,
  fallback?: ReactNode,
) => {
  const cell = superCell<T>(prop, {
    className,
    fallback,
    formatter: (v) => formatter(v),
  })
  cell.displayName = `DateCell(${String(prop)})`
  return cell
}

export const booleanCell = <T, K extends keyof T>(
  prop: K,
  labels: {trueLabel?: string; falseLabel?: string} = {},
  className?: ClassName,
  fallback?: ReactNode,
) => {
  const cell = superCell<T>(prop, {
    className,
    fallback,
    formatter: (v) => (
      <>
        <div
          className={cn('size-2 mr-1.5 rounded-full bg-blue-500', {
            'bg-orange-400': !v,
          })}
        />
        {v ? (labels.trueLabel ?? 'True') : (labels.falseLabel ?? 'False')}
      </>
    ),
  })
  cell.displayName = `BooleanCell(${String(prop)})`
  return cell
}

/**
 * Editable status toggle cell that saves directly to Convex
 * Toggles between active/inactive (true/false) and saves immediately
 *
 * @param prop - The property name to toggle (e.g., 'active')
 * @param mutationApi - The Convex mutation API path (e.g., api.documents.m.update)
 * @param labels - Optional labels for true/false states
 * @param className - Optional CSS classes
 */
export const editableStatusCell = <T extends Doc<TableNames>>(
  prop: keyof T,
  mutationApi: UpdateMutationRef,
  labels: {trueLabel?: string; falseLabel?: string} = {},
  className?: ClassName,
) => {
  const EditableStatusComponent = (ctx: CellContext<T, unknown>) => {
    const [isUpdating, setIsUpdating] = useState(false)
    const patchMutation = useMutation(mutationApi)
    const value = ctx.row.getValue(prop as string) as boolean
    // Access _id from the row data (Convex adds this automatically)
    const rowData = ctx.row.original as T
    const id = rowData._id as Id<ExtractTableName<T>>

    const handleToggle = useCallback(async () => {
      setIsUpdating(true)
      try {
        const updateData: Partial<T> = {[prop]: !value} as Partial<T>
        const args: UpdateMutationArgs<T> = {
          id,
          data: updateData,
        }
        await patchMutation(args)
      } catch (error) {
        console.error('Failed to update status:', error)
      } finally {
        setIsUpdating(false)
      }
    }, [id, value, patchMutation])

    return (
      <button
        onClick={handleToggle}
        disabled={isUpdating}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-full border transition-all',
          'hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed',
          'w-fit rounded-full flex items-center border-zinc-200 dark:border-zinc-700',
          'border-[0.33px] py-0.5 px-1.5 capitalized font-space text-sm tracking-tighter',
          className,
        )}>
        {isUpdating ? (
          <div className='size-2 mr-1.5 border-2 border-current border-t-transparent rounded-full animate-spin' />
        ) : (
          <div
            className={cn('size-2 mr-1.5 rounded-full bg-blue-500', {
              'bg-orange-400': !value,
            })}
          />
        )}
        <span>
          {value
            ? (labels.trueLabel ?? 'Active')
            : (labels.falseLabel ?? 'Inactive')}
        </span>
      </button>
    )
  }
  EditableStatusComponent.displayName = `EditableStatusCell(${String(prop)})`
  return EditableStatusComponent
}

/**
 * Editable remarks cell with inline textarea/input that saves to Convex
 * Saves on blur or Enter key (with Escape to cancel)
 *
 * @param prop - The property name to edit (e.g., 'remarks')
 * @param mutationApi - The Convex mutation API path (e.g., api.documents.m.update)
 * @param className - Optional CSS classes
 * @param placeholder - Placeholder text when empty
 */
export const editableRemarksCell = <T extends Doc<TableNames>>(
  prop: keyof T,
  mutationApi: UpdateMutationRef,
  className?: ClassName,
  placeholder = 'Add remarks...',
) => {
  const EditableRemarksComponent = (ctx: CellContext<T, unknown>) => {
    const [isEditing, setIsEditing] = useState(false)
    const [localValue, setLocalValue] = useState('')
    const [isUpdating, setIsUpdating] = useState(false)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const patchMutation = useMutation(mutationApi)
    const originalValue = (ctx.row.getValue(prop as string) as string) ?? ''
    // Access _id from the row data (Convex adds this automatically)
    const rowData = ctx.row.original as T
    const id = rowData._id as Id<ExtractTableName<T>>

    // Initialize local value when component mounts or value changes
    useEffect(() => {
      setLocalValue(originalValue)
    }, [originalValue])

    // Focus input when editing starts
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, [isEditing])

    const handleSave = useCallback(async () => {
      if (localValue === originalValue) {
        setIsEditing(false)
        return
      }

      setIsUpdating(true)
      try {
        const updateData: Partial<T> = {[prop]: localValue} as Partial<T>
        const args: UpdateMutationArgs<T> = {
          id,
          data: updateData,
        }
        await patchMutation(args)
        setIsEditing(false)
      } catch (error) {
        console.error('Failed to update remarks:', error)
        // Revert on error
        setLocalValue(originalValue)
        setIsEditing(false)
      } finally {
        setIsUpdating(false)
      }
    }, [id, localValue, originalValue, patchMutation])

    const handleCancel = useCallback(() => {
      setLocalValue(originalValue)
      setIsEditing(false)
    }, [originalValue])

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          handleSave()
        } else if (e.key === 'Escape') {
          e.preventDefault()
          handleCancel()
        }
      },
      [handleSave, handleCancel],
    )

    if (isEditing) {
      return (
        <div className='relative'>
          <textarea
            ref={inputRef}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            disabled={isUpdating}
            placeholder={placeholder}
            rows={2}
            className={cn(
              'w-full min-w-[200px] resize-none rounded-md px-2 py-1 text-xs md:text-sm',
              'bg-background dark:bg-background/50 border border-primary/50',
              'focus:outline-none focus:ring-2 focus:ring-primary/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className,
            )}
            style={{
              minHeight: '32px',
              maxHeight: '120px',
            }}
          />
          {isUpdating && (
            <div className='absolute top-1 right-1 size-3 border-2 border-current border-t-transparent rounded-full animate-spin' />
          )}
        </div>
      )
    }

    return (
      <button
        onClick={() => setIsEditing(true)}
        className={cn(
          'w-full min-w-[200px] text-left px-2 py-1 rounded-md',
          'hover:bg-accent/50 transition-colors',
          'text-xs md:text-sm text-muted-foreground',
          'truncate',
          className,
        )}
        title={originalValue || placeholder}>
        {originalValue || (
          <span className='italic text-muted-foreground/60'>{placeholder}</span>
        )}
      </button>
    )
  }
  EditableRemarksComponent.displayName = `EditableRemarksCell(${String(prop)})`
  return EditableRemarksComponent
}
