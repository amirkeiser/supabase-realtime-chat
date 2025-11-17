# Quick Start - Seed Test Users

## 🚀 TL;DR

1. **Set your environment variables:**
   ```bash
   export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

2. **Run the seed script:**
   ```bash
   npm run seed
   ```

3. **Login with any test user:**
   - Email: `ahmed@test.com` (or any from the list below)
   - Password: `123`

## 📋 Test Users Created

### Male Users (5)
| Name | Email | Password |
|------|-------|----------|
| Ahmed Hassan | ahmed@test.com | 123 |
| Mohammed Ali | mohammed@test.com | 123 |
| Omar Ibrahim | omar@test.com | 123 |
| Yusuf Malik | yusuf@test.com | 123 |
| Tariq Rahman | tariq@test.com | 123 |

### Female Users (5)
| Name | Email | Password |
|------|-------|----------|
| Fatima Ahmed | fatima@test.com | 123 |
| Aisha Mohammed | aisha@test.com | 123 |
| Zainab Hassan | zainab@test.com | 123 |
| Mariam Ali | mariam@test.com | 123 |
| Layla Ibrahim | layla@test.com | 123 |

## ✨ What Each User Has

- ✅ Approved profile status (ready to match)
- 📸 Profile photo (from pravatar.cc)
- 📝 Bio and personal information
- 📅 Age: 22-35 years old
- 📍 Location (various cities)
- 🕌 Religious information
- ❤️ Matchmaking preferences

## 🔍 What to Test

After seeding, you can test:

1. **Login/Authentication**
   - Try logging in with any test user
   - All have verified emails

2. **Profile Viewing**
   - View profiles in the matches section
   - See profile photos and information

3. **Matchmaking**
   - Browse potential matches
   - See the 10 approved profiles

4. **Profile Filtering**
   - Filter by gender
   - Filter by age range
   - Filter by location

## 📌 Notes

- No connections or requests are created (as requested)
- All profiles are in "approved" status
- Each user has unique profile data
- Photos are randomly generated from pravatar.cc

---

For more details, see [README.md](./README.md)

