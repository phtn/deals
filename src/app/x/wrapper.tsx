'use client'

import {useSettingsPanel} from '@/components/settings-panel'
import {Button} from '@/components/ui/button'
import {SidebarTrigger} from '@/components/ui/sidebar'
import {Icon} from '@/lib/icons'
import {cn} from '@/lib/utils'
import {usePathname} from 'next/navigation'
import {ReactNode, useMemo} from 'react'

interface WrappedContentProps {
  children: ReactNode
  toolbar?: ReactNode
}

export const WrappedContent = ({children, toolbar}: WrappedContentProps) => {
  const {state, togglePanel} = useSettingsPanel()
  const endpoint = usePathname().split('/').pop()
  const isExpanded = useMemo(() => state === 'expanded', [state])
  return (
    <Wrapper isPanelExpanded={isExpanded}>
      <div className='px-2 sm:px-3 py-3.5 flex items-center justify-between min-w-0'>
        <SidebarTrigger className='' />
        <div className='flex w-full min-w-0 capitalize text-lg tracking-tighter font-semibold px-1 md:px-2 lg:px-4'>
          {endpoint}
        </div>
        {toolbar}
        <Button
          size='sq'
          variant='ghost'
          data-sidebar='trigger'
          className={cn('text-foreground/80 hover:text-foreground')}
          onClick={togglePanel}>
          <Icon
            name='sidebar'
            className={cn('size-5', isExpanded && 'rotate-180')}
          />
          <span className='sr-only'>Toggle Sidebar</span>
        </Button>
      </div>
      {children}
    </Wrapper>
  )
}

interface WrapperProps {
  isPanelExpanded?: boolean
  children?: ReactNode
}
export const Wrapper = ({children, isPanelExpanded}: WrapperProps) => {
  return (
    <div
      className={cn(
        'flex-1 min-w-0 [&>div>div]:h-full w-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-greyed',
        'overflow-hidden drop-shadow-xl',
        'md:rounded-xl ',
        {'': isPanelExpanded},
      )}>
      {children}
    </div>
  )
}
