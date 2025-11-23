'use client'

import {Button} from '@/components/ui/button'
import {useAuthCtx} from '@/ctx/auth'
import {useCallback} from 'react'

export const Content = () => {
  const {onSignOut} = useAuthCtx()
  const handleSignOut = useCallback(async () => {
    await onSignOut()
  }, [onSignOut])
  return (
    <main className='p-6'>
      <Button onClick={handleSignOut}>Sign Out</Button>
    </main>
  )
}
