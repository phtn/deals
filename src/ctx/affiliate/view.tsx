'use client'

import {createContext, useContext, useState, ReactNode} from 'react'

export type ViewType = 'stats' | 'table' | 'calendar' | 'add-new'

interface ViewContextType {
  view: ViewType
  setView: (view: ViewType) => void
}

const ViewContext = createContext<ViewContextType | undefined>(undefined)

export function AffiliateViewProvider({children}: {children: ReactNode}) {
  const [view, setView] = useState<ViewType>('stats')

  return (
    <ViewContext.Provider value={{view, setView}}>
      {children}
    </ViewContext.Provider>
  )
}

export function useAffiliateView() {
  const context = useContext(ViewContext)
  if (context === undefined) {
    throw new Error('useAffiliateView must be used within AffiliateViewProvider')
  }
  return context
}





