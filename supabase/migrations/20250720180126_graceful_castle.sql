/*
  # Secret Hobby Club Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `alias` (text, unique, not null)
      - `created_at` (timestamp)
    - `hobbies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text, not null)
      - `description` (text, not null)
      - `tags` (text array)
      - `mystery_mode` (boolean, default false)
      - `created_at` (timestamp)
    - `collaboration_requests`
      - `id` (uuid, primary key)
      - `hobby_id` (uuid, foreign key to hobbies)
      - `requester_id` (uuid, foreign key to users)
      - `offer_description` (text, not null)
      - `message` (text)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
    - `messages`
      - `id` (uuid, primary key)
      - `thread_id` (uuid, not null)
      - `sender_id` (uuid, foreign key to users)
      - `recipient_id` (uuid, foreign key to users)
      - `content` (text, not null)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for reading public hobby data
    - Add policies for collaboration requests and messages

  3. Indexes
    - Add indexes for performance on frequently queried columns
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alias text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create hobbies table
CREATE TABLE IF NOT EXISTS hobbies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  tags text[] DEFAULT '{}',
  mystery_mode boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create collaboration_requests table
CREATE TABLE IF NOT EXISTS collaboration_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hobby_id uuid REFERENCES hobbies(id) ON DELETE CASCADE,
  requester_id uuid REFERENCES users(id) ON DELETE CASCADE,
  offer_description text NOT NULL,
  message text DEFAULT '',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL,
  sender_id uuid REFERENCES users(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hobbies ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can insert their own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read all aliases"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Hobbies policies
CREATE POLICY "Anyone can read hobbies"
  ON hobbies
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own hobbies"
  ON hobbies
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Collaboration requests policies
CREATE POLICY "Users can create collaboration requests"
  ON collaboration_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Users can read requests for their hobbies"
  ON collaboration_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hobbies 
      WHERE hobbies.id = collaboration_requests.hobby_id 
      AND hobbies.user_id = auth.uid()
    ) OR requester_id = auth.uid()
  );

-- Messages policies
CREATE POLICY "Users can read their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_hobbies_created_at ON hobbies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hobbies_tags ON hobbies USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_collaboration_requests_hobby_id ON collaboration_requests(hobby_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);