-- Add profile system enums and columns
-- Enable profile submission, review, and approval workflow

-- Create profile status enum
CREATE TYPE user_profile_status AS ENUM (
  'incomplete',
  'pending_review',
  'approved',
  'rejected'
);

-- Create gender enum
CREATE TYPE gender_type AS ENUM (
  'male',
  'female'
);

-- Add new columns to user_profile
ALTER TABLE user_profile
ADD COLUMN profile_status user_profile_status NOT NULL DEFAULT 'incomplete',
ADD COLUMN photo_url varchar,
ADD COLUMN bio text,
ADD COLUMN date_of_birth date,
ADD COLUMN gender gender_type,
ADD COLUMN location varchar,
ADD COLUMN religious_info jsonb DEFAULT '{}'::jsonb,
ADD COLUMN preferences jsonb DEFAULT '{}'::jsonb,
ADD COLUMN submitted_at timestamp,
ADD COLUMN reviewed_at timestamp,
ADD COLUMN reviewed_by uuid REFERENCES user_profile(id),
ADD COLUMN rejection_reason text;

-- Function to approve profile (admin only)
CREATE OR REPLACE FUNCTION approve_profile(target_user_id uuid)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can approve profiles';
  END IF;

  UPDATE user_profile
  SET 
    profile_status = 'approved',
    reviewed_at = NOW(),
    reviewed_by = auth.uid(),
    rejection_reason = NULL
  WHERE id = target_user_id;
END;
$$;

-- Function to reject profile (admin only)
CREATE OR REPLACE FUNCTION reject_profile(target_user_id uuid, reason text DEFAULT NULL)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only admins can reject profiles';
  END IF;

  UPDATE user_profile
  SET 
    profile_status = 'rejected',
    reviewed_at = NOW(),
    reviewed_by = auth.uid(),
    rejection_reason = reason
  WHERE id = target_user_id;
END;
$$;

-- Update RLS policies for profile updates
-- Drop old restrictive policy and recreate with simpler logic
DROP POLICY IF EXISTS "Users can update own profile except role" ON user_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profile;
DROP POLICY IF EXISTS "Admins can update any profile" ON user_profile;

-- Users can update their own profile (including when approved)
-- Note: Role changes are prevented by the prevent_role_escalation() trigger
CREATE POLICY "Users can update own profile"
ON user_profile FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Admins can update any profile (simplified with is_admin function)
CREATE POLICY "Admins can update any profile"
ON user_profile FOR UPDATE
USING (is_admin())
WITH CHECK (is_admin());

