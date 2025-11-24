'use client'

import {AppSidebar} from '@/components/app-sidebar'
import {SettingsPanel, SettingsPanelProvider} from '@/components/settings-panel'
import {SidebarInset, SidebarProvider} from '@/components/ui/sidebar'
import {AffiliateCtxProvider} from '@/ctx/affiliate'
import {AffiliateViewProvider} from '@/ctx/affiliate/view'
import {MetricsProvider} from '@/ctx/ocr/metrics'
import {OCRViewProvider} from '@/ctx/ocr/view'
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
  const isOCRRoute = pathname?.includes('/ocr')

  const content = (
    <ConvexProvider>
      <AffiliateCtxProvider>
        <SidebarProvider>
          <AppSidebar />
          <SettingsPanelProvider>
            <SidebarInset className='group/sidebar-inset'>
              <WrappedContent toolbar={toolbar}>{children}</WrappedContent>
              <SettingsPanel />
            </SidebarInset>
          </SettingsPanelProvider>
        </SidebarProvider>
      </AffiliateCtxProvider>
    </ConvexProvider>
  )

  if (isAffiliatesRoute) {
    return <AffiliateViewProvider>{content}</AffiliateViewProvider>
  }

  if (isOCRRoute) {
    return (
      <OCRViewProvider>
        <MetricsProvider>{content}</MetricsProvider>
      </OCRViewProvider>
    )
  }

  return content
}
