import React, { useState } from 'react'
import { Eye, EyeOff, Heart, MessageCircle } from 'lucide-react'
import type { Hobby } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { CollaborationModal } from './CollaborationModal'

interface HobbyCardProps {
  hobby: Hobby
}

export function HobbyCard({ hobby }: HobbyCardProps) {
  const { user } = useAuth()
  const [showCollabModal, setShowCollabModal] = useState(false)
  const [revealMystery, setRevealMystery] = useState(false)

  const isOwnHobby = user?.id === hobby.user_id
  const shouldBlur = hobby.mystery_mode && !revealMystery && !isOwnHobby

  const getPreview = (text: string) => {
    const sentences = text.split('.')
    return sentences[0] + (sentences.length > 1 ? '...' : '')
  }

  return (
    <>
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {hobby.users?.alias?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <span className="text-sm font-medium text-purple-700">
              {hobby.users?.alias || 'Anonymous'}
            </span>
          </div>
          
          {hobby.mystery_mode && !isOwnHobby && (
            <button
              onClick={() => setRevealMystery(!revealMystery)}
              className="flex items-center space-x-1 text-purple-600 hover:text-purple-800 transition-colors"
            >
              {revealMystery ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm">{revealMystery ? 'Hide' : 'Reveal'}</span>
            </button>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-3">
          {shouldBlur ? 'Mystery Hobby' : hobby.title}
        </h3>

        <p className={`text-gray-600 mb-4 leading-relaxed ${shouldBlur ? 'filter blur-sm' : ''}`}>
          {shouldBlur ? getPreview(hobby.description) : hobby.description}
        </p>

        {hobby.tags && hobby.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {hobby.tags.map((tag, index) => (
              <span
                key={index}
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  shouldBlur 
                    ? 'bg-gray-200 text-gray-400 filter blur-sm' 
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-purple-100">
          <div className="flex items-center space-x-4 text-gray-500">
            <span className="flex items-center space-x-1">
              <Heart className="w-4 h-4" />
              <span className="text-sm">0</span>
            </span>
            <span className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm">0</span>
            </span>
          </div>

          {!isOwnHobby && (
            <button
              onClick={() => setShowCollabModal(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105"
            >
              Request Mystery Collab
            </button>
          )}
        </div>
      </div>

      {showCollabModal && (
        <CollaborationModal
          hobby={hobby}
          onClose={() => setShowCollabModal(false)}
        />
      )}
    </>
  )
}