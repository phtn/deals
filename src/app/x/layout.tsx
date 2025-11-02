import {AppSidebar} from '@/components/app-sidebar'
import {SettingsPanel, SettingsPanelProvider} from '@/components/settings-panel'
import {SidebarInset, SidebarProvider} from '@/components/ui/sidebar'
import React, {ReactNode} from 'react'

export default function Layout({children}: {children: React.ReactNode}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SettingsPanelProvider>
        <SidebarInset className='group/sidebar-inset'>
          {/*<Navbar />*/}
          <Container>
            {children}
            <SettingsPanel />
          </Container>
        </SidebarInset>
      </SettingsPanelProvider>
    </SidebarProvider>
  )
}

const Container = ({children}: {children: ReactNode}) => (
  <div className='relative bg-sidebar w-full p-5 flex h-screen'>
    <div className='absolute top-1 hidden _flex items-center px-1 rounded-sm left-4 bg-amber-100/10 h-3 space-x-4 text-xs'>
      -
    </div>
    {children}
  </div>
)
