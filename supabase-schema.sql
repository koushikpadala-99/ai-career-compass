-- AI Career Compass - Supabase Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Gamification
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 1,
  tasks_completed INTEGER DEFAULT 0,
  study_hours DECIMAL DEFAULT 0.0,
  
  -- Profile metadata
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Index for faster lookups
CREATE INDEX idx_user_profiles_firebase_uid ON user_profiles(firebase_uid);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- ============================================
-- 2. ASSESSMENTS TABLE
-- ============================================
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Quiz responses (Q&A format)
  activities TEXT,
  subjects TEXT,
  work_environment TEXT,
  motivation TEXT,
  skills TEXT,
  work_style TEXT,
  pace TEXT,
  education TEXT,
  
  -- Analysis results
  interests JSONB DEFAULT '[]'::jsonb,
  strengths JSONB DEFAULT '[]'::jsonb,
  personality_traits JSONB DEFAULT '{}'::jsonb,
  
  -- Metadata
  completed BOOLEAN DEFAULT TRUE,
  score INTEGER
);

CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);

-- ============================================
-- 3. RECOMMENDATIONS TABLE
-- ============================================
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Career details
  career_title TEXT NOT NULL,
  career_category TEXT,
  match_score INTEGER NOT NULL CHECK (match_score >= 0 AND match_score <= 100),
  description TEXT,
  
  -- Career information
  salary_range TEXT,
  growth_outlook TEXT,
  required_education TEXT,
  key_skills JSONB DEFAULT '[]'::jsonb,
  work_environment TEXT,
  
  -- User interaction
  is_saved BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  notes TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT unique_user_career UNIQUE(user_id, career_title, assessment_id)
);

CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_recommendations_assessment_id ON recommendations(assessment_id);
CREATE INDEX idx_recommendations_match_score ON recommendations(match_score DESC);
CREATE INDEX idx_recommendations_is_saved ON recommendations(is_saved) WHERE is_saved = TRUE;

-- ============================================
-- 4. ROADMAPS TABLE
-- ============================================
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  career_title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Roadmap structure
  milestones JSONB DEFAULT '[]'::jsonb,
  resources JSONB DEFAULT '[]'::jsonb,
  timeline_months INTEGER,
  
  -- Progress tracking
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_milestone INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  
  CONSTRAINT unique_user_career_roadmap UNIQUE(user_id, career_title)
);

CREATE INDEX idx_roadmaps_user_id ON roadmaps(user_id);
CREATE INDEX idx_roadmaps_status ON roadmaps(status);

-- ============================================
-- 5. DAILY TASKS TABLE
-- ============================================
CREATE TABLE daily_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  roadmap_id UUID REFERENCES roadmaps(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date DATE,
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('learning', 'practice', 'networking', 'application', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  duration INTEGER, -- in minutes
  
  -- Completion
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Gamification
  points_reward INTEGER DEFAULT 10
);

CREATE INDEX idx_daily_tasks_user_id ON daily_tasks(user_id);
CREATE INDEX idx_daily_tasks_due_date ON daily_tasks(due_date);
CREATE INDEX idx_daily_tasks_completed ON daily_tasks(completed);

-- ============================================
-- 6. STUDY SESSIONS TABLE
-- ============================================
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  
  -- Session details
  topic TEXT,
  duration_minutes INTEGER,
  notes TEXT,
  
  -- Resources used
  resources_used JSONB DEFAULT '[]'::jsonb,
  
  -- Effectiveness
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5)
);

CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_started_at ON study_sessions(started_at DESC);

-- ============================================
-- 7. SAVED CAREERS TABLE
-- ============================================
CREATE TABLE saved_careers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  career_title TEXT NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User notes
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  
  CONSTRAINT unique_user_saved_career UNIQUE(user_id, career_title)
);

CREATE INDEX idx_saved_careers_user_id ON saved_careers(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_careers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - USER PROFILES
-- ============================================

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (firebase_uid = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (firebase_uid = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (firebase_uid = auth.uid());

-- ============================================
-- RLS POLICIES - ASSESSMENTS
-- ============================================

CREATE POLICY "Users can view own assessments"
  ON assessments FOR SELECT
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can insert own assessments"
  ON assessments FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can update own assessments"
  ON assessments FOR UPDATE
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can delete own assessments"
  ON assessments FOR DELETE
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

-- ============================================
-- RLS POLICIES - RECOMMENDATIONS
-- ============================================

CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can insert own recommendations"
  ON recommendations FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can update own recommendations"
  ON recommendations FOR UPDATE
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can delete own recommendations"
  ON recommendations FOR DELETE
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

-- ============================================
-- RLS POLICIES - ROADMAPS
-- ============================================

CREATE POLICY "Users can view own roadmaps"
  ON roadmaps FOR SELECT
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can insert own roadmaps"
  ON roadmaps FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can update own roadmaps"
  ON roadmaps FOR UPDATE
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can delete own roadmaps"
  ON roadmaps FOR DELETE
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

-- ============================================
-- RLS POLICIES - DAILY TASKS
-- ============================================

CREATE POLICY "Users can view own tasks"
  ON daily_tasks FOR SELECT
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can insert own tasks"
  ON daily_tasks FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can update own tasks"
  ON daily_tasks FOR UPDATE
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can delete own tasks"
  ON daily_tasks FOR DELETE
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

-- ============================================
-- RLS POLICIES - STUDY SESSIONS
-- ============================================

CREATE POLICY "Users can view own study sessions"
  ON study_sessions FOR SELECT
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can insert own study sessions"
  ON study_sessions FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can update own study sessions"
  ON study_sessions FOR UPDATE
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can delete own study sessions"
  ON study_sessions FOR DELETE
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

-- ============================================
-- RLS POLICIES - SAVED CAREERS
-- ============================================

CREATE POLICY "Users can view own saved careers"
  ON saved_careers FOR SELECT
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can insert own saved careers"
  ON saved_careers FOR INSERT
  WITH CHECK (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can update own saved careers"
  ON saved_careers FOR UPDATE
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

CREATE POLICY "Users can delete own saved careers"
  ON saved_careers FOR DELETE
  USING (user_id IN (
    SELECT id FROM user_profiles WHERE firebase_uid = auth.uid()
  ));

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmaps_updated_at BEFORE UPDATE ON roadmaps
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Note: In production, user_profiles will be created automatically
-- when users sign up via Firebase

