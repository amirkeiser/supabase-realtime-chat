# Admin User Setup

## Creating an Admin User

Since the default role for all new users is `user`, you need to manually promote a user to `admin` role through the database.

### Method 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Table Editor** → `user_profile`
3. Find the user you want to make an admin
4. Click on the user's row to edit
5. Change the `role` field from `user` to `admin`
6. Save changes

### Method 2: Using SQL Editor

Run this SQL command in your Supabase SQL Editor:

```sql
-- Replace 'user@example.com' with the admin user's email
UPDATE user_profile
SET role = 'admin'
WHERE id = (
  SELECT id
  FROM auth.users
  WHERE email = 'user@example.com'
);
```

### Method 3: Using Supabase CLI

```bash
# Run SQL via CLI
supabase db execute "UPDATE user_profile SET role = 'admin' WHERE id = (SELECT id FROM auth.users WHERE email = 'user@example.com');"
```

## Creating First Admin User (Local Development)

For local development, you can set the role during signup by modifying the user metadata:

```typescript
// In your sign-up code (temporary, for first admin only)
const { data, error } = await supabase.auth.signUp({
  email: "admin@example.com",
  password: "your-secure-password",
  options: {
    data: {
      name: "Admin User",
      role: "admin", // This will be picked up by handle_new_user trigger
    },
  },
});
```

**Note:** Remove this code after creating your first admin user for security reasons.

## Verifying Admin Access

1. Log in with the admin account
2. You should automatically be redirected to `/admin`
3. An "Admin" button should appear in the navbar
4. Regular users attempting to access `/admin` will be redirected to `/`

## Security Considerations

### Role Protection (Critical)

The `role` column is **protected by Row Level Security (RLS)**:

✅ **Users CANNOT change their own role**

- RLS policy prevents users from updating the `role` column
- Users can only update their own profile (name, image, etc.) but **not** role
- Attempting to update role will fail silently or throw an error

✅ **Only admins can change roles**

- Admin users have a separate RLS policy allowing role updates
- Even admins must go through proper database queries

### Additional Security Measures

- **Never** hardcode admin credentials in your application
- Admin users are created through database updates, not through the application UI
- The middleware protects admin routes from non-admin users
- RLS policies ensure:
  - Users can only view their own profile
  - Admins can view all user profiles
  - Users cannot escalate their own privileges
- The `is_admin()` database function can be used in RLS policies for granular access control

## Role-Based Access Summary

| Role  | Access                          | Redirects                |
| ----- | ------------------------------- | ------------------------ |
| admin | Full platform + `/admin` routes | `/` → `/admin`           |
| user  | Standard platform only          | `/admin` → `/`           |
| none  | Auth pages only                 | Any page → `/auth/login` |
