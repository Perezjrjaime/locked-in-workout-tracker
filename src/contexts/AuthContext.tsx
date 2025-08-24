import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to create user profile safely
  const createUserProfile = async (user: User) => {
    try {
      if (!supabase) {
        console.error('Supabase not available')
        return
      }

      console.log('=== CREATING USER PROFILE ===')
      console.log('User ID:', user.id)
      console.log('User email:', user.email)
      console.log('User metadata:', user.user_metadata)
      
      // First check if profile already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (existingProfile) {
        console.log('✅ User profile already exists:', existingProfile)
        return
      }

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Error checking profile:', checkError)
        return
      }

      console.log('📝 Profile does not exist, creating new one...')

      // Prepare profile data
      const profileData = {
        user_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 
                  user.user_metadata?.name || 
                  user.email?.split('@')[0] || 'User',
        is_admin: false,
        is_approved: false
      }

      console.log('Profile data to insert:', profileData)

      // Create the profile
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single()

      if (insertError) {
        console.error('❌ Error creating user profile:', insertError)
        console.error('Error details:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        })
      } else {
        console.log('✅ User profile created successfully:', newProfile)
      }
    } catch (error) {
      console.error('❌ Unexpected error creating profile:', error)
    }
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        if (!supabase) {
          setLoading(false)
          return
        }

        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setError(error.message)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (err) {
        console.error('Error in getInitialSession:', err)
        setError('Failed to get session')
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth event:', event, session?.user?.email || 'no user')
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
          setError(null)

          if (event === 'SIGNED_IN' && session) {
            console.log('User signed in successfully:', session.user.email)
            
            // Create user profile after successful sign-in
            setTimeout(async () => {
              await createUserProfile(session.user)
            }, 1000) // Small delay to ensure session is fully established
            
          } else if (event === 'SIGNED_OUT') {
            console.log('User signed out')
          } else if (event === 'TOKEN_REFRESHED') {
            console.log('Token refreshed')
          }
        }
      )

      return () => subscription.unsubscribe()
    }
  }, [])

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!supabase) {
        throw new Error('Supabase is not configured')
      }

      // Use the current URL as redirect (this should work for localhost and deployed versions)
      const redirectUrl = `${window.location.protocol}//${window.location.host}`
      console.log('Redirect URL:', redirectUrl)

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          }
        }
      })

      if (error) {
        throw error
      }

      console.log('OAuth initiated successfully:', data)
    } catch (err) {
      console.error('Error signing in with Google:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google')
      setLoading(false) // Only set loading false on error, success will be handled by auth state change
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!supabase) {
        throw new Error('Supabase is not configured')
      }

      const { error } = await supabase.auth.signOut()
      
      if (error) {
        throw error
      }
    } catch (err) {
      console.error('Error signing out:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
    error
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
