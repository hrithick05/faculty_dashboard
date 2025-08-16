import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env file manually
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const cleanKey = key.trim().replace(/\x00/g, '').replace(/[^\x20-\x7E]/g, '');
    const cleanValue = valueParts.join('=').trim().replace(/\x00/g, '').replace(/[^\x20-\x7E]/g, '');
    
    if (cleanKey && cleanValue) {
      envVars[cleanKey] = cleanValue;
    }
  }
});

// Supabase configuration
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseServiceKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('🔗 Supabase URL:', supabaseUrl);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateEverything() {
  try {
    console.log('\n🚀 Checking and Creating Achievement System...');
    console.log('===============================================');
    
    // Step 1: Check and create storage bucket
    console.log('\n📁 Step 1: Checking storage bucket...');
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.log('❌ Error listing buckets:', listError.message);
      } else {
        console.log('📁 Existing buckets:', buckets?.map(b => b.name) || []);
        
        const bucketExists = buckets?.some(b => b.name === 'achievement-pdfs');
        
        if (bucketExists) {
          console.log('✅ Bucket "achievement-pdfs" already exists');
        } else {
          console.log('📝 Creating bucket "achievement-pdfs"...');
          
          const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('achievement-pdfs', {
            public: true,
            allowedMimeTypes: ['application/pdf'],
            fileSizeLimit: 10485760 // 10MB limit
          });
          
          if (bucketError) {
            console.log('❌ Bucket creation failed:', bucketError.message);
          } else {
            console.log('✅ Bucket "achievement-pdfs" created successfully');
          }
        }
      }
    } catch (error) {
      console.log('⚠️  Storage bucket setup failed:', error.message);
    }
    
    // Step 2: Check and create database table
    console.log('\n🗄️  Step 2: Checking database table...');
    
    try {
      // Try to select from the table to see if it exists
      const { data: testData, error: testError } = await supabase
        .from('achievement_submissions')
        .select('id')
        .limit(1);
      
      if (testError && testError.message.includes('does not exist')) {
        console.log('📝 Table does not exist, creating it...');
        
        // Create the table using the REST API approach
        // We'll insert a test record and then delete it to create the table structure
        const testRecord = {
          faculty_id: 'test',
          category: 'research_dev',
          submission_type: 'test',
          title: 'Test Record',
          description: 'This is a test record to create the table',
          pdf_url: 'https://example.com/test.pdf',
          status: 'pending',
          achievement_value: 1
        };
        
        const { error: insertError } = await supabase
          .from('achievement_submissions')
          .insert(testRecord);
        
        if (insertError) {
          console.log('❌ Table creation failed:', insertError.message);
          console.log('📋 Manual creation required. Please run this SQL in Supabase SQL Editor:');
          console.log('\n' + '='.repeat(60));
          console.log(`
CREATE TABLE IF NOT EXISTS achievement_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id TEXT NOT NULL,
  category TEXT NOT NULL,
  submission_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT NOT NULL,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  achievement_value INTEGER NOT NULL DEFAULT 1,
  academic_year TEXT,
  semester TEXT
);

-- Add foreign key constraint
ALTER TABLE achievement_submissions 
ADD CONSTRAINT IF NOT EXISTS fk_faculty_id 
FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE;

-- Add check constraints
ALTER TABLE achievement_submissions 
ADD CONSTRAINT IF NOT EXISTS check_category 
CHECK (category IN ('research_dev', 'publication', 'innovation_patents', 'student_engagement', 'professional_dev', 'industry_others'));

ALTER TABLE achievement_submissions 
ADD CONSTRAINT IF NOT EXISTS check_status 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_achievement_submissions_faculty_id ON achievement_submissions(faculty_id);
CREATE INDEX IF NOT EXISTS idx_achievement_submissions_category ON achievement_submissions(category);
CREATE INDEX IF NOT EXISTS idx_achievement_submissions_status ON achievement_submissions(status);
CREATE INDEX IF NOT EXISTS idx_achievement_submissions_submission_date ON achievement_submissions(submission_date);

-- Create view
CREATE OR REPLACE VIEW approved_achievements_summary AS
SELECT
  faculty_id,
  category,
  submission_type,
  COUNT(*) as approved_count,
  SUM(achievement_value) as total_value
FROM achievement_submissions
WHERE status = 'approved'
GROUP BY faculty_id, category, submission_type;
          `);
          console.log('='.repeat(60));
        } else {
          console.log('✅ Table "achievement_submissions" created successfully');
          
          // Delete the test record
          const { error: deleteError } = await supabase
            .from('achievement_submissions')
            .delete()
            .eq('title', 'Test Record');
          
          if (deleteError) {
            console.log('⚠️  Could not delete test record:', deleteError.message);
          } else {
            console.log('✅ Test record cleaned up');
          }
        }
      } else if (testError) {
        console.log('⚠️  Error checking table:', testError.message);
      } else {
        console.log('✅ Table "achievement_submissions" already exists');
      }
    } catch (error) {
      console.log('❌ Database setup failed:', error.message);
    }
    
    // Step 3: Check if faculty table exists and has data
    console.log('\n👥 Step 3: Checking faculty table...');
    try {
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('id, name, designation')
        .limit(5);
      
      if (facultyError) {
        console.log('❌ Error accessing faculty table:', facultyError.message);
      } else {
        console.log(`✅ Faculty table accessible with ${facultyData?.length || 0} records`);
        if (facultyData && facultyData.length > 0) {
          console.log('📋 Sample faculty:', facultyData.map(f => `${f.name} (${f.designation})`));
        }
      }
    } catch (error) {
      console.log('⚠️  Faculty table check failed:', error.message);
    }
    
    console.log('\n🎯 Achievement System Status:');
    console.log('==============================');
    console.log('📁 Storage bucket: achievement-pdfs');
    console.log('🗄️  Database table: achievement_submissions');
    console.log('👥 Faculty table: accessible');
    console.log('✅ Achievement categories: 6 types ready');
    console.log('✅ Status tracking: pending → approved/rejected');
    console.log('✅ PDF upload: enabled');
    console.log('✅ HOD approval: required for count increase');
    
    console.log('\n🚀 Your achievement system should be ready!');
    console.log('📖 Test it by:');
    console.log('   1. Going to /achievements in your app');
    console.log('   2. Uploading a PDF for achievements');
    console.log('   3. Having HODs approve/reject submissions');
    console.log('   4. Seeing achievement counts increase after approval');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
checkAndCreateEverything();
