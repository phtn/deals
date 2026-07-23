'use client'

import {useWindow} from '@/hooks/use-window'
import {useEffect} from 'react'

export function ThemeHotkey() {
  const noop: VoidFunction = () => {}
  const {open} = useWindow({isOpen: false, onOpenChange: noop, hotkey: 'i'})

  useEffect(() => {
    open()
    return () => open()
  }, [open])

  return null
}
