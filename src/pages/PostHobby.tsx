import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusCircle, Hash, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export function PostHobby() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [mysteryMode, setMysteryMode] = useState(false)
  const [loading, setLoading] = useState(false)

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/^#/, '')
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !title.trim() || !description.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('hobbies')
        .insert({
          user_id: user.id,
          title: title.trim(),
          description: description.trim(),
          tags,
          mystery_mode: mysteryMode
        })

      if (error) throw error

      navigate('/dashboard')
    } catch (error) {
      console.error('Error creating hobby:', error)
      alert('Failed to create hobby. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Share Your Secret Hobby</h1>
        <p className="text-gray-600 text-sm sm:text-base">Let the community discover your hidden talents</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-purple-100 space-y-5 sm:space-y-6">
        <div>
          <label htmlFor="title" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Hobby Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
            placeholder="Miniature Zen Gardens, Urban Foraging, Stop-Motion Poetry..."
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm sm:text-base"
            rows={5}
            placeholder="Describe your hobby, what makes it special, what you could teach others, or what you'd love to learn from collaborators..."
            required
          />
        </div>

        <div>
          <label htmlFor="tags" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Tags (optional)
          </label>
          <div className="flex flex-col sm:flex-row gap-2 mb-2 sm:mb-3">
            <div className="flex-1 relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                placeholder="art, cooking, music, crafts..."
              />
            </div>
            <button
              type="button"
              onClick={addTag}
              className="px-3 sm:px-4 py-2 sm:py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors text-sm sm:text-base"
            >
              Add
            </button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs sm:text-sm flex items-center space-x-1"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-purple-50 rounded-xl p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <div className="w-full sm:w-auto">
              <div className="flex items-center space-x-2 mb-1">
                {mysteryMode ? <EyeOff className="w-5 h-5 text-purple-600" /> : <Eye className="w-5 h-5 text-purple-600" />}
                <span className="font-medium text-purple-800 text-sm sm:text-base">Mystery Mode</span>
              </div>
              <p className="text-xs sm:text-sm text-purple-600">
                {mysteryMode 
                  ? 'Your hobby details will be blurred until viewers choose to reveal them'
                  : 'Your hobby will be fully visible to everyone'
                }
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMysteryMode(!mysteryMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                mysteryMode ? 'bg-purple-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  mysteryMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !title.trim() || !description.trim()}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 sm:py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{loading ? 'Sharing...' : 'Share Your Hobby'}</span>
        </button>
      </form>
    </div>
  )
}