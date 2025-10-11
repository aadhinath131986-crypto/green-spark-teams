import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    console.log('[AUTH] Attempting sign in for email:', email)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(), // Normalize email
      password,
    })
    
    if (error) {
      console.error('[AUTH] Sign in error:', {
        code: error.code,
        message: error.message,
        status: error.status,
        name: error.name
      })
    } else {
      console.log('[AUTH] Sign in successful for user:', data.user?.email)
    }
    
    return { error }
  }

  const signUp = async (email: string, password: string, username: string) => {
    console.log('[AUTH] Attempting sign up for email:', email, 'username:', username)
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(), // Normalize email
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          username: username
        }
      }
    })

    if (error) {
      console.error('[AUTH] Sign up error:', {
        code: error.code,
        message: error.message,
        status: error.status,
        name: error.name
      })
    } else {
      console.log('[AUTH] Sign up successful. User:', data.user?.email, 'Email confirmed:', !!data.user?.email_confirmed_at)
      if (data.user && !data.user.email_confirmed_at) {
        console.warn('[AUTH] Email confirmation required - check inbox')
      }
    }

    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}