'use client'

import {DataTable} from '@/components/experimental/table'
import {TButton} from '@/components/experimental/table/buttons'
import {
  dateCell,
  editableRemarksCell,
  formatText,
  textCell,
} from '@/components/experimental/table/cells'
import {ColumnConfig} from '@/components/experimental/table/create-columns'
import {RowActions} from '@/components/experimental/table/row-actions'
import {HyperTableProps} from '@/components/ui/hyper-table'
import {Icon} from '@/lib/icons'
import {formatDate} from '@/utils/date'
import {FilterFn} from '@tanstack/react-table'
import {useMutation, useQuery} from 'convex/react'
import {useCallback, useEffect, useMemo, useState, useTransition} from 'react'
import {api} from '../../../../convex/_generated/api'
import {Doc, Id} from '../../../../convex/_generated/dataModel'
import {DocumentViewerDrawer} from './document-viewer'

export const DataTablePage = () => {
  const [isPending, startTransition] = useTransition()
  const [selectedItem, setSelectedItem] = useState<Doc<'documents'> | null>(
    null,
  )

  const docs = useQuery(api.documents.q.getAll)
  const removeMany = useMutation(api.documents.m.removeMany)

  const [data, setData] = useState<Doc<'documents'>[]>()

  useEffect(() => {
    if (docs === undefined) {
      return
    }

    startTransition(() => {
      setData(docs)
    })
  }, [docs, startTransition])

  // Combine initial loading state (docs === undefined) with transition pending state
  const loading = useMemo(
    () => docs === undefined || isPending,
    [docs, isPending],
  )

  const handleOptions = useCallback((item: Doc<'documents'>) => {
    setSelectedItem(item)
  }, [])

  const groupFilter: FilterFn<Doc<'documents'>> = (row, id, filterValue) => {
    const value = row.getValue(id)

    // Handle array filter values (from multi-select filter component)
    if (Array.isArray(filterValue)) {
      if (filterValue.length === 0) return true
      // Compare both normalized strings and original values
      const valueStr = String(value)
      return filterValue.some((fv) => String(fv) === valueStr || fv === value)
    }

    // Handle single value exact match
    if (filterValue == null || filterValue === '') return true
    return value === filterValue || String(value) === String(filterValue)
  }

  const handleDeleteSelected = useCallback(
    async (ids: Id<'documents'>[]) => {
      if (ids.length === 0) return
      await removeMany({ids})
    },
    [removeMany],
  )

  const columnConfigs = useMemo(
    () =>
      [
        {
          id: '_id',
          header: 'Id',
          accessorKey: '_id',
          cell: formatText(
            '_id',
            (v) => (v && v.substring(0, 7)) ?? '',
            'font-space text-xs text-muted-foreground',
          ),
          size: 150,
          enableHiding: true,
          enableSorting: true,
        },
        {
          id: 'documentType',
          header: 'Doctype',
          accessorKey: 'documentType',
          cell: formatText(
            'documentType',
            (v) => v.substring(0, 5),
            'font-space text-xs uppercase truncate text-clip w-[10ch]',
          ),
          size: 150,
          enableHiding: true,
          enableSorting: true,
          // Use default filterFn which handles both text and array filters
        },
        {
          id: 'ocrStatus',
          header: 'Status',
          accessorKey: 'ocrStatus',
          cell: textCell(
            'ocrStatus',
            'font-space text-xs uppercase truncate text-clip w-[10ch]',
          ),
          size: 150,
          enableHiding: true,
          enableSorting: true,
          filterFn: groupFilter,
        },
        {
          id: 'uploadedByName',
          header: 'Creator',
          accessorKey: 'uploadedByName',
          cell: formatText(
            'uploadedByName',
            (v) => String(v.split(' ').shift()),
            'font-space text-sm truncate text-clip w-[10ch]',
          ),
          size: 150,
          enableHiding: true,
          enableSorting: true,
          filterFn: groupFilter,
        },
        {
          id: 'mimeType',
          header: 'Format',
          accessorKey: 'mimeType',
          cell: formatText(
            'mimeType',
            (v) => String(v.split('/').pop()),
            'font-space text-xs uppercase truncate text-clip w-[10ch]',
          ),
          size: 150,
          enableHiding: true,
          enableSorting: true,
          filterFn: groupFilter,
        },
        {
          id: 'fileSize',
          header: 'Size',
          accessorKey: 'fileSize',
          cell: formatText(
            'fileSize',
            (v) => String((+v / 1000000).toFixed(2) + 'MB'),
            'font-space text-xs truncate text-clip w-[10ch]',
          ),
          size: 150,
          enableHiding: true,
          enableSorting: true,
        },
        {
          id: 'fileUrl',
          header: 'URL',
          accessorKey: 'fileUrl',
          cell: textCell('fileUrl', 'font-mono truncate text-clip w-[10ch]'),
          size: 150,
          enableHiding: true,
          enableSorting: true,
        },
        {
          id: 'remarks',
          header: 'Remarks',
          accessorKey: 'remarks',
          cell: editableRemarksCell<Doc<'documents'>>(
            'remarks',
            api.documents.m.update,
            'font-space text-muted-foreground',
            'Add remarks...',
          ),
          size: 200,
          enableHiding: true,
          enableSorting: false,
        },
        {
          id: '_creationTime',
          header: 'Creation',
          accessorKey: '_creationTime',
          cell: dateCell<Doc<'documents'>>(
            '_creationTime',
            (date) => formatDate(Number(date)),
            'font-space text-xs text-muted-foreground max-w-[20ch] truncate text-clip',
          ),
          size: 180,
          enableHiding: true,
          enableSorting: true,
        },
        {
          id: 'view',
          accessorKey: 'ocrResults',
          header: (
            <div className='w-fit flex justify-center px-1.5'>
              <Icon name='eye' className='size-4 md:size-5 opacity-80' />
            </div>
          ),
          cell: ({row}) => (
            <TButton
              size='sq'
              variant='ghost'
              className='shadow-none rounded-lg cursor-pointer hover:bg-terminal/10'
              aria-label='View document'
              onClick={() => handleOptions(row.original)}>
              <Icon name='eye' className='text-muted-foreground size-4' />
            </TButton>
          ),
          size: 0,
          enableHiding: false,
          enableSorting: false,
        },
        {
          id: 'actions',
          accessorKey: 'uploadedBy',
          header: (
            <div className='w-fit flex justify-center px-1.5'>
              <Icon name='settings' className='size-4 md:size-5 opacity-80' />
            </div>
          ),
          cell: ({row}) => (
            <RowActions
              icon='settings'
              row={row}
              viewFn={() => handleOptions(row.original)}
              deleteMutation={api.documents.m.removeOne}
              idField='_id'
              deleteArgsKey='id'
            />
          ),
          size: 0,
          enableHiding: false,
          enableSorting: false,
        },
      ] as ColumnConfig<Doc<'documents'>>[],
    [handleOptions],
  )

  const tableProps = useMemo(
    () =>
      ({
        title: 'Documents',
        viewer: {open: false, onOpenChange: () => {}},
        data: data ?? [],
        loading,
        columnConfigs,
        deleteIdAccessor: '_id',
        onDeleteSelected: handleDeleteSelected,
      }) as HyperTableProps<Doc<'documents'>, Id<'documents'>>,
    [data, loading, columnConfigs, handleDeleteSelected],
  )

  return (
    <>
      <DataTable {...tableProps} />
      <DocumentViewerDrawer
        document={selectedItem}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedItem(null)
          }
        }}
      />
    </>
  )
}
