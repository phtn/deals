'use client'

import {AppSidebar} from '@/components/app-sidebar'
import {SettingsPanel, SettingsPanelProvider} from '@/components/settings-panel'
import {SidebarInset, SidebarProvider} from '@/components/ui/sidebar'
import {AffiliateCtxProvider} from '@/ctx/affiliate'
import {AffiliateViewProvider} from '@/ctx/affiliate/view'
import {MetricsProvider} from '@/ctx/ocr/metrics'
import {OCRViewProvider} from '@/ctx/ocr/view'
import {usePathname} from 'next/navigation'
import {ReactNode} from 'react'
import {WrappedContent} from './wrapper'

export interface DashboardLayoutProps {
  children: ReactNode
  toolbar?: ReactNode
}

export default function Layout({children, toolbar}: DashboardLayoutProps) {
  const pathname = usePathname()
  const isAffiliatesRoute = pathname?.includes('/x/affiliates')
  const isOCRRoute = pathname?.includes('/x/ocr')

  const baseContent = (
    <SidebarProvider>
      <AppSidebar />
      <SettingsPanelProvider>
        <SidebarInset className='group/sidebar-inset'>
          <WrappedContent toolbar={toolbar}>{children}</WrappedContent>
          <SettingsPanel />
        </SidebarInset>
      </SettingsPanelProvider>
    </SidebarProvider>
  )

  if (isAffiliatesRoute) {
    return (
      <AffiliateCtxProvider>
        <AffiliateViewProvider>{baseContent}</AffiliateViewProvider>
      </AffiliateCtxProvider>
    )
  }

  if (isOCRRoute) {
    return (
      <OCRViewProvider>
        <MetricsProvider>{baseContent}</MetricsProvider>
      </OCRViewProvider>
    )
  }

  return baseContent
}
