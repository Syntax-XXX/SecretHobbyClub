import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (alias: string) => Promise<void>
  signIn: (alias: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is stored in localStorage (simple auth for MVP)
    const storedUser = localStorage.getItem('secret-hobby-user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const signUp = async (alias: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: `${alias.toLowerCase()}@temp.com`, // Temporary email for Supabase auth
      password: 'password123' // Simple password for MVP
    })

    if (error) throw error

    if (data.user) {
      // Create user record with alias
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({ id: data.user.id, alias: alias.toLowerCase() })
        .select()

      if (userError) throw userError
      
      if (!userData || userData.length === 0) {
        throw new Error('Alias not found')
      }

      const userRecord = Array.isArray(userData) ? userData[0] : userData

      setUser(userRecord)
      localStorage.setItem('secret-hobby-user', JSON.stringify(userData))
    }
  }

  const signIn = async (alias: string) => {
    // Find user by alias
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('alias', alias.toLowerCase())
      .single()

    if (error || !userData) {
      throw new Error('Alias not found')
    }

    // Sign in with temporary email
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: `${alias.toLowerCase()}@temp.com`,
      password: 'password123'
    })

    if (signInError) throw signInError

    setUser(userData)
    localStorage.setItem('secret-hobby-user', JSON.stringify(userData))
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem('secret-hobby-user')
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}