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

async function createBucketManually() {
  try {
    console.log('🚀 Creating storage bucket manually...');
    
    // First, let's check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ Error listing buckets:', listError.message);
      return;
    }
    
    console.log('📁 Existing buckets:', buckets?.map(b => b.name) || []);
    
    // Check if our bucket exists
    const bucketExists = buckets?.some(b => b.name === 'achievement-pdfs');
    
    if (bucketExists) {
      console.log('✅ Bucket "achievement-pdfs" already exists');
    } else {
      console.log('📝 Bucket does not exist, attempting to create...');
      
      // Try to create the bucket
      const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('achievement-pdfs', {
        public: true,
        allowedMimeTypes: ['application/pdf'],
        fileSizeLimit: 10485760 // 10MB limit
      });
      
      if (bucketError) {
        console.log('❌ Bucket creation failed:', bucketError.message);
        console.log('📋 You need to create it manually in Supabase Dashboard:');
        console.log('   1. Go to Storage in Supabase Dashboard');
        console.log('   2. Click "Create a new bucket"');
        console.log('   3. Name: achievement-pdfs');
        console.log('   4. Check "Public bucket"');
        console.log('   5. Click "Create bucket"');
      } else {
        console.log('✅ Bucket "achievement-pdfs" created successfully');
      }
    }
    
    // Now let's try to create the database table
    console.log('\n🗄️  Creating database table...');
    
    // Try to insert a test record to see if table exists
    const { error: testError } = await supabase
      .from('achievement_submissions')
      .select('id')
      .limit(1);
    
    if (testError && testError.message.includes('does not exist')) {
      console.log('📋 Table does not exist. You need to create it manually:');
      console.log('   1. Go to SQL Editor in Supabase Dashboard');
      console.log('   2. Run this SQL:');
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
    } else if (testError) {
      console.log('⚠️  Error checking table:', testError.message);
    } else {
      console.log('✅ Table "achievement_submissions" already exists');
    }
    
    console.log('\n🎯 Manual Setup Required:');
    console.log('==========================');
    console.log('1. Create storage bucket "achievement-pdfs" in Supabase Dashboard');
    console.log('2. Run the SQL above in SQL Editor to create the table');
    console.log('3. Then your achievement system will be ready!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
createBucketManually();
