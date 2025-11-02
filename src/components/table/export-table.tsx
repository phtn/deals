import {Button} from '@/components/ui/button'
import {Icon} from '@/lib/icons'
import {cn} from '@/lib/utils'

interface Props {
  loading: boolean
}

export const ExportTable = ({loading}: Props) => {
  return (
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
  )
}
