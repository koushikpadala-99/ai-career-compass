# Firebase + Supabase Setup Guide

## Overview

This guide will help you set up Firebase Authentication and Supabase database for the AI Career Compass application.

## Prerequisites

- Node.js installed
- npm or yarn installed
- A Google account (for Firebase)
- A GitHub account (for Supabase)

## Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
Visit: https://console.firebase.google.com/

### 1.2 Create New Project
1. Click "Add project"
2. Enter project name: `ai-career-compass`
3. Disable Google Analytics (optional)
4. Click "Create project"

### 1.3 Enable Authentication
1. In Firebase Console, go to "Authentication"
2. Click "Get started"
3. Enable "Email/Password" sign-in method
4. Enable "Google" sign-in method (optional)

### 1.4 Get Firebase Configuration
1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click the web icon (</>)
4. Register app with nickname: `ai-career-compass-web`
5. Copy the firebaseConfig object

Example:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "ai-career-compass.firebaseapp.com",
  projectId: "ai-career-compass",
  storageBucket: "ai-career-compass.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Step 2: Create Supabase Project

### 2.1 Go to Supabase
Visit: https://supabase.com/

### 2.2 Create New Project
1. Click "New project"
2. Select your organization or create one
3. Enter project details:
   - Name: `ai-career-compass`
   - Database Password: (generate strong password)
   - Region: Choose closest to your users
4. Click "Create new project"
5. Wait for project to be ready (2-3 minutes)

### 2.3 Get Supabase Configuration
1. Go to Project Settings > API
2. Copy:
   - Project URL
   - anon/public key

Example:
```
URL: https://abcdefghijklmnop.supabase.co
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.4 Run Database Schema
1. Go to SQL Editor in Supabase Dashboard
2. Click "New query"
3. Copy the entire content of `supabase-schema.sql`
4. Paste into the editor
5. Click "Run" or press Ctrl+Enter
6. Verify tables are created in Table Editor

## Step 3: Configure Environment Variables

### 3.1 Update Frontend .env
1. Copy `.env.example` to `.env`:
   ```bash
   cd ai-career-compass
   copy .env.example .env  # Windows
   cp .env.example .env    # Mac/Linux
   ```

2. Edit `.env` and add your credentials:
   ```env
   # Firebase
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # Supabase
   VITE_SUPABASE_URL=https://your_project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Gemini (existing)
   VITE_GEMINI_API_KEY=your_gemini_key
   ```

## Step 4: Configure Supabase Authentication

### 4.1 Enable Firebase Auth in Supabase
1. Go to Supabase Dashboard > Authentication > Providers
2. Scroll to "Firebase"
3. Enable Firebase provider
4. Enter your Firebase Project ID

### 4.2 Set up JWT Secret
1. In Firebase Console, go to Project Settings > Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. In Supabase Dashboard > Project Settings > API
5. Add Firebase JWT secret (from the JSON file)

## Step 5: Install Dependencies

```bash
cd ai-career-compass
npm install firebase @supabase/supabase-js
```

## Step 6: Test the Setup

### 6.1 Start Development Server
```bash
npm run dev
```

### 6.2 Test Authentication
1. Go to http://localhost:5173/auth
2. Try to sign up with a new account
3. Check Firebase Console > Authentication > Users
4. User should appear in Firebase
5. Check Supabase Dashboard > Table Editor > user_profiles
6. User profile should be created automatically

### 6.3 Test Database Connection
Open browser console and run:
```javascript
// This should not show any errors
console.log('Firebase:', import.meta.env.VITE_FIREBASE_API_KEY ? 'Configured' : 'Missing');
console.log('Supabase:', import.meta.env.VITE_SUPABASE_URL ? 'Configured' : 'Missing');
```

## Step 7: Verify Row Level Security

### 7.1 Test RLS Policies
1. Sign up with a test account
2. Try to access data
3. Verify you can only see your own data
4. Try to access another user's data (should fail)

### 7.2 Check Supabase Logs
1. Go to Supabase Dashboard > Logs
2. Check for any authentication errors
3. Verify RLS policies are working

## Troubleshooting

### Issue 1: Firebase Configuration Error
**Error:** "Firebase: Error (auth/invalid-api-key)"

**Solution:**
- Check that all Firebase environment variables are correct
- Verify API key is not restricted in Firebase Console
- Restart development server after changing .env

### Issue 2: Supabase Connection Error
**Error:** "Failed to fetch"

**Solution:**
- Check Supabase URL is correct
- Verify anon key is correct
- Check if Supabase project is paused (free tier)
- Verify CORS settings in Supabase Dashboard

### Issue 3: RLS Policy Blocking Access
**Error:** "new row violates row-level security policy"

**Solution:**
- Check that user is authenticated
- Verify Firebase UID matches in user_profiles table
- Check RLS policies in Supabase Dashboard > Authentication > Policies

### Issue 4: User Profile Not Created
**Error:** User in Firebase but not in Supabase

**Solution:**
- Check that createUserProfile function is called after signup
- Verify Supabase connection is working
- Check Supabase logs for errors
- Manually create profile in Supabase Table Editor

## Security Checklist

- [ ] Firebase API key is in .env (not hardcoded)
- [ ] Supabase anon key is in .env (not hardcoded)
- [ ] .env file is in .gitignore
- [ ] RLS is enabled on all tables
- [ ] RLS policies are tested and working
- [ ] Firebase authentication is enabled
- [ ] Supabase project has strong database password
- [ ] Email verification is enabled in Firebase (optional)

## Next Steps

After setup is complete:

1. ✅ Update AuthContext to use Firebase
2. ✅ Create data hooks for Supabase
3. ✅ Migrate Quiz component to save to Supabase
4. ✅ Migrate Results component to read from Supabase
5. ✅ Migrate Roadmap component to use Supabase
6. ✅ Test all features end-to-end
7. ✅ Remove Django backend (optional)

## Useful Links

- Firebase Console: https://console.firebase.google.com/
- Firebase Docs: https://firebase.google.com/docs
- Supabase Dashboard: https://app.supabase.com/
- Supabase Docs: https://supabase.com/docs

## Support

If you encounter issues:
1. Check browser console for errors
2. Check Firebase Console > Authentication for user status
3. Check Supabase Dashboard > Logs for database errors
4. Verify environment variables are loaded
5. Restart development server

## Cost Estimation

### Firebase Free Tier
- 10,000 email/password authentications/month
- 50,000 Google sign-ins/month
- Sufficient for development and small apps

### Supabase Free Tier
- 500MB database storage
- 1GB file storage
- 2GB bandwidth/month
- Sufficient for development and small apps

Both services offer generous free tiers perfect for getting started!

