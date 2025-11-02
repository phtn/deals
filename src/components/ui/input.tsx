import {cn} from '@/lib/utils'
import {ComponentProps, forwardRef} from 'react'

type ValidatorFn = (value: string | number) => true | string
export type InputProps = ComponentProps<'input'> & {
  validators?: Record<string, ValidatorFn>
}
function Input({className, type, ...props}: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot='input'
      className={cn(
        'border-input file:text-foreground placeholder:text-muted-foreground/70 flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        type === 'search' &&
          '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none',
        type === 'file' &&
          'text-muted-foreground/70 file:border-input file:text-foreground p-0 pr-3 italic file:me-3 file:h-full file:border-0 file:border-r file:border-solid file:bg-transparent file:px-3 file:text-sm file:font-medium file:not-italic',
        className,
      )}
      {...props}
    />
  )
}

const ModernInput = forwardRef<HTMLInputElement, InputProps>(
  ({className, ...props}, ref) => {
    return (
      <div className='flex items-center space-x-2'>
        <input
          {...props}
          ref={ref}
          className={cn(
            'flex md:h-14 h-9 w-full rounded-lg px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-xs shadow-2xs',
            ' bg-background dark:bg-background/25 border border-origin dark:border-zinc-700',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
            'placeholder:text-muted-foreground/80 placeholder:tracking-tight ',
            'focus-visible:ring-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
            'dark:focus-visible:ring-primary-hover/50 ring-offset-background',
            className,
          )}
        />
      </div>
    )
  },
)

ModernInput.displayName = 'ModernInput'
export {Input, ModernInput}
