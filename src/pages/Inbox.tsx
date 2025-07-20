import React, { useEffect, useState } from 'react'
import { MessageCircle, User, Clock, Check, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { CollaborationRequest } from '../lib/supabase'

export function Inbox() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<CollaborationRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchRequests()
    }
  }, [user])

  const fetchRequests = async () => {
    if (!user) return

    try {
      // Fetch requests where user is the requester
      const { data: sentRequests, error: sentError } = await supabase
        .from('collaboration_requests')
        .select(`
          *,
          hobbies (title, description),
          users (alias)
        `)
        .eq('requester_id', user.id)
        .order('created_at', { ascending: false })

      if (sentError) throw sentError

      // Fetch requests for hobbies owned by the user
      const { data: receivedRequests, error: receivedError } = await supabase
        .from('collaboration_requests')
        .select(`
          *,
          hobbies!inner (title, description, user_id),
          users (alias)
        `)
        .eq('hobbies.user_id', user.id)
        .order('created_at', { ascending: false })

      if (receivedError) throw receivedError

      // Combine and deduplicate results
      const allRequests = [...(sentRequests || []), ...(receivedRequests || [])]
      const uniqueRequests = allRequests.filter((request, index, self) => 
        index === self.findIndex(r => r.id === request.id)
      )

      setRequests(uniqueRequests)
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateRequestStatus = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('collaboration_requests')
        .update({ status })
        .eq('id', requestId)

      if (error) throw error
      
      setRequests(requests.map(req => 
        req.id === requestId ? { ...req, status } : req
      ))
    } catch (error) {
      console.error('Error updating request:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  const sentRequests = requests.filter(req => req.requester_id === user?.id)
  const receivedRequests = requests.filter(req => req.requester_id !== user?.id)

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Secret Inbox</h1>
        <p className="text-gray-600">Your anonymous collaboration requests</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Received Requests */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-purple-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 text-purple-600" />
            <span>Received Requests ({receivedRequests.length})</span>
          </h2>

          {receivedRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No collaboration requests yet</p>
          ) : (
            <div className="space-y-4">
              {receivedRequests.map(request => (
                <div key={request.id} className="bg-white rounded-xl p-4 border border-purple-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {request.users?.alias?.[0]?.toUpperCase() || '?'}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-purple-700">
                        {request.users?.alias}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      request.status === 'declined' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Wants to collaborate on:</p>
                    <p className="font-medium text-gray-800">{request.hobbies?.title}</p>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Offers in return:</p>
                    <p className="text-gray-800">{request.offer_description}</p>
                  </div>

                  {request.message && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Mystery message:</p>
                      <p className="text-gray-700 italic">"{request.message}"</p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateRequestStatus(request.id, 'accepted')}
                        className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => updateRequestStatus(request.id, 'declined')}
                        className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center space-x-1"
                      >
                        <X className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sent Requests */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-purple-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <User className="w-6 h-6 text-pink-600" />
            <span>Sent Requests ({sentRequests.length})</span>
          </h2>

          {sentRequests.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sent requests yet</p>
          ) : (
            <div className="space-y-4">
              {sentRequests.map(request => (
                <div key={request.id} className="bg-white rounded-xl p-4 border border-pink-100">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-800">{request.hobbies?.title}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      request.status === 'declined' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {request.status}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">You offered:</p>
                    <p className="text-gray-800">{request.offer_description}</p>
                  </div>

                  {request.message && (
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-1">Your message:</p>
                      <p className="text-gray-700 italic">"{request.message}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}