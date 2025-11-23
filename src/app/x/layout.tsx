'use client'

import {AppSidebar} from '@/components/app-sidebar'
import {SettingsPanel, SettingsPanelProvider} from '@/components/settings-panel'
import {SidebarInset, SidebarProvider} from '@/components/ui/sidebar'
import {AffiliateCtxProvider} from '@/ctx/affiliate'
import {AffiliateViewProvider} from '@/ctx/affiliate/view'
import {ConvexProvider} from '@/lib/convex/provider'
import {usePathname} from 'next/navigation'
import {ReactNode} from 'react'
import {WrappedContent} from './wrapper'

export interface DashboardLayoutProps {
  children: ReactNode
  toolbar?: ReactNode
}

export default function Layout({children, toolbar}: DashboardLayoutProps) {
  const pathname = usePathname()
  const isAffiliatesRoute = pathname?.includes('/affiliates')

  const content = (
    <ConvexProvider>
      <AffiliateCtxProvider>
        <SidebarProvider>
          <AppSidebar />
          <SettingsPanelProvider>
            <SidebarInset className='group/sidebar-inset'>
              <Container>
                <WrappedContent toolbar={toolbar}>{children}</WrappedContent>
                <SettingsPanel />
              </Container>
            </SidebarInset>
          </SettingsPanelProvider>
        </SidebarProvider>
      </AffiliateCtxProvider>
    </ConvexProvider>
  )

  if (isAffiliatesRoute) {
    return <AffiliateViewProvider>{content}</AffiliateViewProvider>
  }

  return content
}

const Container = ({children}: {children: ReactNode}) => (
  <div className='relative bg-sidebar w-full min-w-0 md:p-5 flex h-screen'>
    {/*<div className='absolute top-1 hidden _flex items-center px-1 rounded-sm left-4 bg-amber-100/10 h-3 space-x-4 text-xs'></div>*/}
    {children}
  </div>
)
