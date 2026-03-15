# Requirements Document

## Introduction

This document specifies the requirements for migrating from a Django REST Framework backend with SQLite database to Firebase Authentication and Supabase PostgreSQL database. The migration aims to modernize the authentication system, improve scalability, and simplify backend maintenance while preserving all existing functionality and user data.

## Glossary

- **Firebase_Auth**: Firebase Authentication service that manages user authentication, sessions, and password reset functionality
- **Supabase_DB**: Supabase PostgreSQL database that stores application data including user profiles, assessments, and career information
- **Django_Backend**: The existing Django REST Framework backend with JWT authentication and SQLite database
- **Frontend_Client**: The React application that interacts with authentication and database services
- **Firebase_UID**: Unique identifier assigned by Firebase Authentication to each user
- **ID_Token**: JWT token issued by Firebase Authentication used to authenticate requests to Supabase
- **RLS_Policy**: Row Level Security policy in Supabase that restricts data access based on authenticated user
- **User_Profile**: Supabase table containing user information linked to Firebase_UID
- **Assessment_Record**: Supabase table containing quiz responses, skills, and interests data
- **Career_Data**: Supabase table containing career information and matching algorithms
- **Recommendation_Record**: Supabase table containing career suggestions and roadmaps
- **Migration_Script**: Automated script that transfers data from Django_Backend to Firebase_Auth and Supabase_DB
- **Auth_Context**: React context that manages authentication state in Frontend_Client
- **Supabase_Client**: JavaScript client library for interacting with Supabase_DB

## Requirements

### Requirement 1: Firebase Authentication Integration

**User Story:** As a user, I want to authenticate using Firebase Authentication, so that I can securely access my account with modern authentication infrastructure.

#### Acceptance Criteria

1. THE Firebase_Auth SHALL support email and password authentication
2. WHEN a user submits valid credentials, THE Firebase_Auth SHALL return an ID_Token within 2 seconds
3. WHEN a user submits invalid credentials, THE Firebase_Auth SHALL return a descriptive error message
4. THE Frontend_Client SHALL store the ID_Token securely in memory or secure storage
5. WHEN an ID_Token expires, THE Firebase_Auth SHALL automatically refresh the token without user intervention
6. THE Firebase_Auth SHALL maintain user session state across browser refreshes

### Requirement 2: User Registration

**User Story:** As a new user, I want to create an account with email and password, so that I can start using the application.

#### Acceptance Criteria

1. WHEN a user provides a valid email and password, THE Firebase_Auth SHALL create a new user account
2. WHEN a user provides an email that already exists, THE Firebase_Auth SHALL return an error indicating the email is already registered
3. WHEN a user provides a password shorter than 6 characters, THE Firebase_Auth SHALL reject the registration with a descriptive error
4. WHEN Firebase_Auth creates a new user, THE Frontend_Client SHALL create a corresponding User_Profile record in Supabase_DB with the Firebase_UID
5. THE User_Profile record SHALL include name, email, join_date, points, level, and streak fields

### Requirement 3: User Login

**User Story:** As a returning user, I want to log in with my email and password, so that I can access my saved data.

#### Acceptance Criteria

1. WHEN a user provides valid login credentials, THE Firebase_Auth SHALL authenticate the user and return an ID_Token
2. WHEN a user provides invalid credentials, THE Firebase_Auth SHALL return an error message without revealing whether the email or password was incorrect
3. WHEN authentication succeeds, THE Frontend_C