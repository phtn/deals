'use client'

import {createContext, ReactNode, useContext, useState} from 'react'

export type ViewType =
  | 'stats'
  | 'table'
  | 'settings'
  | 'scan-doc'
  | 'scan-id'
  | 'add-new'

interface ViewContextType {
  view: ViewType
  setView: (view: ViewType) => void
}

const ViewContext = createContext<ViewContextType | undefined>(undefined)

export function OCRViewProvider({children}: {children: ReactNode}) {
  const [view, setView] = useState<ViewType>('stats')

  return (
    <ViewContext.Provider value={{view, setView}}>
      {children}
    </ViewContext.Provider>
  )
}

export function useOCRView() {
  const context = useContext(ViewContext)
  if (context === undefined) {
    throw new Error('useOCRView must be used within OCRViewProvider')
  }
  return context
}
