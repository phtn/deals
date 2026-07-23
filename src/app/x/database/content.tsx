'use client'

import {Button} from '@/components/ui/button'
import {Input} from '@/components/ui/input'
import {onError, onInfo, onSuccess} from '@/ctx/toast'
import {Icon} from '@/lib/icons'
import {cn} from '@/lib/utils'
import {
  ArrowRight,
  Check,
  ChevronDown,
  Columns3,
  Database,
  FileSpreadsheet,
  Rows3,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react'
import {
  type ChangeEvent,
  type DragEvent,
  useDeferredValue,
  useMemo,
  useRef,
  useState,
} from 'react'

const MAX_FILE_SIZE = 20 * 1024 * 1024
const ACCEPTED_EXTENSIONS = new Set([
  'csv',
  'tsv',
  'xls',
  'xlsx',
  'xlsm',
  'ods',
])
const FILE_ACCEPT = '.csv,.tsv,.xls,.xlsx,.xlsm,.ods'
const REVIEW_ROW_LIMIT = 7
const REVIEW_COLUMN_LIMIT = 8
const TABLE_ROW_LIMIT = 100
const TABLE_COLUMN_LIMIT = 30

type CellValue = string | number | boolean
type ProviderId = 'google-drive' | 'dropbox' | 'onedrive' | 'box'

interface CloudProvider {
  id: ProviderId
  name: string
  helper: string
}

interface ParsedSheet {
  name: string
  rows: CellValue[][]
}

interface ParsedFile {
  name: string
  size: number
  sheets: ParsedSheet[]
}

interface NormalizedTable {
  columns: string[]
  rows: CellValue[][]
}

interface CreatedTable extends NormalizedTable {
  name: string
  fileName: string
  sheetName: string
  createdAt: Date
}

const CLOUD_PROVIDERS: CloudProvider[] = [
  {id: 'google-drive', name: 'Google Drive', helper: 'Sheets and files'},
  {id: 'dropbox', name: 'Dropbox', helper: 'Choose a file'},
  {id: 'onedrive', name: 'OneDrive', helper: 'Microsoft files'},
  {id: 'box', name: 'Box', helper: 'Team storage'},
]

const IMPORT_STEPS = ['Choose source', 'Review data', 'Create table']

const cellToText = (value: CellValue | undefined) =>
  value === undefined ? '' : String(value)

const getColumnLabel = (index: number) => {
  let label = ''
  let position = index + 1

  while (position > 0) {
    const remainder = (position - 1) % 26
    label = String.fromCharCode(65 + remainder) + label
    position = Math.floor((position - 1) / 26)
  }

  return `Column ${label}`
}

const normalizeTable = (
  rows: CellValue[][],
  firstRowContainsHeaders: boolean,
): NormalizedTable => {
  let columnCount = 0

  for (const row of rows) {
    columnCount = Math.max(columnCount, row.length)
  }

  const headerRow = firstRowContainsHeaders ? rows[0] : undefined
  const nameCounts = new Map<string, number>()
  const columns = Array.from({length: columnCount}, (_, index) => {
    const candidate =
      cellToText(headerRow?.[index]).trim() || getColumnLabel(index)
    const lookupKey = candidate.toLocaleLowerCase()
    const count = (nameCounts.get(lookupKey) ?? 0) + 1
    nameCounts.set(lookupKey, count)
    return count === 1 ? candidate : `${candidate} ${count}`
  })

  return {
    columns,
    rows: rows.slice(firstRowContainsHeaders ? 1 : 0),
  }
}

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const getTableName = (fileName: string) =>
  fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .trim() || 'Untitled table'

export const Content = () => {
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null)
  const [selectedSheetIndex, setSelectedSheetIndex] = useState(0)
  const [tableName, setTableName] = useState('')
  const [firstRowContainsHeaders, setFirstRowContainsHeaders] = useState(true)
  const [createdTable, setCreatedTable] = useState<CreatedTable | null>(null)
  const [isParsing, setIsParsing] = useState(false)

  const activeSheet = parsedFile?.sheets[selectedSheetIndex]
  const normalizedTable = useMemo(
    () =>
      activeSheet
        ? normalizeTable(activeSheet.rows, firstRowContainsHeaders)
        : null,
    [activeSheet, firstRowContainsHeaders],
  )

  const resetImport = () => {
    setParsedFile(null)
    setSelectedSheetIndex(0)
    setTableName('')
    setFirstRowContainsHeaders(true)
    setCreatedTable(null)
  }

  const parseFile = async (file: File) => {
    const extension = file.name.split('.').pop()?.toLocaleLowerCase()

    if (!extension || !ACCEPTED_EXTENSIONS.has(extension)) {
      onError('Choose a CSV, TSV, Excel, or OpenDocument spreadsheet.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      onError('That file is larger than the 20 MB limit.')
      return
    }

    setIsParsing(true)

    try {
      const XLSX = await import('xlsx')
      const fileBuffer = await file.arrayBuffer()
      const workbook = XLSX.read(fileBuffer, {
        type: 'array',
        cellDates: true,
      })
      const sheets = workbook.SheetNames.map((sheetName) => {
        const worksheet = workbook.Sheets[sheetName]
        const rawRows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
          blankrows: false,
          raw: false,
        }) as unknown[][]
        const rows = rawRows
          .map((row) =>
            row.map((cell): CellValue => {
              if (
                typeof cell === 'string' ||
                typeof cell === 'number' ||
                typeof cell === 'boolean'
              ) {
                return cell
              }

              return cell == null ? '' : String(cell)
            }),
          )
          .filter((row) => row.some((cell) => cellToText(cell).trim()))

        return {name: sheetName, rows}
      }).filter((sheet) => sheet.rows.length > 0)

      if (sheets.length === 0) {
        throw new Error('No rows were found in this file.')
      }

      setParsedFile({name: file.name, size: file.size, sheets})
      setSelectedSheetIndex(0)
      setTableName(getTableName(file.name))
      setFirstRowContainsHeaders(true)
      setCreatedTable(null)
      onSuccess(`Loaded ${file.name}`)
    } catch (error) {
      onError(
        error instanceof Error ? error.message : 'The file could not be read.',
      )
    } finally {
      setIsParsing(false)
    }
  }

  const createTable = () => {
    const cleanName = tableName.trim()

    if (!cleanName) {
      onError('Give your table a name before creating it.')
      return
    }

    if (!normalizedTable || !parsedFile || !activeSheet) return

    setCreatedTable({
      ...normalizedTable,
      name: cleanName,
      fileName: parsedFile.name,
      sheetName: activeSheet.name,
      createdAt: new Date(),
    })
    onSuccess(`${cleanName} is ready`)
  }

  const selectCloudProvider = (provider: CloudProvider) => {
    onInfo(
      `${provider.name} needs OAuth credentials and a server callback before it can connect.`,
    )
  }

  const currentStep = createdTable ? 3 : parsedFile ? 2 : 1

  return (
    <main className='relative h-full w-full overflow-y-auto bg-[#f7f7f4] dark:bg-zinc-950'>
      <div
        className='pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(120,113,108,0.12),transparent_68%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_68%)]'
        aria-hidden='true'
      />

      <div className='relative mx-auto flex min-h-full w-full max-w-[1320px] flex-col px-4 sm:px-6 lg:px-8'>
        <header className='hidden _flex items-center justify-between gap-4 border-b border-zinc-200/80 py-4 dark:border-zinc-800/80'>
          <div className='flex min-w-0 items-center gap-3'>
            <div className='flex size-9 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900'>
              <Database className='size-4.5' strokeWidth={1.7} />
            </div>
            <div className='min-w-0'>
              <h1 className='font-figtree text-sm font-semibold tracking-tight'>
                Tables
              </h1>
              <p className='truncate text-xs text-zinc-500 dark:text-zinc-400'>
                Import, structure, and manage your data
              </p>
            </div>
          </div>

          <Button
            variant='dark'
            size='sm'
            leftIcon='add'
            onClick={resetImport}
            disabled={isParsing}>
            New table
          </Button>
        </header>

        {createdTable ? (
          <CreatedTableView table={createdTable} onNewImport={resetImport} />
        ) : parsedFile && activeSheet && normalizedTable ? (
          <ReviewStep
            parsedFile={parsedFile}
            selectedSheetIndex={selectedSheetIndex}
            tableName={tableName}
            firstRowContainsHeaders={firstRowContainsHeaders}
            table={normalizedTable}
            onBack={resetImport}
            onCreate={createTable}
            onFirstRowContainsHeadersChange={setFirstRowContainsHeaders}
            onSelectedSheetIndexChange={setSelectedSheetIndex}
            onTableNameChange={setTableName}
          />
        ) : (
          <SourceStep
            isParsing={isParsing}
            onCloudProviderSelect={selectCloudProvider}
            onFileSelect={parseFile}
          />
        )}

        <div className='sr-only' aria-live='polite'>
          Step {currentStep} of 3: {IMPORT_STEPS[currentStep - 1]}
        </div>
      </div>
    </main>
  )
}

interface SourceStepProps {
  isParsing: boolean
  onFileSelect: (file: File) => Promise<void>
  onCloudProviderSelect: (provider: CloudProvider) => void
}

const SourceStep = ({
  isParsing,
  onFileSelect,
  onCloudProviderSelect,
}: SourceStepProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0]
    event.currentTarget.value = ''
    if (file) void onFileSelect(file)
  }

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (file) void onFileSelect(file)
  }

  return (
    <section className='flex flex-1 items-center'>
      <div className='w-full'>
        <div className='mx-auto max-w-2xl text-center mb-12 space-y-6'>
          <span className='mb-3 hidden _inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1 text-[11px] font-medium text-zinc-600 shadow-sm backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-300'>
            <FileSpreadsheet className='size-3.5 text-emerald-600 dark:text-emerald-400' />
            A clean table in three steps
          </span>
          <h2 className='font-poly text-xl leading-tight tracking-wide text-zinc-950 lg:text-4xl dark:text-zinc-50'>
            Bring your data to the table.
          </h2>
          <div>
            <p className='mx-auto mt-3 max-w-xl text-base leading-6 text-zinc-500 dark:text-zinc-400'>
              Upload or Connect your spreadsheet from the cloud.
            </p>
            <p className='mx-auto max-w-2xl text-base leading-6 text-zinc-500 dark:text-zinc-400'>
              We’ll detect your columns, let you review, then create the table.
            </p>
          </div>
        </div>

        <ImportProgress activeStep={1} />

        <div className='mx-auto mt-5 overflow-hidden rounded-3xl border border-zinc-200/90 bg-white/90 shadow-[0_24px_70px_-35px_rgba(24,24,27,0.38)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90'>
          <div className='grid lg:grid-cols-[minmax(0,1.12fr)_minmax(350px,0.88fr)]'>
            <div className='p-5 sm:p-7 lg:p-8'>
              <div className='mb-5 flex items-start justify-between gap-4'>
                <div>
                  <h3 className='font-figtree text-base font-semibold tracking-tight'>
                    Upload a file
                  </h3>
                  <p className='mt-1 text-xs text-zinc-500 dark:text-zinc-400'>
                    Excel, CSV, TSV, or OpenDocument
                  </p>
                </div>
                <span className='rounded-md bg-zinc-100 px-2 py-1 font-mono text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'>
                  MAX 20 MB
                </span>
              </div>

              <label
                className={cn(
                  'group relative flex min-h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed px-6 py-10 text-center outline-none transition-all duration-200',
                  'border-zinc-300 bg-zinc-50/70 hover:border-zinc-400 hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-zinc-900/20',
                  'dark:border-zinc-700 dark:bg-zinc-950/45 dark:hover:border-zinc-600 dark:hover:bg-zinc-950/70 dark:focus-visible:ring-white/20',
                  isDragging &&
                    'scale-[0.995] border-emerald-500 bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/20',
                  isParsing && 'pointer-events-none opacity-70',
                )}
                tabIndex={0}
                aria-busy={isParsing}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
                onDragEnter={(event) => {
                  event.preventDefault()
                  setIsDragging(true)
                }}
                onDragOver={(event) => event.preventDefault()}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}>
                <div
                  className='absolute inset-0 opacity-60 background-[radial-gradient(circle_at_center,rgba(113,113,122,0.14)_1px,transparent_1px)] background-size-[18px_18px] mask-[linear-gradient(to_bottom,black,transparent)] dark:opacity-30'
                  aria-hidden='true'
                />
                <div className='relative mb-5 flex h-16 w-[76px] items-center justify-center'>
                  <div className='absolute left-0 top-3 flex size-11 -rotate-6 items-center justify-center rounded-xl border border-zinc-200 bg-white text-emerald-600 shadow-sm transition-transform group-hover:-translate-x-1 group-hover:-rotate-12 dark:border-zinc-700 dark:bg-zinc-900 dark:text-emerald-400'>
                    <Icon name='excel' className='size-7' />
                  </div>
                  <div className='absolute right-0 top-1 flex size-12 rotate-6 items-center justify-center rounded-xl border border-zinc-200 bg-white shadow-md transition-transform group-hover:translate-x-1 group-hover:rotate-12 dark:border-zinc-700 dark:bg-zinc-900'>
                    <Icon name='cloud-upload' className='size-6' />
                  </div>
                </div>
                <p className='relative text-sm font-sans font-medium'>
                  {isParsing
                    ? 'Reading your spreadsheet…'
                    : isDragging
                      ? 'Drop it here'
                      : 'Drop a spreadsheet here'}
                </p>
                <p className='relative mt-1.5 text-xs text-zinc-500 dark:text-zinc-400'>
                  or{' '}
                  <span className='font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4 dark:text-zinc-100 dark:decoration-zinc-600'>
                    browse your computer
                  </span>
                </p>
                <input
                  ref={fileInputRef}
                  className='sr-only'
                  type='file'
                  accept={FILE_ACCEPT}
                  disabled={isParsing}
                  onChange={handleInputChange}
                />
              </label>
            </div>

            <div className='border-t border-zinc-200 bg-zinc-50/60 p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8 dark:border-zinc-800 dark:bg-zinc-950/30'>
              <div className='mb-5'>
                <h3 className='font-figtree text-base font-semibold tracking-tight'>
                  Connect cloud storage
                </h3>
                <p className='mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400'>
                  Pick a file without downloading it first.
                </p>
              </div>

              <div className='grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2'>
                {CLOUD_PROVIDERS.map((provider) => (
                  <button
                    key={provider.id}
                    type='button'
                    className='group/provider flex min-h-[74px] items-center gap-3 rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-left shadow-sm outline-none transition-all duration-300 hover:-translate-y-px hover:border-zinc-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:focus-visible:ring-white/20'
                    onClick={() => onCloudProviderSelect(provider)}>
                    <ProviderLogo id={provider.id} />
                    <span className='min-w-0 flex-1'>
                      <span className='block truncate text-xs font-medium tracking-tight'>
                        {provider.name}
                      </span>
                      <span className='mt-0.5 block truncate text-[11px] text-zinc-500 dark:text-zinc-400'>
                        {provider.helper}
                      </span>
                    </span>
                    <ArrowRight className='size-3.5 -translate-x-1 text-zinc-400 opacity-0 transition group-hover/provider:translate-x-0 group-hover/provider:opacity-100' />
                  </button>
                ))}
              </div>

              <div className='mt-5 rounded-xl border border-zinc-200/80 bg-white/60 px-3.5 py-3 dark:border-zinc-800 dark:bg-zinc-900/60'>
                <div className='flex items-start gap-2.5'>
                  <ShieldCheck className='mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400' />
                  <p className='text-[11px] leading-4 text-zinc-500 dark:text-zinc-400'>
                    Cloud connections use provider sign-in and only request
                    access to the files you choose.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-2 border-t border-zinc-200 bg-zinc-50/70 px-5 py-3 text-[11px] text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-8 dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-400'>
            <span className='flex items-center gap-1.5'>
              <ShieldCheck className='size-3.5 text-emerald-600 dark:text-emerald-400' />
              Local files are processed in your browser
            </span>
            <span>CSV · XLS · XLSX · XLSM · ODS</span>
          </div>
        </div>
      </div>
    </section>
  )
}

interface ReviewStepProps {
  parsedFile: ParsedFile
  selectedSheetIndex: number
  tableName: string
  firstRowContainsHeaders: boolean
  table: NormalizedTable
  onBack: () => void
  onCreate: () => void
  onSelectedSheetIndexChange: (index: number) => void
  onTableNameChange: (name: string) => void
  onFirstRowContainsHeadersChange: (value: boolean) => void
}

const ReviewStep = ({
  parsedFile,
  selectedSheetIndex,
  tableName,
  firstRowContainsHeaders,
  table,
  onBack,
  onCreate,
  onSelectedSheetIndexChange,
  onTableNameChange,
  onFirstRowContainsHeadersChange,
}: ReviewStepProps) => {
  const selectedSheet = parsedFile.sheets[selectedSheetIndex]

  return (
    <section className='flex flex-1 flex-col py-7 sm:py-9'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400'>
            File imported
          </p>
          <h2 className='font-poly text-2xl sm:text-2xl'>Review your table</h2>
          <p className='mt-2 text-sm text-zinc-500 dark:text-zinc-400'>
            Check the detected columns before creating it.
          </p>
        </div>
        <ImportProgress activeStep={2} compact />
      </div>

      <div className='overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-[0_20px_60px_-38px_rgba(24,24,27,0.45)] dark:border-zinc-800 dark:bg-zinc-900'>
        <div className='flex flex-col gap-3 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-zinc-800'>
          <div className='flex min-w-0 items-center gap-3'>
            <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'>
              <FileSpreadsheet className='size-5' strokeWidth={1.7} />
            </div>
            <div className='min-w-0'>
              <p className='truncate text-sm font-medium'>{parsedFile.name}</p>
              <p className='mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400'>
                {formatFileSize(parsedFile.size)} · {parsedFile.sheets.length}{' '}
                {parsedFile.sheets.length === 1 ? 'sheet' : 'sheets'} detected
              </p>
            </div>
          </div>
          <button
            type='button'
            className='self-start rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 sm:self-auto dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
            onClick={onBack}>
            Choose another file
          </button>
        </div>

        <div className='grid xl:grid-cols-[320px_minmax(0,1fr)]'>
          <aside className='border-b border-zinc-200 bg-zinc-50/60 p-5 sm:p-6 xl:border-b-0 xl:border-r dark:border-zinc-800 dark:bg-zinc-950/30'>
            <div className='space-y-5'>
              <div>
                <label
                  htmlFor='table-name'
                  className='mb-2 block text-xs font-medium'>
                  Table name
                </label>
                <Input
                  id='table-name'
                  value={tableName}
                  placeholder='Untitled table'
                  className='h-10 bg-white dark:bg-zinc-900'
                  onChange={(event) => onTableNameChange(event.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor='sheet-select'
                  className='mb-2 block text-xs font-medium'>
                  Sheet to import
                </label>
                <div className='relative'>
                  <select
                    id='sheet-select'
                    value={selectedSheetIndex}
                    className='h-10 w-full appearance-none rounded-md border border-input bg-white px-3 pr-9 text-sm outline-none transition focus:border-ring dark:bg-zinc-900'
                    onChange={(event) =>
                      onSelectedSheetIndexChange(Number(event.target.value))
                    }>
                    {parsedFile.sheets.map((sheet, index) => (
                      <option key={sheet.name} value={index}>
                        {sheet.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className='pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400' />
                </div>
              </div>

              <button
                type='button'
                role='checkbox'
                aria-checked={firstRowContainsHeaders}
                className='flex w-full items-start gap-3 rounded-xl border border-zinc-200 bg-white p-3.5 text-left outline-none transition hover:border-zinc-300 focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 dark:focus-visible:ring-white/20'
                onClick={() =>
                  onFirstRowContainsHeadersChange(!firstRowContainsHeaders)
                }>
                <span
                  className={cn(
                    'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition',
                    firstRowContainsHeaders
                      ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                      : 'border-zinc-300 bg-white dark:border-zinc-600 dark:bg-zinc-950',
                  )}>
                  {firstRowContainsHeaders ? (
                    <Check className='size-3' strokeWidth={2.5} />
                  ) : null}
                </span>
                <span>
                  <span className='block text-xs font-medium'>
                    First row contains headers
                  </span>
                  <span className='mt-1 block text-[11px] leading-4 text-zinc-500 dark:text-zinc-400'>
                    Use the first row as column names.
                  </span>
                </span>
              </button>
            </div>

            <div className='mt-6 grid grid-cols-2 gap-2'>
              <MetricCard
                icon={<Rows3 className='size-3.5' />}
                label='Rows'
                value={table.rows.length.toLocaleString()}
              />
              <MetricCard
                icon={<Columns3 className='size-3.5' />}
                label='Columns'
                value={table.columns.length.toLocaleString()}
              />
            </div>
          </aside>

          <div className='min-w-0 p-5 sm:p-6'>
            <div className='mb-4 flex items-center justify-between gap-4'>
              <div>
                <h3 className='text-sm font-medium'>Preview</h3>
                <p className='mt-1 text-[11px] text-zinc-500 dark:text-zinc-400'>
                  Showing the first{' '}
                  {Math.min(REVIEW_ROW_LIMIT, table.rows.length)} rows from{' '}
                  {selectedSheet.name}
                </p>
              </div>
              <span className='hidden items-center gap-1.5 rounded-full bg-emerald-50/80 px-2.5 py-1 text-xs font-medium text-emerald-700 sm:inline-flex dark:bg-emerald-950/50 dark:text-emerald-400'>
                <Check className='size-3' />
                Ready to create
              </span>
            </div>

            <DataPreview table={table} />
          </div>
        </div>

        <div className='flex items-center justify-between gap-3 border-t border-zinc-200 bg-zinc-50/70 px-5 py-4 sm:px-6 dark:border-zinc-800 dark:bg-zinc-950/30'>
          <button
            type='button'
            className='rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 transition hover:bg-zinc-200/60 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
            onClick={onBack}>
            Back
          </button>
          <Button
            variant='dark'
            size='sm'
            rightIcon='arrow-right'
            onClick={onCreate}>
            Create table
          </Button>
        </div>
      </div>
    </section>
  )
}

const DataPreview = ({table}: {table: NormalizedTable}) => {
  const visibleColumns = table.columns.slice(0, REVIEW_COLUMN_LIMIT)
  const visibleRows = table.rows.slice(0, REVIEW_ROW_LIMIT)
  const hiddenColumnCount = table.columns.length - visibleColumns.length

  return (
    <div className='overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800'>
      <div className='overflow-x-auto'>
        <table className='w-full min-w-[680px] border-collapse text-left text-xs'>
          <thead>
            <tr className='bg-zinc-100/90 dark:bg-zinc-800/80'>
              <th className='w-11 border-b border-r border-zinc-200 px-3 py-3 text-center font-mono text-[10px] font-normal text-zinc-400 dark:border-zinc-700'>
                #
              </th>
              {visibleColumns.map((column, index) => (
                <th
                  key={`${column}-${index}`}
                  className='min-w-32 border-b border-r border-zinc-200 px-3 py-3 text-[11px] font-medium last:border-r-0 dark:border-zinc-700'>
                  <span className='block truncate'>{column}</span>
                </th>
              ))}
              {hiddenColumnCount > 0 ? (
                <th className='min-w-24 border-b border-zinc-200 px-3 py-3 text-center text-[10px] font-medium text-zinc-400 dark:border-zinc-700'>
                  +{hiddenColumnCount} more
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className='bg-white transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/50'>
                <td className='border-b border-r border-zinc-200 px-3 py-3 text-center font-mono text-[10px] text-zinc-400 dark:border-zinc-800'>
                  {rowIndex + 1}
                </td>
                {visibleColumns.map((column, columnIndex) => {
                  const value = cellToText(row[columnIndex])
                  return (
                    <td
                      key={`${column}-${columnIndex}`}
                      title={value}
                      className='max-w-52 border-b border-r border-zinc-200 px-3 py-3 text-zinc-600 last:border-r-0 dark:border-zinc-800 dark:text-zinc-300'>
                      <span className='block truncate'>{value || '—'}</span>
                    </td>
                  )
                })}
                {hiddenColumnCount > 0 ? (
                  <td className='border-b border-zinc-200 dark:border-zinc-800' />
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visibleRows.length === 0 ? (
        <div className='flex h-32 items-center justify-center text-xs text-zinc-400'>
          This sheet has headers but no data rows.
        </div>
      ) : null}
    </div>
  )
}

interface CreatedTableViewProps {
  table: CreatedTable
  onNewImport: () => void
}

const CreatedTableView = ({table, onNewImport}: CreatedTableViewProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const searchResult = useMemo(() => {
    const query = deferredSearchQuery.trim().toLocaleLowerCase()

    if (!query) {
      return {
        total: table.rows.length,
        rows: table.rows.slice(0, TABLE_ROW_LIMIT).map((row, index) => ({
          row,
          sourceIndex: index,
        })),
      }
    }

    const rows: {row: CellValue[]; sourceIndex: number}[] = []
    let total = 0

    table.rows.forEach((row, sourceIndex) => {
      const matches = row.some((cell) =>
        cellToText(cell).toLocaleLowerCase().includes(query),
      )

      if (matches) {
        total += 1
        if (rows.length < TABLE_ROW_LIMIT) rows.push({row, sourceIndex})
      }
    })

    return {total, rows}
  }, [deferredSearchQuery, table.rows])
  const visibleColumns = table.columns.slice(0, TABLE_COLUMN_LIMIT)
  const hiddenColumnCount = table.columns.length - visibleColumns.length

  return (
    <section className='flex flex-1 flex-col py-7 sm:py-9'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <div className='mb-2 flex items-center gap-2'>
            <span className='flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'>
              <Check className='size-3' strokeWidth={2.5} />
            </span>
            <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-400'>
              Table created
            </p>
          </div>
          <h2 className='font-poly text-2xl tracking-tight sm:text-3xl'>
            {table.name}
          </h2>
          <p className='mt-2 text-sm text-zinc-500 dark:text-zinc-400'>
            Imported from {table.fileName} · {table.sheetName}
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <span className='rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-400'>
            Local draft
          </span>
          <Button
            variant='default'
            size='sm'
            leftIcon='add'
            onClick={onNewImport}>
            Import another
          </Button>
        </div>
      </div>

      <div className='overflow-hidden rounded-[22px] border border-zinc-200 bg-white shadow-[0_20px_60px_-38px_rgba(24,24,27,0.45)] dark:border-zinc-800 dark:bg-zinc-900'>
        <div className='flex flex-col gap-4 border-b border-zinc-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-zinc-800'>
          <div className='flex items-center gap-5'>
            <div>
              <p className='text-[10px] font-medium uppercase tracking-wider text-zinc-400'>
                Rows
              </p>
              <p className='mt-0.5 text-sm font-semibold tabular-nums'>
                {table.rows.length.toLocaleString()}
              </p>
            </div>
            <div className='h-8 w-px bg-zinc-200 dark:bg-zinc-800' />
            <div>
              <p className='text-[10px] font-medium uppercase tracking-wider text-zinc-400'>
                Columns
              </p>
              <p className='mt-0.5 text-sm font-semibold tabular-nums'>
                {table.columns.length.toLocaleString()}
              </p>
            </div>
          </div>

          <div className='relative w-full sm:w-64'>
            <Search className='pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400' />
            <Input
              type='search'
              value={searchQuery}
              aria-label='Search table'
              placeholder='Search this table…'
              className='h-9 bg-zinc-50 pl-9 pr-8 dark:bg-zinc-950/50'
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            {searchQuery ? (
              <button
                type='button'
                aria-label='Clear search'
                className='absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 transition hover:text-zinc-700 dark:hover:text-zinc-200'
                onClick={() => setSearchQuery('')}>
                <X className='size-3.5' />
              </button>
            ) : null}
          </div>
        </div>

        <div className='max-h-[56vh] overflow-auto'>
          <table className='w-full min-w-[760px] border-collapse text-left text-xs'>
            <thead className='sticky top-0 z-10'>
              <tr className='bg-zinc-100/95 backdrop-blur dark:bg-zinc-800/95'>
                <th className='w-12 border-b border-r border-zinc-200 px-3 py-3 text-center font-mono text-[10px] font-normal text-zinc-400 dark:border-zinc-700'>
                  #
                </th>
                {visibleColumns.map((column, index) => (
                  <th
                    key={`${column}-${index}`}
                    className='min-w-36 border-b border-r border-zinc-200 px-3 py-3 text-[11px] font-medium dark:border-zinc-700'>
                    <span className='block truncate'>{column}</span>
                  </th>
                ))}
                {hiddenColumnCount > 0 ? (
                  <th className='min-w-24 border-b border-zinc-200 px-3 py-3 text-center text-[10px] font-medium text-zinc-400 dark:border-zinc-700'>
                    +{hiddenColumnCount} more
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {searchResult.rows.map(({row, sourceIndex}) => (
                <tr
                  key={sourceIndex}
                  className='bg-white transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/50'>
                  <td className='border-b border-r border-zinc-200 px-3 py-3 text-center font-mono text-[10px] text-zinc-400 dark:border-zinc-800'>
                    {sourceIndex + 1}
                  </td>
                  {visibleColumns.map((column, columnIndex) => {
                    const value = cellToText(row[columnIndex])
                    return (
                      <td
                        key={`${column}-${columnIndex}`}
                        title={value}
                        className='max-w-64 border-b border-r border-zinc-200 px-3 py-3 text-zinc-600 dark:border-zinc-800 dark:text-zinc-300'>
                        <span className='block truncate'>{value || '—'}</span>
                      </td>
                    )
                  })}
                  {hiddenColumnCount > 0 ? (
                    <td className='border-b border-zinc-200 dark:border-zinc-800' />
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>

          {searchResult.rows.length === 0 ? (
            <div className='flex h-44 flex-col items-center justify-center text-center'>
              <Search className='mb-3 size-5 text-zinc-300 dark:text-zinc-600' />
              <p className='text-xs font-medium'>No matching rows</p>
              <p className='mt-1 text-[11px] text-zinc-400'>
                Try a different search term.
              </p>
            </div>
          ) : null}
        </div>

        <div className='flex flex-col gap-1 border-t border-zinc-200 bg-zinc-50/70 px-5 py-3 text-[11px] text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-zinc-800 dark:bg-zinc-950/30 dark:text-zinc-400'>
          <span>
            Showing{' '}
            {Math.min(
              searchResult.rows.length,
              TABLE_ROW_LIMIT,
            ).toLocaleString()}{' '}
            of {searchResult.total.toLocaleString()} matching rows
          </span>
          <span>
            Created{' '}
            {table.createdAt.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </section>
  )
}

const MetricCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) => (
  <div className='rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900'>
    <div className='flex items-center gap-1.5 text-zinc-400'>
      {icon}
      <span className='text-[10px] font-ios uppercase tracking-wider'>
        {label}
      </span>
    </div>
    <p className='mt-2 text-lg font-poly font-medium tabular-nums'>{value}</p>
  </div>
)

const ImportProgress = ({
  activeStep,
  compact = false,
}: {
  activeStep: number
  compact?: boolean
}) => (
  <ol
    className={cn(
      'mx-auto flex w-full items-center justify-center',
      compact ? 'max-w-sm sm:mx-0' : 'max-w-md',
    )}
    aria-label='Import progress'>
    {IMPORT_STEPS.map((step, index) => {
      const stepNumber = index + 1
      const isComplete = stepNumber < activeStep
      const isActive = stepNumber === activeStep

      return (
        <li
          key={step}
          className={cn(
            'flex items-center',
            index < IMPORT_STEPS.length - 1 && 'flex-1',
          )}
          aria-current={isActive ? 'step' : undefined}>
          <span className='flex shrink-0 items-center gap-2'>
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors',
                isComplete &&
                  'border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500 dark:text-zinc-950',
                isActive &&
                  'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900',
                !isComplete &&
                  !isActive &&
                  'border-zinc-300 bg-white text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900',
              )}>
              {isComplete ? <Check className='size-3' /> : stepNumber}
            </span>
            <span
              className={cn(
                'hidden text-[11px] font-medium sm:block',
                isActive
                  ? 'text-zinc-900 dark:text-zinc-100'
                  : 'text-zinc-400 dark:text-zinc-500',
              )}>
              {step}
            </span>
          </span>
          {index < IMPORT_STEPS.length - 1 ? (
            <span
              className={cn(
                'mx-3 h-px flex-1 sm:mx-4',
                stepNumber < activeStep
                  ? 'bg-emerald-500'
                  : 'bg-zinc-200 dark:bg-zinc-800',
              )}
              aria-hidden='true'
            />
          ) : null}
        </li>
      )
    })}
  </ol>
)

const ProviderLogo = ({id}: {id: ProviderId}) => {
  if (id === 'google-drive') {
    return (
      <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-700'>
        <svg viewBox='0 0 24 24' className='size-5' aria-hidden='true'>
          <path fill='#0F9D58' d='M8.2 3.5h5.25l6.1 10.55h-5.28z' />
          <path fill='#F4B400' d='m8.2 3.5-5.75 9.96 2.62 4.53L13.45 3.5z' />
          <path fill='#4285F4' d='M5.07 17.99 7.7 13.46h11.85l-2.62 4.53z' />
        </svg>
      </span>
    )
  }

  if (id === 'dropbox') {
    return (
      <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f2f6ff] shadow-sm ring-1 ring-blue-100 dark:bg-blue-950/40 dark:ring-blue-900'>
        <svg viewBox='0 0 24 24' className='size-5' aria-hidden='true'>
          <path
            fill='#0061FF'
            d='m7.15 4.5 4.85 3-4.85 3-4.85-3zm9.7 0 4.85 3-4.85 3L12 7.5zm-9.7 7.2 4.85 3-4.85 3-4.85-3zm9.7 0 4.85 3-4.85 3-4.85-3zM7.35 18.9 12 16l4.65 2.9L12 21.75z'
          />
        </svg>
      </span>
    )
  }

  if (id === 'onedrive') {
    return (
      <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f2f8ff] shadow-sm ring-1 ring-sky-100 dark:bg-sky-950/40 dark:ring-sky-900'>
        <svg viewBox='0 0 24 24' className='size-6' aria-hidden='true'>
          <path
            fill='#0364B8'
            d='M9.6 7.1A5.25 5.25 0 0 1 19 9.9a4 4 0 0 1 .45 7.98H7.3a4.8 4.8 0 0 1 2.3-10.78'
          />
          <path
            fill='#28A8EA'
            d='M4.6 10.2a4.3 4.3 0 0 1 6.6-2.55 5.2 5.2 0 0 1 4.4 2.42 4.02 4.02 0 0 0-2.35 3.65H4.6a1.76 1.76 0 0 1 0-3.52'
          />
          <path
            fill='#0078D4'
            d='M7.3 17.88a4.78 4.78 0 0 1-2.7-7.68 4.3 4.3 0 0 1 6.6-2.55 5.22 5.22 0 0 1 7.8 2.25 4 4 0 0 0-3.4.17 5.2 5.2 0 0 0-4.4-2.42 4.82 4.82 0 0 0 0 9.15 4.7 4.7 0 0 1-3.9 1.08'
          />
        </svg>
      </span>
    )
  }

  return (
    <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f8ff] text-[15px] font-bold tracking-widest text-[#0061d5] shadow-sm ring-1 ring-blue-100 dark:bg-blue-950/40 dark:ring-blue-900'>
      <svg width='32' height='16' viewBox='0 0 462 244' role='img'>
        <g>
          <path
            fill='#0061D5'
            fill-rule='evenodd'
            d='M17.642.304c9.379 0 17.001 7.482 17.171 16.828v72.33c14.39-10.786 32.224-17.171 51.528-17.171 32.876 0 61.451 18.479 75.853 45.611 14.398-27.132 42.987-45.611 75.84-45.611 47.399 0 85.85 38.427 85.85 85.839 0 47.434-38.451 85.87-85.85 85.87-32.853 0-61.442-18.496-75.84-45.602C147.792 225.504 119.217 244 86.341 244 39.384 244 1.275 206.327.519 159.561H.5V17.132C.715 7.786 8.263.304 17.642.304Zm409.635 79.753c6.318-7.341 17.773-8.792 25.938-3.132 8.155 5.613 9.848 16.176 3.942 23.742l-46.723 57.351 46.666 57.24c5.918 7.587 4.217 18.12-3.939 23.755-8.164 5.637-19.617 4.202-25.941-3.15l-40.139-49.196-40.162 49.196c-6.252 7.352-17.779 8.787-25.919 3.15-8.14-5.635-9.841-16.168-3.905-23.755h-.016l46.638-57.24-46.638-57.351h.016c-5.936-7.566-4.235-18.124 3.905-23.742 8.14-5.66 19.667-4.209 25.919 3.132v-.012l40.162 49.264 40.196-49.264v.012Zm-189.243 26.605c-28.45 0-51.518 23.042-51.518 51.468 0 28.45 23.068 51.497 51.518 51.497 28.438 0 51.494-23.047 51.494-51.497 0-28.426-23.056-51.468-51.494-51.468Zm-151.693 0c-28.444 0-51.528 23.042-51.528 51.479 0 28.445 23.084 51.486 51.528 51.486 28.441 0 51.477-23.047 51.477-51.497 0-28.426-23.036-51.468-51.477-51.468Z'
            clip-rule='evenodd'></path>
        </g>
      </svg>
    </span>
  )
}
