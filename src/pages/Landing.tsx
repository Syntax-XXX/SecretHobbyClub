import React, { useState } from 'react'
import { Sparkles, Users, MessageCircle, Shield, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function Landing() {
  const { signUp, signIn } = useAuth()
  const [alias, setAlias] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!alias.trim()) return

    setLoading(true)
    try {
      if (isSignUp) {
        await signUp(alias.trim())
      } else {
        await signIn(alias.trim())
      }
    } catch (error) {
      console.error('Auth error:', error)
      if (isSignUp) {
        alert('Alias already taken. Switching to sign-in. Please try signing in.');
        setIsSignUp(false);
      } else {
        alert('Alias not found')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-16">
        <div className="text-center mb-10 sm:mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4 sm:mb-6">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Secret Hobby Club
            </h1>
          </div>
          <p className="text-base sm:text-xl text-gray-600 max-w-xl sm:max-w-2xl mx-auto leading-relaxed">
            An anonymous skill-sharing platform where creativity meets mystery. 
            Share your hidden talents, discover amazing hobbies, and collaborate without revealing who you are.
          </p>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-8 sm:gap-12 items-center max-w-2xl sm:max-w-6xl mx-auto">
          {/* Features */}
          <div className="space-y-6 sm:space-y-8 w-full">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Completely Anonymous</h3>
                <p className="text-gray-600">No emails, no real names. Just pick an alias and start sharing your hidden talents.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Mystery Collaborations</h3>
                <p className="text-gray-600">Request skill swaps and creative collaborations with fellow hobbyists around the world.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Secret Inbox</h3>
                <p className="text-gray-600">Communicate safely through our anonymous messaging system. No personal info shared.</p>
              </div>
            </div>
          </div>

          {/* Auth Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-purple-100 w-full max-w-md mx-auto">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
                {isSignUp ? 'Join the Secret Club' : 'Welcome Back'}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {isSignUp ? 'Choose your anonymous alias' : 'Enter your alias to continue'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="alias" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Your Secret Alias
                </label>
                <input
                  type="text"
                  id="alias"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="MysteriousBaker, CreativeWizard, SilentArtist..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !alias.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 sm:py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span>{loading ? 'Loading...' : (isSignUp ? 'Join the Club' : 'Enter Club')}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            <div className="text-center mt-4 sm:mt-6">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-purple-600 hover:text-purple-800 text-xs sm:text-sm font-medium"
              >
                {isSignUp ? 'Already have an alias? Sign in' : 'Need an alias? Sign up'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}