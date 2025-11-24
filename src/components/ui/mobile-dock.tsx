'use client'

import {VoidPromise} from '@/app/types'
import {Button} from '@/components/ui/button'
import {Dock, DockIcon} from '@/components/ui/dock'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {Icon, IconName} from '@/lib/icons'
import {cn} from '@/lib/utils'
interface DockNav {
  id: string
  fn: VoidFunction
  icon: IconName
  label: string
}
interface DockToolbar {
  name: string
  fn: VoidFunction | VoidPromise
  icon: IconName
  style: string
}
interface DockOption {
  name: string
  fn: VoidFunction
  icon: IconName
  style: string
}

export interface DockItems {
  nav: DockNav[]
  toolbar: DockToolbar[]
  options: DockOption[]
}

interface SeparatorProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

const Separator = ({className, orientation = 'horizontal'}: SeparatorProps) => (
  <div
    className={cn(
      'h-[0.5px] w-full bg-zinc-200 dark:bg-zinc-700 dark:blur-[0.5px] rounded-full',
      orientation === 'vertical' &&
        'w-[0.5px] h-[95%] bg-linear-to-b  dark:bg-zinc-600',
      'from-zinc-200 via-zinc-400/50 to-zinc-300',
      'dark:from-zinc-900 dark:via-zinc-600 dark:to-zinc-800',
      className,
    )}
  />
)

interface MobileDockProps {
  dockItems?: DockItems
}

export const MobileDock = ({dockItems}: MobileDockProps) => {
  return (
    <div className=''>
      <TooltipProvider>
        <Dock
          direction='middle'
          className='dark:bg-background/95 backdrop-blur-3xl'>
          {dockItems?.nav.map((item) => (
            <DockIcon key={item.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size='sq'
                    id={item.id}
                    variant='ghost'
                    onClick={item.fn}
                    aria-label={item.label}
                    className={cn(
                      'md:size-12 size-12 rounded-xl hover:bg-zinc-300/30 dark:hover:bg-zinc-700/40',
                    )}>
                    <Icon
                      name={item.icon}
                      className={cn(
                        'size-6 md:size-7 text-zinc-600 dark:text-slate-300',
                      )}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={8}>
                  <p className='dark:text-white capitalize text-lg tracking-tight font-medium font-figtree'>
                    {item.label}
                  </p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}
          <Separator orientation='vertical' className='h-full' />
          {dockItems?.toolbar.map((tool) => (
            <DockIcon key={tool.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size='sq'
                    variant='ghost'
                    onClick={tool.fn}
                    aria-label={tool.name}
                    className={cn(
                      'md:size-12 size-11 rounded-2xl md:hover:bg-zinc-400/25 hover:bg-transparent md:dark:hover:bg-zinc-700/30 dark:hover:bg-transparent',
                    )}>
                    <Icon
                      name={tool.icon}
                      className={cn('size-6 md:size-7', tool.style)}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={8} className='md:flex hidden'>
                  <p className='dark:text-white capitalize text-base tracking-tight font-semibold font-figtree'>
                    {tool.name}
                  </p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}
          <Separator orientation='vertical' className='h-full' />
          {dockItems?.options.map((option) => (
            <DockIcon key={option.name}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size='sq'
                    variant='ghost'
                    onClick={option.fn}
                    aria-label={option.name}
                    className={cn(
                      'md:size-12 size-11 rounded-2xl md:hover:bg-zinc-400/25 hover:bg-transparent md:dark:hover:bg-zinc-700/30 dark:hover:bg-transparent',
                    )}>
                    <Icon
                      name={option.icon}
                      className={cn('size-6 md:size-7', option.style)}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={8} className='md:flex hidden'>
                  <p className='dark:text-white capitalize text-base tracking-tight font-semibold font-figtree'>
                    {option.name}
                  </p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}
        </Dock>
      </TooltipProvider>
    </div>
  )
}
