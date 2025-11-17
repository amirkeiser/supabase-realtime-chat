-- Migration: Create Storage Bucket for Profile Photos
-- Purpose: Set up storage bucket for user profile photos with RLS policies
-- Created: 2025-11-17
-- 
-- This migration:
-- 1. Creates a public storage bucket called 'profile-photos'
-- 2. Sets up RLS policies to allow users to upload their own photos
-- 3. Allows public read access to approved profile photos

-- Create the profile-photos storage bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-photos',
  'profile-photos',
  true, -- Public bucket so photos can be accessed via public URLs
  5242880, -- 5MB file size limit
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] -- Only allow common image formats
);

-- RLS Policy: Allow authenticated users to upload their own profile photo
-- Users can only upload to a path matching their user ID
create policy "Users can upload their own profile photo"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profile-photos' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Allow authenticated users to update their own profile photo
-- Users can only update files in their own folder
create policy "Users can update their own profile photo"
on storage.objects for update
to authenticated
using (
  bucket_id = 'profile-photos' 
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'profile-photos' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Allow authenticated users to delete their own profile photo
-- Users can only delete files in their own folder
create policy "Users can delete their own profile photo"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'profile-photos' 
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy: Allow public read access to all profile photos
-- Since profiles are reviewed and approved, we allow public access to all photos in this bucket
-- This enables the matchmaking feature where users can view approved profiles
create policy "Public read access to profile photos"
on storage.objects for select
to public
using (bucket_id = 'profile-photos');

