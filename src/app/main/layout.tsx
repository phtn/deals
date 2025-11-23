import Sidebar from '@/components/dashboard/sidebar'
import {Toolbar} from '@/components/dashboard/toolbar'
import {ChevronRight} from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({children}: LayoutProps) {
  return (
    <div className='min-h-screen bg-[#0f1419] flex'>
      <Sidebar />

      <div className='flex-1 flex flex-col'>
        {/* Header */}
        <header className='bg-[#141824] border-b border-[#2a3142] px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-6'>
              {/* Logo */}
              <div className='flex items-center gap-2'>
                <div className='w-10 h-10 bg-linear-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center'>
                  <div className='w-6 h-6 border-2 border-white rounded transform rotate-45' />
                </div>
              </div>

              {/* Breadcrumb */}
              <div className='flex items-center gap-2 text-sm'>
                <Link
                  href='/'
                  className='text-gray-400 hover:text-white transition-colors'>
                  Home
                </Link>
                <ChevronRight className='w-4 h-4 text-gray-600' />
                <span className='text-white font-medium'>Dashboard</span>
              </div>
            </div>

            {/* Navigation */}
            <Toolbar />
          </div>
        </header>

        {/* Main Content */}
        <main className='flex-1 overflow-auto'>{children}</main>
      </div>
    </div>
  )
}
