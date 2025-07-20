import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type User = {
  id: string
  alias: string
  created_at: string
}

export type Hobby = {
  id: string
  user_id: string
  title: string
  description: string
  tags: string[]
  mystery_mode: boolean
  created_at: string
  users?: User
}

export type CollaborationRequest = {
  id: string
  hobby_id: string
  requester_id: string
  offer_description: string
  message: string
  status: string
  created_at: string
  hobbies?: Hobby
  users?: User
}

export type Message = {
  id: string
  thread_id: string
  sender_id: string
  recipient_id: string
  content: string
  created_at: string
  sender?: User
  recipient?: User
}