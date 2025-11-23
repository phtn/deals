'use client'

import {Button} from '@/components/ui/button'
import {Toolbar} from '@/components/ui/toolbar'
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip'
import {useAffiliateView} from '@/ctx/affiliate/view'
import {Icon} from '@/lib/icons'
import {cn} from '@/lib/utils'

const AffiliatesToolbar = () => {
  const {view, setView} = useAffiliateView()

  return (
    <Toolbar>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size='sq'
            variant={view === 'stats' ? 'default' : 'ghost'}
            onClick={() => setView('stats')}
            className={cn(view === 'stats' && 'bg-teal-200 text-primary')}>
            <Icon name='chart' className='size-5' />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='left'>Stats</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size='sq'
            variant={view === 'table' ? 'default' : 'ghost'}
            onClick={() => setView('table')}
            className={cn(
              view === 'table' && 'bg-teal-200/60 text-primary dark:text-vim',
            )}>
            <Icon name='table' className='size-5' />
          </Button>
        </TooltipTrigger>
        <TooltipContent>View Table</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size='sq'
            variant={view === 'calendar' ? 'default' : 'ghost'}
            onClick={() => setView('calendar')}
            className={cn(
              'bg-transparent',
              view === 'calendar' && 'text-primary dark:hover:text-vim',
            )}>
            <Icon name='calendar' className='size-6' />
          </Button>
        </TooltipTrigger>
        <TooltipContent className='hidden md:flex'>Calendar</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size='sq'
            variant={view === 'add-new' ? 'default' : 'ghost'}
            onClick={() => setView('add-new')}
            className={cn(
              'px-0',
              view === 'add-new' && 'bg-teal-200 text-primary dark:text-vim',
            )}>
            <Icon name='add-square' className='size-6' />
          </Button>
        </TooltipTrigger>
        <TooltipContent side='right' className='hidden md:flex'>
          Add New
        </TooltipContent>
      </Tooltip>
    </Toolbar>
  )
}

export default AffiliatesToolbar
