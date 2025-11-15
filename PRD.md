# Maknoon - Product Requirements Document

## Product Overview

Maknoon is a privacy-first Shia Muslim matchmaking application that prioritizes gradual disclosure of personal information through a structured connection flow.

## Core Principle

Privacy through progressive disclosure: users unlock more personal information as they progress through connection stages.

---

## User Flow

### 1. Sign Up & Profile Creation

- User signs up (auth system already implemented)
- **Restricted access**: Cannot access platform until profile is complete and approved
- Required profile fields:
  - Photo
  - Bio
  - Religious questions (MVP: basic questions, will expand)
  - Matchmaking preferences
- Profile submitted for admin review

### 2. Admin Review System

- Admin dashboard to review profile submissions
- Two actions:
  - **Accept**: User gains platform access
  - **Deny**: Add optional note explaining rejection
- Only approved users can access main platform

### 3. Main Platform (Three Tabs)

#### Tab 1: Potential Matches

- Display algorithm-matched profiles
- **Privacy Level 1**: Profile shows bio, religious answers, preferences
- **Hidden**: Name, photo, contact details
- **Action**: Send connection request

#### Tab 2: Connection Requests

- View incoming connection requests
- **Actions**: Accept or decline

#### Tab 3: Connections

- Shows accepted connections
- **Privacy Level 2**: Now reveals photo and name
- **Still Hidden**: Contact details (phone, WhatsApp, email)
- **Action**: Click to open chat

### 4. Chat & Contact Sharing

- **Requirement**: Must have established connection
- Once connected, users can chat anytime (uses existing Supabase Realtime)
- In chat interface, users have two actions:
  - **Share Contact Details**: Offer to exchange contact info
  - **Block User**: Remove connection entirely
- **Mutual consent required**: Contact details only visible if BOTH users agree to share
- **Privacy Level 3**: After mutual consent, full contact information becomes visible (phone, WhatsApp, email)
- Users can now connect outside the platform

---

## Simplified Flow Summary

```
Sign Up → Fill Profile → Admin Approval → Browse Matches → Send Connection Request
   ↓
Accept Request → Chat Unlocked → Share Contacts (mutual) → Full Contact Access
```

**Key Simplifications for MVP:**

- No time limits on chats - once connected, chat anytime
- No session scheduling/requests - immediate chat access upon connection
- Manual contact sharing via button in chat UI
- Focus on core privacy: anonymous → name/photo → contacts

---

## Technical Stack (Already Implemented)

- Next.js frontend
- Supabase backend
- Supabase Realtime (for chat)
- Supabase Auth
- PostgreSQL database
- RLS policies for security

---

## MVP Scope

### In Scope

✅ Profile submission and admin approval workflow  
✅ Three-tab navigation (Matches, Requests, Connections)  
✅ Progressive privacy levels (3 stages)  
✅ Real-time chat for established connections  
✅ Mutual consent for contact sharing  
✅ Block user functionality  
✅ Basic matching algorithm (manual/simple for MVP)

### Out of Scope (Future Iterations)

❌ Time-limited chat sessions (20 min timers)  
❌ Chat session request/scheduling system  
❌ Advanced matching algorithms  
❌ Extensive religious questionnaire  
❌ In-app video/voice calls  
❌ Payment/subscription features  
❌ Complex preference filters

---

## Key User Stories

1. **As a new user**, I want to create a profile that gets reviewed before I can access the platform
2. **As an admin**, I want to review and approve/reject user profiles with optional feedback
3. **As a user**, I want to view potential matches without revealing my identity initially
4. **As a user**, I want to send connection requests to people I'm interested in
5. **As a user**, I want to accept/decline incoming connection requests
6. **As a user**, I want to chat with my connections anytime
7. **As a user**, I want to control who can see my contact details through mutual consent
8. **As a user**, I want to block users who I no longer wish to connect with

---

## Database Schema Requirements

### New Tables Needed

1. **profiles** - Extended user information (photo, bio, religious answers, preferences)
2. **profile_submissions** - Pending profiles awaiting admin review
3. **connections** - Accepted connections between users (tracks if contact details shared)
4. **connection_requests** - Pending connection requests
5. **contact_details** - Phone, WhatsApp, email (stored separately for privacy)
6. **admin_users** - Admin role management
7. **blocked_users** - Track blocked connections

### Modified Tables

- **chat_rooms** - Link to connections table (one chat room per connection)

---

## Privacy Levels Summary

| Stage                | Name | Photo | Bio/Religious Info | Contact Details |
| -------------------- | ---- | ----- | ------------------ | --------------- |
| Potential Match      | ❌   | ❌    | ✅                 | ❌              |
| Connection           | ✅   | ✅    | ✅                 | ❌              |
| After Mutual Consent | ✅   | ✅    | ✅                 | ✅              |

---

## Next Steps

1. Design database schema for new tables
2. Create admin dashboard for profile review
3. Build profile creation/submission flow
4. Implement three-tab navigation (Matches, Requests, Connections)
5. Link chat rooms to connections (one-to-one mapping)
6. Build contact details sharing UI in chat
7. Implement block user functionality

---

## Updates

### 2025-11-15 - Fix RLS Policy for Viewing Profiles

- **Issue**: Users couldn't see potential matches due to restrictive RLS policy
- **Root Cause**: `user_profile` SELECT policy only allowed users to view their own profile
- **Fix**: Updated policy to allow viewing approved profiles (for matchmaking)
- **New Policy**: Users can view their own profile + any approved profile
- **Migration**: `20251115000900_allow_viewing_approved_profiles.sql`

### 2025-11-15 - Connection System Implementation

- **Implemented**: Complete connection request and matching flow
- **Database Changes**:
  - Created `connection_requests` table to track pending/accepted/declined requests
  - Created `connections` table to store accepted connections between users
  - Added `connection_request_status` enum: 'pending', 'accepted', 'declined'
  - Added `connection_id` foreign key to `chat_room` table
  - User IDs ordered consistently (user1_id < user2_id) to prevent duplicates
- **Functions**:
  - `create_connection(request_id)` - Creates connection and private chat room atomically
  - `are_users_connected(user_id1, user_id2)` - Helper to check connection status
  - `get_connection_between_users(user_id1, user_id2)` - Get connection ID
- **Home Page**:
  - Three-section layout replacing old room list
  - **Potential Matches**: Shows approved users with bio/religious info (name/photo hidden)
  - **Connection Requests**: Incoming requests with accept/decline actions
  - **Connections**: Accepted connections with name/photo revealed, direct chat access
- **Server Actions**: Created `connections.ts` with full CRUD operations
  - `getPotentialMatches()` - Get approved users excluding existing connections/requests
  - `getConnectionRequests()` - Get incoming pending requests
  - `getConnections()` - Get user's accepted connections
  - `sendConnectionRequest()` - Send request to another user
  - `acceptConnectionRequest()` - Accept request and create connection + chat
  - `declineConnectionRequest()` - Decline request
  - `cancelConnectionRequest()` - Cancel sent pending request
- **RLS Security**:
  - Users can only view their own requests/connections
  - Requests can only be sent to approved users
  - Only receivers can accept/decline requests
  - Direct connection inserts blocked (must use `create_connection()` function)
- **Chat Integration**: Accepting a connection automatically creates a private chat room and adds both users
- **Privacy Levels**:
  - Level 1 (Matches): Bio, religious info, preferences visible; name/photo hidden
  - Level 2 (Connections): All info visible including name/photo
  - Level 3 (Contact sharing): Not yet implemented
- **MVP Simplifications Applied**:
  - No matching algorithm (shows all approved users)
  - No contact details sharing (future feature)
  - No block functionality (future feature)
- **Migration**: `20251115000800_add_connection_system.sql`

### 2025-11-15 - Profile System Implementation

- **Implemented**: Complete profile submission and admin review workflow
- **Database Changes**:
  - Extended `user_profile` table with profile fields (photo, bio, DOB, gender, location)
  - Added `profile_status` enum: incomplete → pending_review → approved/rejected
  - Added `gender_type` enum and JSONB fields for religious_info and preferences
  - Created `approve_profile()` and `reject_profile()` admin functions
- **Middleware**:
  - Enforces profile status flow: incomplete users → /profile/setup
  - Pending users → /profile/pending, rejected users → /profile/rejected
  - Admin bypass for all restrictions
  - Approved users can access platform AND edit their profile anytime
- **Pages**:
  - `/profile/setup` - Profile creation form with all required fields
  - `/profile/pending` - Waiting for admin review page
  - `/profile/rejected` - Rejection notice with resubmit option
  - `/admin` - Enhanced with profile review interface
- **Features**:
  - Users can edit profile even after approval (no lock-in)
  - Admins can approve/reject with optional rejection reason
  - Clean, minimal implementation with no over-engineering
- **Migration**: `20251115000700_add_profile_system.sql`

### 2025-11-15 - Fixed RLS Infinite Recursion Bug

- **Issue**: RLS policies caused infinite recursion when querying `user_profile` role
- **Root cause**: Policies checked `user_profile` table, which triggered the same policies again
- **Fix**:
  - Updated policies to use `is_admin()` function (security definer bypasses RLS)
  - Added `prevent_role_escalation()` trigger to block role changes by non-admins
  - Simplified policy logic to avoid self-referential queries
- **Result**: Admin routes now work correctly, recursion eliminated

### 2025-11-15 - Role-Based Access Control Implementation

- **Added**: User roles system with `user` and `admin` roles
- **Database**: Created `user_role` enum, added `role` column to `user_profile` table
- **Security**:
  - Middleware protection for `/admin` routes with automatic redirects
  - **RLS policies prevent users from changing their own role** (privilege escalation protection)
  - Users can only update their profile data, NOT the role column
  - Only admins can update roles through proper database queries
- **Functions**: Added `is_admin()` helper function for RLS policies
- **UI**: Admin dashboard page at `/admin` route (placeholder for future features)
- **Navigation**: Navbar shows "Admin" button for admin users only
- **Documentation**: Created `ADMIN_SETUP.md` with instructions for creating admin users
- **Implementation**: Production-ready, secure, minimal approach using RLS and middleware

### 2025-11-15 - Initial PRD + MVP Scope Simplification

- Created initial PRD with full matchmaking flow
- **Simplified MVP**: Removed time-limited chat sessions (20 min) and session request/scheduling system
- **Decision**: Once connected, users can chat anytime without artificial time constraints
- **Rationale**: Reduce complexity, focus on core privacy features, same Supabase Realtime costs
- Added Cost Considerations section documenting Realtime pricing model

---
