'use client'

import type {NavGroup, NavItem} from '@/components/types'
import {Button} from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {useAppTheme} from '@/hooks/use-theme'
import {Icon, IconName} from '@/lib/icons'
import {cn} from '@/lib/utils'
import Link from 'next/link'
import {usePathname} from 'next/navigation'

export function AppSidebar({...props}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const route = pathname.split('/').pop()
  return (
    <Sidebar {...props} className='border-none!' suppressHydrationWarning>
      <SidebarHeader className=''>
        <div className='h-14.5 flex items-end justify-between px-4'>
          <h3 className='md:scale-125 text-transparent bg-clip-text bg-linear-to-r from-neutral-800 dark:from-foreground dark:via-dysto via-zinc-400 to-foreground text-base h-10 font-major font-semibold tracking-tight leading-none'>
            <span className='font-bone text-base italic'>BEST</span>
            <span className='-translate-y-[0.5px] text-sm'>deal</span>
          </h3>
        </div>
        <div
          className={cn(
            'relative transition-all duration-300 ease-in-out',
            'after:absolute after:inset-x-0 after:top-0 after:h-[0.5px] after:bg-linear-to-r after:from-foreground/10 after:via-foreground/15 before:to-foreground/10',
          )}
        />
      </SidebarHeader>
      <SidebarContent>
        {/* We only show the first parent group */}
        <SidebarGroup>
          <SidebarGroupLabel className='pl-4 text-xs font-figtree tracking-widest uppercase text-sidebar-foreground/50'>
            {data.navMain[0]?.title}
          </SidebarGroupLabel>
          <SidebarGroupContent className='py-2'>
            <SidebarMenu>
              {data.navMain[0] &&
                data.navMain[0]?.items?.map((item) => (
                  <SidebarMenuItem
                    className='text-xs tracking-tighter'
                    key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        'group/menu-button h-8 data-[active=true]:hover:bg-background data-[active=true]:bg-linear-to-b data-[active=true]:from-sidebar-primary data-[active=true]:to-sidebar-primary/70 data-[active=true]:shadow-[0_1px_2px_0_rgb(0_0_0/.05),inset_0_1px_0_0_rgb(255_255_255/.12)] [&>svg]:size-auto',
                        {'bg-neutral-300': route === item.title.toLowerCase()},
                      )}
                      isActive={item.isActive}>
                      <MenuContent route={route} {...item} />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className='pl-4 text-xs font-figtree tracking-widest uppercase text-sidebar-foreground/50'>
            {data.navMain[1]?.title}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain[1]?.items?.map((item) => (
                <SidebarMenuItem
                  className='text-xs tracking-tight font-extrabold'
                  key={item.title}>
                  <SidebarMenuButton
                    asChild
                    size='lg'
                    className='group/menu-button font-medium h-8 [&>svg]:size-auto'
                    isActive={item.isActive}>
                    <MenuContent route={route} {...item} />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <ToggleTheme />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
}

const MenuContent = (item: NavItem & {route: string | undefined}) => {
  return (
    <Link
      href={item.url}
      suppressHydrationWarning
      className={cn(
        'font-figtree group/menu-content hover:bg-foreground/10 rounded-lg flex items-center px-4 h-10 bg-transparent',
        {
          'bg-neutral-400/20':
            item.title.toLowerCase() === 'overview' && item.route === 'x',
          'bg-neutral-300 dark:bg-neutral-400/20':
            item.route === item.title.toLowerCase(),
        },
      )}>
      <Icon name={item.icon as IconName} className='mr-3 size-4' />
      <span className='group-hover/menu-content:text-foreground tracking-tighter text-sm font-medium text-foreground/80'>
        {item.title}
      </span>
    </Link>
  )
}

const data: Record<string, NavGroup[]> = {
  teams: [
    {
      name: 'BestDeal',
      logo: 'https://raw.githubusercontent.com/origin-space/origin-images/refs/heads/main/exp2/logo-01_upxvqe.png',
      url: '/x',
    },
  ],
  navMain: [
    {
      title: 'Workspace',
      url: '#',
      items: [
        {
          title: 'Overview',
          url: '/x',
          icon: 'bar-chart',
          isActive: true,
        },
        {
          title: 'Database',
          url: '/x/database',
          icon: 'data-bank',
          isActive: true,
        },
        {
          title: 'OCR',
          url: '/x/ocr',
          icon: 'scan-h',
        },
        {
          title: 'Leads',
          url: '/x/settings',
          icon: 'lightning',
          isActive: true,
        },
      ],
    },
    {
      title: 'Settings',
      url: '/x/settings',
      items: [
        {
          title: 'Account',
          url: '/x/settings',
          icon: 'nut',
        },
      ],
    },
  ],
}

const ToggleTheme = () => {
  const [isDark, toggleTheme] = useAppTheme()
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        className='group/menu-button h-10 rounded-md [&>svg]:size-auto'>
        <Button
          variant='ghost'
          size='sm'
          onClick={toggleTheme}
          className='capitalize w-fit px-4 space-x-2'>
          <span className='space-x-1'>
            <span className='opacity-80 tracking-tighter font-extrabold dark:opacity-70'>
              Toggle
            </span>
            <span
              suppressHydrationWarning
              className={cn(
                'font-light',
                `${isDark ? 'text-orange-300' : 'text-slate-700 '}`,
              )}>
              {isDark ? 'Light' : 'Dark'}
            </span>
          </span>
        </Button>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
