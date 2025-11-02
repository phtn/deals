import {onError, onSuccess, onWarn} from '@/ctx/toast'
import {ReactElement} from 'react'

export const opts = (...args: (ReactElement | null)[]) => {
  return new Map([
    [true, args[0]],
    [false, args[1]],
  ])
}

export type CopyFnParams = {
  name: string
  text: string
  limit?: number
}
type CopyFn = (params: CopyFnParams) => Promise<boolean> // Return success

export const charLimit = (
  text: string | undefined,
  chars?: number,
): string | undefined => {
  if (!text) return
  return text.substring(0, chars ?? 35)
}
export const copyFn: CopyFn = async ({name, text}) => {
  if (!navigator?.clipboard) {
    onWarn('Clipboard not supported')
    return false
  }
  if (!text) return false

  return await navigator.clipboard
    .writeText(text)
    .then(() => {
      onSuccess(`${name ? 'Copied: ' + name : 'Copied.'}`)
      return true
    })
    .catch((e) => {
      onError(`Copy failed. ${e}`)
      return false
    })
}
