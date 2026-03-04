-- Supabase Database Schema for Your LLM
-- Run this SQL in your Supabase SQL editor to set up the database

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
-- Stores user profile information

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- ============================================================================
-- DISCOVERY SESSIONS TABLE
-- ============================================================================
-- Stores user discovery session data

CREATE TABLE IF NOT EXISTS discovery_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  phase VARCHAR(50) NOT NULL DEFAULT 'initial',
  messages JSONB DEFAULT '[]'::jsonb,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_discovery_sessions_user_id ON discovery_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_discovery_sessions_created_at ON discovery_sessions(created_at);

-- ============================================================================
-- USER CONTEXTS TABLE
-- ============================================================================
-- Stores comprehensive user context data

CREATE TABLE IF NOT EXISTS user_contexts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comprehensive JSONB DEFAULT '{}'::jsonb,
  modules JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster user lookups
CREATE INDEX IF NOT EXISTS idx_user_contexts_user_id ON user_contexts(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Enable RLS on all tables

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE discovery_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_contexts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
-- Users can only access their own data

-- Profiles: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Allow insert during signup (will be linked to auth user)
CREATE POLICY "Allow profile creation during signup" ON profiles
  FOR INSERT WITH CHECK (true);

-- Discovery Sessions: Full access for own sessions
CREATE POLICY "Users can view own discovery sessions" ON discovery_sessions
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own discovery sessions" ON discovery_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own discovery sessions" ON discovery_sessions
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own discovery sessions" ON discovery_sessions
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- User Contexts: Full access for own contexts
CREATE POLICY "Users can view own contexts" ON user_contexts
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own contexts" ON user_contexts
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own contexts" ON user_contexts
  FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own contexts" ON user_contexts
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================
-- Automatically update updated_at timestamp

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discovery_sessions_updated_at
  BEFORE UPDATE ON discovery_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_contexts_updated_at
  BEFORE UPDATE ON user_contexts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SYNC PROFILE WITH AUTH
-- ============================================================================
-- Automatically create profile when user signs up

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
