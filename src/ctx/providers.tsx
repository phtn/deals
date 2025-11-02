'use client'

import {ThemeHotkey} from '@/components/theme-hotkey'
import {FirebaseProvider} from '@/lib/firebase/provider'
import {ThemeProvider} from 'next-themes'
import {createContext, useContext, type ReactNode} from 'react'
import {AuthProvider} from './auth'
import {Toasts} from './toast'

interface ProvidersProviderProps {
  children: ReactNode
}

interface ProvidersCtxValues {
  on: boolean
}

const ProvidersCtx = createContext<ProvidersCtxValues | null>(null)

const ProvidersCtxProvider = ({children}: ProvidersProviderProps) => {
  return (
    <ProvidersCtx value={null}>
      <FirebaseProvider>
        <AuthProvider>
          <ThemeProvider
            enableSystem
            attribute='class'
            enableColorScheme
            defaultTheme='system'
            disableTransitionOnChange>
            <div
              className={`bg-background h-screen w-screen overflow-hidden  selection:bg-sky-300/80 dark:selection:text-zinc-800 selection:text-foreground font-sans`}>
              {children}

              <ThemeHotkey />
            </div>

            <Toasts />
          </ThemeProvider>
        </AuthProvider>
      </FirebaseProvider>
    </ProvidersCtx>
  )
}

const useProvidersCtx = () => {
  const ctx = useContext(ProvidersCtx)
  if (!ctx) throw new Error('ProvidersCtxProvider is missing')
  return ctx
}

export {ProvidersCtx, ProvidersCtxProvider, useProvidersCtx}
