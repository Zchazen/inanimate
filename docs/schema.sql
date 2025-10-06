-- Object Dating App - Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles Table
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  personality_traits JSONB DEFAULT '[]',
  personality_summary TEXT,
  onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Objects Table
CREATE TABLE user_objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  analysis JSONB,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Matches Table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id),
  matched_user_id UUID REFERENCES user_profiles(id),
  created_at DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending', -- pending, accepted, passed
  UNIQUE(user_id, matched_user_id, created_at)
);

-- Chats Table
CREATE TABLE chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user1_id UUID REFERENCES user_profiles(id),
  user2_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- Messages Table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES user_profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view matched profiles"
  ON user_profiles FOR SELECT
  USING (
    id IN (
      SELECT matched_user_id FROM matches WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for user_objects
CREATE POLICY "Users can view own objects"
  ON user_objects FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view matched user objects"
  ON user_objects FOR SELECT
  USING (
    user_id IN (
      SELECT matched_user_id FROM matches WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for matches
CREATE POLICY "Users can view own matches"
  ON matches FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = matched_user_id);

CREATE POLICY "Users can insert own matches"
  ON matches FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own matches"
  ON matches FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for chats
CREATE POLICY "Users can view own chats"
  ON chats FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create chats"
  ON chats FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS Policies for messages
CREATE POLICY "Users can view chat messages"
  ON messages FOR SELECT
  USING (
    chat_id IN (
      SELECT id FROM chats WHERE auth.uid() = user1_id OR auth.uid() = user2_id
    )
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Indexes for performance
CREATE INDEX idx_user_objects_user_id ON user_objects(user_id);
CREATE INDEX idx_matches_user_id ON matches(user_id);
CREATE INDEX idx_matches_created_at ON matches(created_at);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Storage Policies
-- Run this in the Storage section, not SQL editor

-- For user-images bucket:
-- 1. Create bucket "user-images" with public access
-- 2. Add these policies:

-- Policy: Users can upload own images
-- INSERT policy:
-- (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1])

-- Policy: Anyone can view images
-- SELECT policy:
-- (bucket_id = 'user-images')
