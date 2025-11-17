# Seed Test Users Script

This script generates test data for the application, creating 10 test users (5 male, 5 female) with approved profiles.

## Prerequisites

1. You need your Supabase Service Role Key (found in Supabase Dashboard → Project Settings → API)
2. Node.js and npm installed

## Setup

1. Install dependencies (if not already installed):

```bash
npm install
```

2. Set environment variables:

Create a `.env.local` file in the root directory (or use your existing one):

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

You can find these values in your Supabase Dashboard:

- Project Settings → API → Project URL
- Project Settings → API → service_role key (⚠️ Keep this secret!)

## Running the Script

Run the seed script:

```bash
npm run seed
```

Or directly with tsx:

```bash
npx tsx scripts/seed-test-users.ts
```

## What Gets Created

The script creates:

### 10 Test Users

- **5 Male Users:**

  - Ahmed Hassan (ahmed@test.com)
  - Mohammed Ali (mohammed@test.com)
  - Omar Ibrahim (omar@test.com)
  - Yusuf Malik (yusuf@test.com)
  - Tariq Rahman (tariq@test.com)

- **5 Female Users:**
  - Fatima Ahmed (fatima@test.com)
  - Aisha Mohammed (aisha@test.com)
  - Zainab Hassan (zainab@test.com)
  - Mariam Ali (mariam@test.com)
  - Layla Ibrahim (layla@test.com)

### Default Password

All test users have the password: **123**

### Profile Data

Each user profile includes:

- ✅ Approved status
- 📸 Profile photo (from https://i.pravatar.cc/400)
- 📝 Bio
- 📅 Date of birth (age 22-35)
- 📍 Location (random cities)
- 🕌 Religious information (practice level, prayer frequency)
- ❤️ Preferences (age range, location, education, occupation)
- 👤 Gender

### What's NOT Created

- ❌ No connection requests
- ❌ No connections
- ❌ No chat messages

## Cleanup

If you need to remove the test users, you can do so via:

1. Supabase Dashboard → Authentication → Users (delete manually)
2. Or create a cleanup script if needed

## Notes

- The script uses the Service Role Key which bypasses RLS policies
- Photos are fetched from pravatar.cc and uploaded to the `profile-photos` storage bucket
- Each user gets a unique photo using different seeds
- All profiles are automatically set to "approved" status
- The script will fail if users with the same email already exist

## Troubleshooting

**Error: "User already exists"**

- Delete existing test users from Supabase Dashboard first

**Error: "Invalid credentials"**

- Check your SUPABASE_SERVICE_ROLE_KEY is correct
- Make sure you're using the service_role key, not the anon key

**Error: "Storage bucket not found"**

- Ensure the `profile-photos` bucket exists
- Run the migration: `20251117000000_create_profile_photos_storage.sql`

**Photos not uploading**

- Check internet connection
- Verify storage bucket permissions
- Check the storage bucket is set to public
