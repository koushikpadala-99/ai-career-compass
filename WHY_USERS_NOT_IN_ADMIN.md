# Why New Users Aren't Appearing in Django Admin

## The Problem

When you register a new user through the frontend (`http://localhost:5173/auth`), the user is NOT appearing in Django admin. This means registration is falling back to **localStorage only** instead of using the backend.

## Why This Happens

The `AuthContext.tsx` has a fallback mechanism:
1. **First**, it tries to register via backend API
2. **If that fails**, it falls back to localStorage (client-side only)
3. Users in localStorage are NOT in the database

## How to Diagnose

### Quick Test

1. **Open** `test-frontend-registration.html` in your browser
2. **Click** "Test Backend" - should show ✅ Backend is reachable
3. **Click** "Test Registration" - should show ✅ SUCCESS
4. **Check** Django admin - user should appear

### Check Browser Console

When you register through the frontend:

**If using backend (correct):**
```
✅ No errors
✅ Network tab shows POST to http://localhost:8000/api/auth/register/
✅ Status 201 (Created)
✅ Response has "user" and "tokens"
```

**If using localStorage (wrong):**
```
❌ Console shows: "Backend signup failed, using localStorage"
❌ Network tab shows failed request or no request
❌ No tokens in response
```

## Common Causes

### 1. Backend Not Running ❌
**Symptom:** Network error, cannot reach backend

**Solution:**
```bash
cd backend
python manage.py runserver
```

### 2. Frontend Not Restarted ❌
**Symptom:** Old code still running, changes not applied

**Solution:**
```bash
cd ai-career-compass
# Press Ctrl+C to stop
npm run dev
```

### 3. Environment Variable Not Set ❌
**Symptom:** `VITE_USE_BACKEND` is false or missing

**Check:** `ai-career-compass/.env`
```env
VITE_USE_BACKEND=true  ← Must be "true"
```

**Solution:**
```bash
# Edit ai-career-compass/.env
# Set VITE_USE_BACKEND=true
# Restart frontend server
```

### 4. CORS Blocking Requests ❌
**Symptom:** Console shows CORS error

**Check:** `backend/config/settings.py`
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### 5. Wrong API Endpoint ❌
**Symptom:** 404 errors in Network tab

**Check:** Should be `/api/auth/register/` not `/api/users/register/`

## Step-by-Step Fix

### Step 1: Verify Backend is Running
```bash
# Open terminal 1
cd backend
python manage.py runserver
```

Should see:
```
Starting development server at http://127.0.0.1:8000/
```

### Step 2: Test Backend API
```bash
# Open terminal 2
curl http://localhost:8000/api/auth/register/ -Method POST -ContentType "application/json" -Body '{"email":"apitest@example.com","password":"test123","username":"apitest"}' -UseBasicParsing
```

Should return user data with status 201.

### Step 3: Check Frontend Environment
```bash
# Check ai-career-compass/.env
cat ai-career-compass/.env
```

Should have:
```env
VITE_API_URL=http://localhost:8000/api
VITE_USE_BACKEND=true
```

### Step 4: Restart Frontend
```bash
# Open terminal 3
cd ai-career-compass
# Stop current server (Ctrl+C)
npm run dev
```

### Step 5: Test Registration
1. Go to `http://localhost:5173/auth`
2. Open DevTools (F12)
3. Go to Console tab
4. Go to Network tab
5. Register a new user
6. Watch for:
   - Console: No errors
   - Network: POST to `/api/auth/register/` with status 201
   - Response: Contains `user` and `tokens`

### Step 6: Verify in Django Admin
1. Go to `http://localhost:8000/admin/users/user/`
2. Refresh the page
3. New user should appear! ✅

## How to Check Where Users Are Stored

### Check Backend Database
```bash
cd backend
python list_users.py
```

Shows users in Django database.

### Check localStorage
Open browser console:
```javascript
// Check if using localStorage fallback
console.log(localStorage.getItem('registered_users'));

// If this returns data, authentication is using localStorage only
// If this returns null, authentication is using backend ✅
```

## Expected Behavior

### ✅ Correct (Using Backend)
```
User registers → Frontend calls backend API → Backend saves to database → 
User appears in Django admin → Tokens stored in localStorage
```

### ❌ Wrong (Using localStorage)
```
User registers → Backend fails → Frontend saves to localStorage → 
User NOT in Django admin → Only stored in browser
```

## Quick Diagnostic Commands

### 1. Check if backend is running:
```bash
curl http://localhost:8000/admin/
```

### 2. Check if frontend can reach backend:
```bash
curl http://localhost:8000/api/auth/register/ -Method OPTIONS
```

### 3. List users in database:
```bash
cd backend
python list_users.py
```

### 4. Check environment variables:
```bash
# Windows PowerShell
Get-Content ai-career-compass\.env
```

## Test Registration Right Now

### Option 1: Use Test HTML Page
1. Open `test-frontend-registration.html` in browser
2. Click "Test Registration"
3. Check result

### Option 2: Use Frontend App
1. Make sure backend is running
2. Make sure frontend is running
3. Go to `http://localhost:5173/auth`
4. Register with: `realtest@example.com` / `test123456`
5. Check Django admin

### Option 3: Use API Directly
```bash
curl http://localhost:8000/api/auth/register/ -Method POST -ContentType "application/json" -Body '{"email":"directtest@example.com","password":"test123","username":"directtest"}' -UseBasicParsing
```

## Current Status Check

Run these commands to check current status:

```bash
# 1. Check backend is running
curl http://localhost:8000/admin/

# 2. List current users
cd backend
python list_users.py

# 3. Check environment
cat ai-career-compass/.env | grep VITE_USE_BACKEND
```

## Summary

**If users are NOT appearing in Django admin:**
1. ✅ Backend is running
2. ✅ Frontend environment has `VITE_USE_BACKEND=true`
3. ✅ Frontend server restarted after changes
4. ✅ No CORS errors in console
5. ✅ Network tab shows successful API calls

**Most common issue:** Frontend server not restarted after code changes!

