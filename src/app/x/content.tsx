'use client'

import {
  SettingsPanelTrigger,
  useSettingsPanel,
} from '@/components/settings-panel'
import {Button} from '@/components/ui/button'
import {SidebarTrigger} from '@/components/ui/sidebar'
import {Icon} from '@/lib/icons'
import {cn} from '@/lib/utils'
import {ReactNode, useMemo} from 'react'

export const Content = () => {
  const {state, togglePanel} = useSettingsPanel()
  const isExpanded = useMemo(() => state === 'expanded', [state])
  return (
    <Wrapper isPanelExpanded={isExpanded}>
      <div className='px-3 py-3.5 flex items-center justify-between border-b'>
        <SidebarTrigger className='' />
        <div className='bg-amber-100'>
          <SettingsPanelTrigger />
        </div>
        <Button
          size='sq'
          variant='ghost'
          data-sidebar='trigger'
          className={cn('text-foreground/80 hover:text-foreground')}
          onClick={togglePanel}>
          <Icon
            name='sidebar'
            className={cn('size-6', isExpanded && 'rotate-180')}
          />
          <span className='sr-only'>Toggle Sidebar</span>
        </Button>
      </div>
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
        'flex-1 [&>div>div]:h-full w-full border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-greyed',
        'overflow-hidden drop-shadow-xl',
        'md:rounded-xl ',
        {'': isPanelExpanded},
      )}>
      {children}
    </div>
  )
}
