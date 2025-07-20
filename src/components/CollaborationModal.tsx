import React, { useState } from 'react'
import { X, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Hobby } from '../lib/supabase'

interface CollaborationModalProps {
  hobby: Hobby
  onClose: () => void
}

export function CollaborationModal({ hobby, onClose }: CollaborationModalProps) {
  const { user } = useAuth()
  const [offer, setOffer] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !offer.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('collaboration_requests')
        .insert({
          hobby_id: hobby.id,
          requester_id: user.id,
          offer_description: offer.trim(),
          message: message.trim()
        })

      if (error) throw error

      onClose()
      alert('Collaboration request sent! 🎉')
    } catch (error) {
      console.error('Error sending collaboration request:', error)
      alert('Failed to send request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <h3 className="text-xl font-bold text-gray-800">Mystery Collaboration</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-purple-50 rounded-xl p-4 mb-4">
            <h4 className="font-semibold text-purple-800 mb-2">{hobby.title}</h4>
            <p className="text-purple-600 text-sm">by {hobby.users?.alias}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="offer" className="block text-sm font-medium text-gray-700 mb-2">
              What skill/hobby will you offer in return? *
            </label>
            <textarea
              id="offer"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="I could teach you origami, help with web design, share my sourdough starter recipe..."
              required
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Add a creative mystery note (optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={2}
              placeholder="Leave a mysterious message, creative challenge, or fun fact..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !offer.trim()}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}