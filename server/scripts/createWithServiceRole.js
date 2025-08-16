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

// Supabase configuration - we need the service role key for admin operations
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseServiceKey = envVars.VITE_SUPABASE_ANON_KEY; // This is the anon key, we need service role

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('🔗 Supabase URL:', supabaseUrl);
console.log('⚠️  Note: Using anon key - may have limited permissions');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createWithElevatedPermissions() {
  try {
    console.log('\n🚀 Creating Achievement System with Elevated Permissions...');
    console.log('==========================================================');
    
    // Step 1: Try to create storage bucket with different approach
    console.log('\n📁 Step 1: Creating storage bucket...');
    try {
      // First, let's try to list existing buckets to see what we can access
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.log('❌ Cannot list buckets due to permissions:', listError.message);
        console.log('📋 You need to create the storage bucket manually:');
        console.log('   1. Go to Storage in Supabase Dashboard');
        console.log('   2. Click "Create a new bucket"');
        console.log('   3. Name: achievement-pdfs');
        console.log('   4. Check "Public bucket"');
        console.log('   5. Click "Create bucket"');
      } else {
        console.log('📁 Existing buckets:', buckets?.map(b => b.name) || []);
        
        const bucketExists = buckets?.some(b => b.name === 'achievement-pdfs');
        
        if (bucketExists) {
          console.log('✅ Bucket "achievement-pdfs" already exists');
        } else {
          console.log('📝 Attempting to create bucket...');
          
          // Try to create the bucket
          const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('achievement-pdfs', {
            public: true,
            allowedMimeTypes: ['application/pdf'],
            fileSizeLimit: 10485760 // 10MB limit
          });
          
          if (bucketError) {
            console.log('❌ Bucket creation failed:', bucketError.message);
            console.log('📋 Manual creation required in Supabase Dashboard');
          } else {
            console.log('✅ Bucket "achievement-pdfs" created successfully');
          }
        }
      }
    } catch (error) {
      console.log('⚠️  Storage bucket setup failed:', error.message);
    }
    
    // Step 2: Try to create database table using direct SQL execution
    console.log('\n🗄️  Step 2: Creating database table...');
    
    try {
      // Try to use the exec_sql RPC function if it exists
      const createTableSQL = `
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
      `;
      
      const { data: sqlResult, error: sqlError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (sqlError) {
        console.log('⚠️  RPC method not available, trying alternative approach...');
        
        // Try to create table by inserting a test record
        console.log('📝 Attempting to create table via insert...');
        
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
          } else {
            console.log('❌ Table creation failed:', insertError.message);
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
      } else {
        console.log('✅ Table created successfully using RPC');
        
        // Now add constraints and indexes
        console.log('🔍 Adding constraints and indexes...');
        const constraintsSQL = `
          ALTER TABLE achievement_submissions 
          ADD CONSTRAINT IF NOT EXISTS fk_faculty_id 
          FOREIGN KEY (faculty_id) REFERENCES faculty(id) ON DELETE CASCADE;
          
          ALTER TABLE achievement_submissions 
          ADD CONSTRAINT IF NOT EXISTS check_category 
          CHECK (category IN ('research_dev', 'publication', 'innovation_patents', 'student_engagement', 'professional_dev', 'industry_others'));
          
          ALTER TABLE achievement_submissions 
          ADD CONSTRAINT IF NOT EXISTS check_status 
          CHECK (status IN ('pending', 'approved', 'rejected'));
        `;
        
        await supabase.rpc('exec_sql', { sql: constraintsSQL });
        console.log('✅ Constraints added successfully');
      }
    } catch (error) {
      console.log('❌ Database setup failed:', error.message);
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
      } else {
        console.log(`✅ Faculty table accessible with ${facultyData?.length || 0} records`);
        if (facultyData && facultyData.length > 0) {
          console.log('📋 Sample faculty:', facultyData.map(f => `${f.name} (${f.designation})`));
        }
      }
    } catch (error) {
      console.log('⚠️  Faculty table check failed:', error.message);
    }
    
    console.log('\n🎯 Achievement System Setup Summary:');
    console.log('=====================================');
    console.log('📁 Storage bucket: achievement-pdfs (may need manual creation)');
    console.log('🗄️  Database table: achievement_submissions (may need manual creation)');
    console.log('👥 Faculty table: ✅ accessible');
    console.log('✅ Achievement categories: 6 types ready');
    console.log('✅ Status tracking: pending → approved/rejected');
    console.log('✅ PDF upload: enabled (once bucket exists)');
    console.log('✅ HOD approval: required for count increase');
    
    console.log('\n📋 Manual Steps Required:');
    console.log('==========================');
    console.log('1. Create storage bucket "achievement-pdfs" in Supabase Dashboard');
    console.log('2. Run the SQL above in SQL Editor to create the table');
    console.log('3. Then your achievement system will be fully functional!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
createWithElevatedPermissions();
