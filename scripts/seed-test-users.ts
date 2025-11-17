/**
 * Seed Test Users Script
 * 
 * Creates 10 test users (5 male, 5 female) with approved profiles
 * Usage: npx tsx scripts/seed-test-users.ts
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/services/supabase/types/database';

// Load environment variables from .env.local
config({ path: '.env.local' });

// Configuration - Set your Supabase credentials
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables!');
  console.error('Please set the following in your .env.local file:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase admin client
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Test user data
const maleNames = [
  'Ahmed Hassan',
  'Mohammed Ali',
  'Omar Ibrahim',
  'Yusuf Malik',
  'Tariq Rahman'
];

const femaleNames = [
  'Fatima Ahmed',
  'Aisha Mohammed',
  'Zainab Hassan',
  'Mariam Ali',
  'Layla Ibrahim'
];

const locations = [
  'Cairo, Egypt',
  'Riyadh, Saudi Arabia',
  'Dubai, UAE',
  'Istanbul, Turkey',
  'Kuala Lumpur, Malaysia',
  'London, UK',
  'Toronto, Canada',
  'New York, USA'
];

const bios = [
  'Looking for a meaningful connection based on shared values and faith.',
  'Passionate about faith, family, and building a future together.',
  'Seeking a partner who values tradition and modern life balance.',
  'Love reading, traveling, and exploring new cultures.',
  'Family-oriented person looking for someone with similar values.',
  'Enjoy outdoor activities and meaningful conversations.',
  'Professional seeking a life partner who shares my faith and goals.',
  'Devoted to faith and family, looking for the same in a partner.'
];

const religiousLevels = ['practicing', 'moderate', 'very_practicing'];
const prayerFrequencies = ['five_times', 'regularly', 'occasionally'];
const educationLevels = ['bachelors', 'masters', 'high_school', 'phd'];
const occupations = [
  'Software Engineer',
  'Doctor',
  'Teacher',
  'Business Owner',
  'Accountant',
  'Nurse',
  'Marketing Manager',
  'Architect'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomAge(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDateOfBirth(age: number): string {
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${birthYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

async function downloadAndUploadPhoto(userId: string, index: number): Promise<string> {
  try {
    // Download photo from pravatar.cc with a specific seed to get different images
    const response = await fetch(`https://i.pravatar.cc/400?img=${index}`);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase storage
    const fileName = `${userId}/profile.jpg`;
    const { data, error } = await supabase.storage
      .from('profile-photos')
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error(`Error uploading photo for user ${userId}:`, error);
    throw error;
  }
}

async function createTestUser(
  name: string,
  email: string,
  gender: 'male' | 'female',
  index: number
): Promise<void> {
  try {
    console.log(`Creating user: ${name} (${email})...`);

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: '123', // Default password for test users
      email_confirm: true,
      user_metadata: {
        name
      }
    });

    if (authError) {
      throw authError;
    }

    if (!authData.user) {
      throw new Error('No user returned from auth creation');
    }

    const userId = authData.user.id;
    console.log(`  ✓ Auth user created with ID: ${userId}`);

    // Upload profile photo
    console.log(`  Uploading profile photo...`);
    const photoUrl = await downloadAndUploadPhoto(userId, index);
    console.log(`  ✓ Photo uploaded: ${photoUrl}`);

    // Generate user data
    const age = getRandomAge(22, 35);
    const dateOfBirth = getDateOfBirth(age);
    const location = getRandomElement(locations);
    const bio = getRandomElement(bios);
    
    const religiousInfo = {
      level: getRandomElement(religiousLevels),
      prayer_frequency: getRandomElement(prayerFrequencies),
      hijab: gender === 'female' ? (Math.random() > 0.5) : undefined
    };

    const preferences = {
      age_range: {
        min: age - 5,
        max: age + 5
      },
      location_preference: getRandomElement(['same_city', 'same_country', 'anywhere']),
      education: getRandomElement(educationLevels),
      occupation: getRandomElement(occupations)
    };

    // Update user profile
    const { error: profileError } = await supabase
      .from('user_profile')
      .update({
        name,
        bio,
        date_of_birth: dateOfBirth,
        gender,
        location,
        photo_url: photoUrl,
        religious_info: religiousInfo,
        preferences,
        profile_status: 'approved',
        submitted_at: new Date().toISOString(),
        reviewed_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (profileError) {
      throw profileError;
    }

    console.log(`  ✓ Profile updated and approved`);
    console.log(`  ✓ User created successfully!\n`);
  } catch (error) {
    console.error(`Error creating user ${name}:`, error);
    throw error;
  }
}

async function main() {
  console.log('🌱 Starting test user seed...\n');
  console.log('Creating 10 test users (5 male, 5 female)\n');
  console.log('Default password for all users: 123\n');
  console.log('═══════════════════════════════════════════\n');

  try {
    // Create male users
    for (let i = 0; i < maleNames.length; i++) {
      const name = maleNames[i];
      const firstName = name.split(' ')[0].toLowerCase();
      const email = `${firstName}@test.com`;
      await createTestUser(name, email, 'male', i + 1);
    }

    // Create female users
    for (let i = 0; i < femaleNames.length; i++) {
      const name = femaleNames[i];
      const firstName = name.split(' ')[0].toLowerCase();
      const email = `${firstName}@test.com`;
      await createTestUser(name, email, 'female', i + 6);
    }

    console.log('═══════════════════════════════════════════\n');
    console.log('✅ Seed completed successfully!\n');
    console.log('Test Users Created:');
    console.log('\nMale Users:');
    maleNames.forEach((name) => {
      const firstName = name.split(' ')[0].toLowerCase();
      console.log(`  ${name} - ${firstName}@test.com`);
    });
    console.log('\nFemale Users:');
    femaleNames.forEach((name) => {
      const firstName = name.split(' ')[0].toLowerCase();
      console.log(`  ${name} - ${firstName}@test.com`);
    });
    console.log('\nPassword for all users: 123');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main();

