import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Sparkles, User, LogOut, Home, Plus, Inbox } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-purple-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Secret Hobby Club
              </h1>
            </Link>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-1 bg-purple-100 px-3 py-1 rounded-full">
                <User className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">{user.alias}</span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <nav className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 sticky top-24">
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive('/dashboard')
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span>Browse Hobbies</span>
                </Link>
                <Link
                  to="/post-hobby"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive('/post-hobby')
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  <span>Share a Hobby</span>
                </Link>
                <Link
                  to="/inbox"
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    isActive('/inbox')
                      ? 'bg-purple-100 text-purple-700 font-medium'
                      : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                  }`}
                >
                  <Inbox className="w-5 h-5" />
                  <span>Secret Inbox</span>
                </Link>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}