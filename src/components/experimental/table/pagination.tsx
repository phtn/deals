import {Label} from '@/components/ui/label'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from '@/components/ui/pagination'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {Icon} from '@/lib/icons'
import {PaginationState} from '@tanstack/react-table'
import {useId} from 'react'
import {TButton} from './buttons'

export interface PageControl {
  disabledNext: boolean
  disabledPrev: boolean
  gotoNext: VoidFunction
  gotoPrev: VoidFunction
  gotoFirst: VoidFunction
  gotoLast: VoidFunction
}

interface Props {
  state: PaginationState
  rowCount: number
  setPageSize: (v: string) => void
  pageControl: PageControl
}
export const Paginator = ({
  state,
  rowCount,
  setPageSize,
  pageControl,
}: Props) => {
  const id = useId()
  return (
    <div className='flex items-center justify-between py-2'>
      {/* Results per page */}
      <div className='flex items-center space-x-8 px-6'>
        <Label htmlFor={id} className='font-space tracking-tight'>
          <span className='font-semibold text-base mr-2'>{rowCount}</span>
          <span className='opacity-80'>items</span>
        </Label>
        <div className='flex items-center dark:hover:bg-background/10 dark:focus-visible:bg-background/15 pl-3 py-1 rounded-lg space-x-1 dark:bg-dysto/20'>
          <Label
            htmlFor={'showing-rows'}
            className='max-sm:sr-only font-space tracking-tight'>
            {/*<span className='font-semibold text-base'>{rowCount}</span>*/}
            <span className='opacity-80'>showing</span>
          </Label>
          <Select value={state.pageSize.toString()} onValueChange={setPageSize}>
            <SelectTrigger
              id='showing-rows'
              className=' w-fit whitespace-nowrap font-space'>
              <SelectValue placeholder='Select number of results' />
            </SelectTrigger>
            <SelectContent className='w-32 [&_*[role=option]]:ps-2 [&_*[role=option]]:pe-4 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2'>
              {[5, 10, 25, 50].map((pageSize) => (
                <SelectItem
                  className=''
                  key={pageSize}
                  value={pageSize.toString()}>
                  <span className='mr-2'>{pageSize ?? 10}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Page number information */}
      <div className='px-4 text-muted-foreground flex grow justify-end text-sm whitespace-nowrap'>
        <p
          className='hidden text-muted-foreground text-sm whitespace-nowrap'
          aria-live='polite'>
          <span className='text-foreground'>
            {state.pageIndex * state.pageSize + 1}-
            {Math.min(
              Math.max(state.pageIndex * state.pageSize + state.pageSize, 0),
              rowCount,
            )}
          </span>{' '}
          of <span className='text-foreground'>{rowCount}</span>
        </p>
      </div>

      {/* Pagination buttons */}
      <div className='px-6'>
        <Pagination>
          <PaginationContent className='gap-3'>
            <PaginationItem>
              <TButton
                variant='outline'
                onClick={pageControl.gotoPrev}
                disabled={pageControl.disabledPrev}
                className='dark:bg-background/10 aspect-square size-8 p-0 aria-disabled:pointer-events-none aria-disabled:text-muted-foreground/50 border-[0.33px] dark:border-dark-origin/30 hover:bg-muted/50 dark:hover:bg-background/40 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0_1px_1px_rgba(0,0,0,0.05),0_2px_2px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.05)] dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]'
                aria-label='Go to next page'>
                <Icon name='chevron-left' className='size-4' />
              </TButton>
            </PaginationItem>
            <PaginationItem>
              <TButton
                variant='outline'
                onClick={pageControl.gotoNext}
                disabled={pageControl.disabledNext}
                className='dark:bg-background/10 aspect-square size-8 p-0 aria-disabled:pointer-events-none aria-disabled:text-muted-foreground/50 border-[0.33px] dark:border-dark-origin/30 hover:bg-muted/50 dark:hover:bg-background/40 shadow-[0px_0px_0px_1px_rgba(0,0,0,0.04),0_1px_1px_rgba(0,0,0,0.05),0_2px_2px_rgba(0,0,0,0.05),0_2px_4px_rgba(0,0,0,0.05)] dark:inset-shadow-[0_1px_rgb(255_255_255/0.15)]'
                aria-label='Go to next page'>
                <Icon name='chevron-right' className='size-4' />
              </TButton>
            </PaginationItem>
            {/* First page button */}
            {/* <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50"
                onClick={pageCtrl.gotoFirst}
                disabled={pageCtrl.disabledPrev}
                aria-label="Go to first page"
              >
                <ChevronFirstIcon size={16} aria-hidden="true" />
              </Button>
            </PaginationItem> */}
            {/* Previous page button */}

            {/* Next page button */}

            {/* Last page button */}
            {/* <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50"
                onClick={pageCtrl.gotoLast}
                disabled={pageCtrl.disabledNext}
                aria-label="Go to last page"
              >
                <ChevronLastIcon size={16} aria-hidden="true" />
              </Button>
            </PaginationItem> */}
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

// const SelectRows = () => (
//   <Select
//           name={'rows'}
//           onValueChange={(value) => item.validators?.onChange(value)}>
//           <SelectTrigger
//             size='default'
//             className='min-h-14 h-fit py-4 md:py-4 cursor-pointer rounded-2xl dark:bg-background/25 bg-background border-[0.33px] border-gray-500/50 outline-none text-left w-full'>
//             <SelectValue
//               placeholder={item.placeholder ?? 'Select an option'}
//               className='text-neutral-200 h-full placeholder:text-base'
//             />
//           </SelectTrigger>
//           <SelectContent className='w-full rounded-2xl border-gray-400 [&_*[role=option]]:ps-3 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-4'>
//             <HyperList
//               data={item.options}
//               component={SelectFieldItem}
//               itemStyle='border-b border-origin/0 last:border-none'
//               keyId='value'
//             />
//           </SelectContent>
//         </Select>
// )
