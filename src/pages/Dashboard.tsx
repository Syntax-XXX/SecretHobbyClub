import React, { useEffect, useState } from 'react'
import { Search, Filter, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { HobbyCard } from '../components/HobbyCard'
import type { Hobby } from '../lib/supabase'

export function Dashboard() {
  const [hobbies, setHobbies] = useState<Hobby[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  useEffect(() => {
    fetchHobbies()
  }, [])

  const fetchHobbies = async () => {
    try {
      const { data, error } = await supabase
        .from('hobbies')
        .select(`
          *,
          users (alias)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setHobbies(data || [])
    } catch (error) {
      console.error('Error fetching hobbies:', error)
    } finally {
      setLoading(false)
    }
  }

  const allTags = Array.from(
    new Set(hobbies.flatMap(hobby => hobby.tags || []))
  ).sort()

  const filteredHobbies = hobbies.filter(hobby => {
    const matchesSearch = !searchTerm || 
      hobby.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hobby.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTag = !selectedTag || (hobby.tags && hobby.tags.includes(selectedTag))
    
    return matchesSearch && matchesTag
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-2 sm:px-4 py-4 sm:py-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Discover Hidden Talents</h1>
        <p className="text-gray-600 text-sm sm:text-base">Explore anonymous hobbies and find your next collaboration</p>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-3 sm:p-6 border border-purple-100">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search hobbies, skills, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="pl-10 pr-8 py-2 sm:py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-sm sm:text-base"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredHobbies.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-500 mb-2">No hobbies found</h3>
          <p className="text-gray-400 text-sm sm:text-base">
            {searchTerm || selectedTag 
              ? 'Try adjusting your search or filters' 
              : 'Be the first to share a hobby!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
          {filteredHobbies.map(hobby => (
            <HobbyCard key={hobby.id} hobby={hobby} />
          ))}
        </div>
      )}
    </div>
  )
}