import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl);
  console.error('VITE_SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'Present' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  try {
    console.log('🔍 Checking Supabase Database...');
    console.log('URL:', supabaseUrl);
    console.log('Service Key:', supabaseServiceKey ? 'Present' : 'Missing');
    
    // Check if we can connect
    console.log('\n📡 Testing connection...');
    const { data: testData, error: testError } = await supabase
      .from('faculty')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection failed:', testError.message);
      return;
    }
    
    console.log('✅ Connection successful!');
    
    // Check faculty table
    console.log('\n👥 Checking faculty table...');
    const { data: facultyData, error: facultyError } = await supabase
      .from('faculty')
      .select('*')
      .limit(10);
    
    if (facultyError) {
      console.error('❌ Faculty table error:', facultyError.message);
    } else {
      console.log(`✅ Faculty table has ${facultyData.length} records`);
      if (facultyData.length > 0) {
        console.log('Sample faculty records:');
        facultyData.forEach((faculty, index) => {
          console.log(`  ${index + 1}. ID: ${faculty.id}, Name: ${faculty.name}, Designation: ${faculty.designation}`);
        });
      }
    }
    
    // Check achievement_submissions table
    console.log('\n📋 Checking achievement_submissions table...');
    const { data: submissionsData, error: submissionsError } = await supabase
      .from('achievement_submissions')
      .select('*')
      .limit(10);
    
    if (submissionsError) {
      console.error('❌ Achievement submissions table error:', submissionsError.message);
      console.log('This table might not exist yet.');
    } else {
      console.log(`✅ Achievement submissions table has ${submissionsData.length} records`);
      if (submissionsData.length > 0) {
        console.log('Sample submission records:');
        submissionsData.forEach((submission, index) => {
          console.log(`  ${index + 1}. ID: ${submission.id}, Faculty: ${submission.faculty_id}, Status: ${submission.status}`);
        });
      }
    }
    
    // Check storage buckets
    console.log('\n📁 Checking storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Storage error:', bucketsError.message);
    } else {
      console.log(`✅ Found ${buckets.length} storage buckets:`);
      buckets.forEach(bucket => {
        console.log(`  - ${bucket.name} (${bucket.public ? 'Public' : 'Private'})`);
      });
    }
    
    // Check specific faculty for role testing
    console.log('\n🔍 Testing role check for specific faculty...');
    if (facultyData && facultyData.length > 0) {
      const testFaculty = facultyData[0];
      console.log(`Testing with faculty: ${testFaculty.name} (ID: ${testFaculty.id})`);
      
      const { data: roleData, error: roleError } = await supabase
        .from('faculty')
        .select('designation')
        .eq('id', testFaculty.id)
        .single();
      
      if (roleError) {
        console.error('❌ Role check error:', roleError.message);
      } else {
        console.log(`✅ Role check successful: ${roleData.designation}`);
        console.log(`Is Head of Department: ${roleData.designation === 'Head of Department'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkDatabase();
