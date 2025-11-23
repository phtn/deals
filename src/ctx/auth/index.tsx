'use client'

import {clearUserProfile, getUserProfile, setUserProfile} from '@/app/actions'
import {auth} from '@/lib/firebase'
import {createUser, getUser} from '@/lib/firebase/users'
import {VoidPromise} from '@/types'
import {
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import {useRouter} from 'next/navigation'
import React, {
  createContext,
  useContext,
  useEffect,
  useEffectEvent,
  useState,
} from 'react'
import {useSigninCheck} from 'reactfire'
import type {AuthUser} from '../../lib/firebase/types'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signInWithGoogle?: VoidPromise
  onSignOut?: VoidPromise
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onSignOut = async () => {
    setLoading(true)
    try {
      await signOut(auth)
      await clearUserProfile() // Clear cached user profile data
      setUser(null)
      setLoading(false)
      router.push('/')
    } catch (error) {
      setLoading(false)
      console.error('Error signing out:', error)
    }
  }

  const signInWithGoogle = async () => {
    setLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      setLoading(false)
      router.push('/x')
    } catch (error) {
      console.error('Error signin?? in with Google:', error)
      setLoading(false)
    }
  }

  const {status, data: signInCheckResult} = useSigninCheck()

  useEffectEvent(() => {
    if (status === 'success' && signInCheckResult.user) {
      setLoading(false)
      const firebaseUser = signInCheckResult.user

      // Check for cached user profile first
      getUserProfile().then(async (cachedProfile) => {
        if (cachedProfile && cachedProfile.uid === firebaseUser.uid) {
          // Use cached profile data
          const authUser: AuthUser = {
            ...firebaseUser,
            uid: cachedProfile.uid,
            email: cachedProfile.email,
            displayName: cachedProfile.displayName,
            photoURL: cachedProfile.photoURL,
            providerIds:
              firebaseUser.providerData?.map((p) => p.providerId) || [],
            isActive: cachedProfile.isActive,
            role: cachedProfile.role as 'admin' | 'manager' | 'user' | 'dev',
          }
          setUser(authUser)
        } else {
          // Fetch fresh data from Firebase
          getUser(firebaseUser.uid).then(async (userProfile) => {
            // Create user profile if it doesn't exist
            if (!userProfile) {
              await createUser(firebaseUser)
            }

            const authUser: AuthUser = {
              ...firebaseUser,
              // Spread userProfile with null coalescing for required properties
              ...(userProfile
                ? {
                    uid: userProfile.uid,
                    email: userProfile.email,
                    displayName: userProfile.displayName,
                    photoURL: userProfile.photoURL,
                    providerIds: userProfile.providerIds || [],
                    createdAt: userProfile.createdAt,
                    lastLogin: userProfile.lastLogin,
                    isActive: userProfile.isActive,
                  }
                : {
                    // Default values when userProfile is null
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    providerIds:
                      firebaseUser.providerData?.map((p) => p.providerId) || [],
                    isActive: true,
                  }),
              role: userProfile?.role ?? 'user',
            }

            // Cache the user profile data for future use
            if (userProfile) {
              // Download and cache image data if photoURL exists

              await setUserProfile({
                uid: userProfile.uid,
                email: userProfile.email || null,
                displayName: userProfile.displayName || null,
                photoURL: userProfile.photoURL || null,
                role: userProfile.role || 'user',
                isActive: userProfile.isActive,
              })
            }

            setUser(authUser)
          })
        }
      })
    } else if (status === 'success' && !signInCheckResult.user) {
      setUser(null)
    }
  })

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(
      auth,
      async (firebaseUser: User | null) => {
        if (firebaseUser) {
          // When token changes, we update the custom claim 'role'.
          await firebaseUser.getIdToken(true)

          // Check for cached user profile first
          const cachedProfile = await getUserProfile()
          if (cachedProfile && cachedProfile.uid === firebaseUser.uid) {
            // Use cached profile data
            const authUser: AuthUser = {
              ...firebaseUser,
              uid: cachedProfile.uid,
              email: cachedProfile.email,
              displayName: cachedProfile.displayName,
              photoURL: cachedProfile.photoURL,
              providerIds:
                firebaseUser.providerData?.map((p) => p.providerId) || [],
              isActive: cachedProfile.isActive,
              role: cachedProfile.role as 'admin' | 'manager' | 'user' | 'dev',
            }
            setUser(authUser)
          } else {
            // Fetch fresh data from Firebase
            const userProfile = await getUser(firebaseUser.uid)

            // Create user profile if it doesn't exist
            if (!userProfile) {
              await createUser(firebaseUser)
            }

            const authUser: AuthUser = {
              ...firebaseUser,
              // Spread userProfile with null coalescing for required properties
              ...(userProfile
                ? {
                    uid: userProfile.uid,
                    email: userProfile.email,
                    displayName: userProfile.displayName,
                    photoURL: userProfile.photoURL,
                    providerIds: userProfile.providerIds || [],
                    createdAt: userProfile.createdAt,
                    lastLogin: userProfile.lastLogin,
                    isActive: userProfile.isActive,
                  }
                : {
                    // Default values when userProfile is null
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    providerIds:
                      firebaseUser.providerData?.map((p) => p.providerId) || [],
                    isActive: false,
                  }),
              role: userProfile?.role || 'user',
            }

            // Cache the user profile data for future use
            if (userProfile) {
              // Download and cache image data if photoURL exists

              await setUserProfile({
                uid: userProfile.uid,
                email: userProfile.email || null,
                displayName: userProfile.displayName || null,
                photoURL: userProfile.photoURL || null,
                role: userProfile.role || 'user',
                isActive: userProfile.isActive,
              })
            }

            setUser(authUser)
          }
        } else {
          setUser(null)
        }
      },
    )

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: loading || status === 'loading',
        signInWithGoogle,
        onSignOut,
      }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthCtx = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('AuthContext is missing')
  return ctx
}
