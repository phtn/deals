import {useEffectEvent, useState} from 'react'

const MOBILE_BREAKPOINT = 768

export const useMobile = (breakpoint = MOBILE_BREAKPOINT) => {
  // Compute initial value synchronously (only if `window` exists)
  const getIsMobile = () =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : undefined

  const [isMobile, setIsMobile] = useState<boolean | undefined>(getIsMobile)

  useEffectEvent(() => {
    if (typeof window === 'undefined') return

    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)

    const onChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches)
    }

    mql.addEventListener('change', onChange)
    // Ensure state is in sync
    setIsMobile(mql.matches)

    return () => mql.removeEventListener('change', onChange)
  })

  return !!isMobile
}
