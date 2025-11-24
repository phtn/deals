import {DataTable} from '@/components/experimental/table'
import {ColumnConfig} from '@/components/experimental/table/create-columns'

export interface HyperTableProps<T, I> {
  data: T[]
  title: string
  loading: boolean
  columnConfigs: ColumnConfig<T>[]
  viewer: {open: boolean; onOpenChange: (open: boolean) => void}
  onDeleteSelected?: (ids: I[]) => void | Promise<void>
  deleteIdAccessor?: keyof T
}

export const HyperTable = <T, I>(props: HyperTableProps<T, I>) => {
  return <DataTable {...props} />
}
