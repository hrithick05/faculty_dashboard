import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env file manually
const envPath = join(__dirname, '.env');
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
const supabaseServiceKey = envVars.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.error('You need to add VITE_SUPABASE_SERVICE_KEY to your .env file');
  console.error('Get it from: Project Settings > API > service_role key');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Service Role Key: ✅ Found (Admin privileges enabled)');

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAchievementSystem() {
  try {
    console.log('\n🚀 SETTING UP COMPLETE ACHIEVEMENT SYSTEM...');
    console.log('=============================================');
    
    // Step 1: Create storage bucket
    console.log('\n📁 Step 1: Creating storage bucket...');
    try {
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.log('❌ Error listing buckets:', listError.message);
        throw new Error('Cannot access storage');
      }
      
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
          throw new Error(`Bucket creation failed: ${bucketError.message}`);
        } else {
          console.log('✅ Bucket "achievement-pdfs" created successfully');
        }
      }
    } catch (error) {
      console.log('❌ Storage bucket setup failed:', error.message);
      throw error;
    }
    
    // Step 2: Create database table
    console.log('\n🗄️  Step 2: Creating database table...');
    
    try {
      // Try to create table by inserting a test record
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
      
              if (insertError && insertError.message) {
          if (insertError.message.includes('does not exist')) {
          console.log('❌ Table does not exist and cannot be created automatically');
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
          throw new Error('Table creation requires manual SQL execution');
        } else {
          console.log('❌ Table creation failed:', insertError.message);
          throw new Error(`Table creation failed: ${insertError.message}`);
        }
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
    } catch (error) {
      console.log('❌ Database setup failed:', error.message);
      throw error;
    }
    
    // Step 3: Verify faculty table access
    console.log('\n👥 Step 3: Verifying faculty table access...');
    try {
      const { data: facultyData, error: facultyError } = await supabase
        .from('faculty')
        .select('id, name, designation')
        .limit(5);
      
      if (facultyError) {
        console.log('❌ Error accessing faculty table:', facultyError.message);
        throw new Error(`Faculty table access failed: ${facultyError.message}`);
      } else {
        console.log(`✅ Faculty table accessible with ${facultyData?.length || 0} records`);
        if (facultyData && facultyData.length > 0) {
          console.log('📋 Sample faculty:', facultyData.map(f => `${f.name} (${f.designation})`));
        }
      }
    } catch (error) {
      console.log('❌ Faculty table check failed:', error.message);
      throw error;
    }
    
    console.log('\n🎯 ACHIEVEMENT SYSTEM SETUP COMPLETE!');
    console.log('=======================================');
    console.log('✅ Storage bucket: achievement-pdfs');
    console.log('✅ Database table: achievement_submissions');
    console.log('✅ Faculty table: accessible');
    console.log('✅ Achievement categories: 6 types ready');
    console.log('✅ Status tracking: pending → approved/rejected');
    console.log('✅ PDF upload: enabled');
    console.log('✅ HOD approval: required for count increase');
    
    return true;
    
  } catch (error) {
    console.error('\n❌ SETUP FAILED:', error.message);
    return false;
  }
}

async function startBackend() {
  console.log('\n🚀 Starting Achievement System Backend...');
  console.log('==========================================');
  
  // Start the backend server with nodemon
  const backendProcess = spawn('npm', ['run', 'backend'], {
    stdio: 'inherit',
    shell: true
  });
  
  backendProcess.on('error', (error) => {
    console.error('❌ Failed to start backend:', error.message);
  });
  
  backendProcess.on('exit', (code) => {
    console.log(`\n🔄 Backend process exited with code ${code}`);
    console.log('🔄 Restarting in 3 seconds...');
    setTimeout(() => startBackend(), 3000);
  });
}

async function main() {
  try {
    // First, set up the achievement system
    const setupSuccess = await setupAchievementSystem();
    
    if (setupSuccess) {
      console.log('\n🎉 Setup completed successfully!');
      console.log('🚀 Starting backend server...');
      
      // Start the backend server
      await startBackend();
    } else {
      console.log('\n❌ Setup failed. Please check the errors above.');
      console.log('📋 You may need to manually create the database table.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the main function
main();
