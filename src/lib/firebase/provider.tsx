'use client'

import {type PropsWithChildren} from 'react'
import {
  AuthProvider,
  FirebaseAppProvider,
  FirestoreProvider,
  useSigninCheck as useReactFireSigninCheck,
} from 'reactfire'
import {app, auth, db} from './'

export function FirebaseProvider({children}: PropsWithChildren) {
  return (
    <FirebaseAppProvider firebaseApp={app}>
      <AuthProvider sdk={auth}>
        <FirestoreProvider sdk={db}>{children}</FirestoreProvider>
      </AuthProvider>
    </FirebaseAppProvider>
  )
}

export function useSigninCheck() {
  return useReactFireSigninCheck()
}

export function AuthGuard({children}: PropsWithChildren) {
  const {status, data: signInCheckResult} = useSigninCheck()

  if (status === 'loading') {
    return (
      <div className='container py-8'>
        <div className='space-y-4'>
          <div className='h-12 w-1/4' />
          <div className='h-8 w-full' />
          <div className='h-8 w-full' />
          <div className='h-8 w-3/4' />
        </div>
      </div>
    )
  }

  if (signInCheckResult.signedIn === true) {
    return children
  }

  return null
}
