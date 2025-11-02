import {type ClassName} from '@/app/types'
import {Card} from '@/components/ui/card'
import {cn} from '@/lib/utils'
import {type HTMLAttributes, ReactNode} from 'react'

interface HyperCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className: ClassName
  light?: boolean
}

export const HyperCard = ({
  children,
  className,
  light = false,
}: HyperCardProps) => {
  return (
    <Card
      className={cn(
        'shadow-xs relative overflow-hidden group p-0',
        'dark:bg-origin/40 dark:border-zinc-800',
        'dark:inset-shadow-[0_1px_rgb(255_255_255/0.20)]',
        {
          'dark:bg-transparent dark:border-transparent': light,
        },
        className,
      )}>
      {children}
    </Card>
  )
}
