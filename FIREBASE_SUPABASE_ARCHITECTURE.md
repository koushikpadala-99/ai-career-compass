# Firebase + Supabase Architecture

## Overview

This document outlines the migration from Django backend to Firebase Authentication + Supabase database.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  - User Interface                                            │
│  - Firebase Auth SDK                                         │
│  - Supabase Client SDK                                       │
└─────────────────────────────────────────────────────────────┘
                    │                    │
                    │                    │
        ┌───────────▼──────────┐    ┌───▼──────────────┐
        │  Firebase Auth       │    │  Supabase DB     │
        │  - Sign Up           │    │  - User Profiles │
        │  - Login             │    │  - Assessments   │
        │  - Password Reset    │    │  - Recommendations│
        │  - User Management   │    │  - Career Data   │
        └──────────────────────┘    └──────────────────┘
```

## Database Schema (Supabase)

### 1. user_profiles
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Profile data
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 1,
  tasks_completed INTEGER DEFAULT 0,
  study_hours DECIMAL DEFAULT 0.0
);
```

### 2. assessments
```sql
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Quiz responses
  activities TEXT,
  subjects TEXT,
  work_environment TEXT,
  motivation TEXT,
  skills TEXT,
  work_style TEXT,
  pace TEXT,
  education TEXT,
  
  -- Analysis results
  interests JSONB,
  strengths JSONB
);
```

### 3. recommendations
```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Career recommendations
  career_title TEXT NOT NULL,
  match_score INTEGER NOT NULL,
  description TEXT,
  salary_range TEXT,
  growth_outlook TEXT,
  required_education TEXT,
  key_skills JSONB,
  
  -- User interaction
  is_saved BOOLEAN DEFAULT FALSE,
  notes TEXT
);
```

### 4. roadmaps
```sql
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  career_title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Roadmap data
  milestones JSONB,
  resources JSONB,
  progress INTEGER DEFAULT 0
);
```

### 5. daily_tasks
```sql
CREATE TABLE daily_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  duration INTEGER, -- in minutes
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE
);
```

## Row Level Security (RLS)

Enable RLS on all tables and create policies:

```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (firebase_uid = auth.uid());

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (firebase_uid = auth.uid());

-- Policies for assessments
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

-- Similar policies for other tables...
```

## Firebase Configuration

### Authentication Methods
- Email/Password
- Google OAuth
- GitHub OAuth (optional)
- Password Reset via Email

### Firebase Security Rules
```json
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

## Integration Flow

### 1. User Sign Up
```
User fills signup form
  ↓
Firebase creates auth account
  ↓
Get Firebase UID
  ↓
Create user_profile in Supabase with firebase_uid
  ↓
User logged in
```

### 2. User Login
```
User enters credentials
  ↓
Firebase authenticates
  ↓
Get Firebase ID token
  ↓
Use token to authenticate Supabase requests
  ↓
Fetch user_profile from Supabase
  ↓
User logged in with data
```

### 3. Data Access
```
User makes request
  ↓
Include Firebase ID token
  ↓
Supabase validates token
  ↓
RLS policies check firebase_uid
  ↓
Return user's data only
```

## Environment Variables

### Frontend (.env)
```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Supabase
VITE_SUPABASE_URL=https://your_project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Gemini (for chatbot)
VITE_GEMINI_API_KEY=your_gemini_key
```

## Migration Steps

1. ✅ Set up Firebase project
2. ✅ Set up Supabase project
3. ✅ Create database schema in Supabase
4. ✅ Install Firebase and Supabase SDKs
5. ✅ Create Firebase service
6. ✅ Create Supabase service
7. ✅ Update AuthContext to use Firebase
8. ✅ Create data hooks for Supabase
9. ✅ Migrate existing components
10. ✅ Test authentication flow
11. ✅ Test data operations
12. ✅ Remove Django backend (optional)

## Benefits

### Firebase Auth
- ✅ Built-in email verification
- ✅ Password reset functionality
- ✅ OAuth providers (Google, GitHub)
- ✅ Secure token management
- ✅ No backend code needed

### Supabase
- ✅ PostgreSQL database (more powerful than SQLite)
- ✅ Real-time subscriptions
- ✅ Row Level Security
- ✅ Auto-generated REST API
- ✅ Built-in authentication integration
- ✅ File storage
- ✅ Edge functions

### Combined
- ✅ Serverless architecture
- ✅ Automatic scaling
- ✅ Lower maintenance
- ✅ Better security
- ✅ Real-time capabilities
- ✅ Cost-effective

## Security Considerations

1. **Firebase ID Tokens**: Short-lived, automatically refreshed
2. **RLS Policies**: Ensure users can only access their own data
3. **API Keys**: Supabase anon key is safe for client-side use
4. **CORS**: Properly configured in Supabase dashboard
5. **Environment Variables**: Never commit real keys to Git

## Cost Estimation

### Firebase (Free Tier)
- 10K email/password authentications/month
- 50K Google sign-ins/month
- Sufficient for development and small apps

### Supabase (Free Tier)
- 500MB database
- 1GB file storage
- 2GB bandwidth
- Sufficient for development and small apps

## Next Steps

1. Create Firebase project
2. Create Supabase project
3. Install dependencies
4. Implement services
5. Update components
6. Test thoroughly
7. Deploy

