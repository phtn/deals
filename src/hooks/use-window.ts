import {useTheme} from 'next-themes'
import {MouseEvent, useCallback, useMemo} from 'react'
import {useToggle} from './use-toggle'

export type Keys = 'k' | 'i' | '.' | '/'

export const useWindow = (_open = false, setOpen: VoidFunction) => {
  const {on, toggle} = useToggle(_open)
  const {setTheme, resolvedTheme, theme} = useTheme()
  const onKeyDown = useCallback(
    <T, R extends void>(k?: Keys, action?: (p?: T) => R) =>
      k === 'i'
        ? keyListener((e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
              e.preventDefault()
              const current = (resolvedTheme ?? theme) as
                | 'light'
                | 'dark'
                | 'system'
              const next = current === 'dark' ? 'light' : 'dark'
              setTheme(next)
            }
          })
        : keyListener(keyDown(k, setOpen ?? toggle, action)),
    [resolvedTheme, setTheme, toggle, theme, setOpen],
  )

  const stopPropagation = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  const open = useMemo(() => _open || on, [_open, on])

  return {onKeyDown, stopPropagation, keyListener, open}
}

const keyDown =
  <T, R extends void>(
    k: Keys | undefined,
    toggle: VoidFunction,
    action?: (p?: T) => R,
  ) =>
  (e: KeyboardEvent) => {
    if (k && e.key === k && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      toggle()
      if (typeof action !== 'undefined') {
        action()
      }
    }
  }

const keyListener = (keydownFn: (e: KeyboardEvent) => void) => {
  return {
    add: () => document.addEventListener('keydown', keydownFn),
    remove: () => document.removeEventListener('keydown', keydownFn),
  }
}
