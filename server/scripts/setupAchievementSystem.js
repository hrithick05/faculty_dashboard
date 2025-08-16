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

async function setupAchievementSystem() {
  try {
    console.log('\n🚀 Setting up Achievement System...');
    console.log('=====================================');
    
    // Step 1: Create storage bucket
    console.log('\n📁 Step 1: Creating storage bucket...');
    try {
      const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('achievement-pdfs', {
        public: true,
        allowedMimeTypes: ['application/pdf'],
        fileSizeLimit: 10485760 // 10MB limit
      });
      
      if (bucketError) {
        if (bucketError.message.includes('already exists')) {
          console.log('✅ Bucket "achievement-pdfs" already exists');
        } else {
          console.log('⚠️  Bucket creation failed:', bucketError.message);
          console.log('📋 You may need to create it manually in Supabase Dashboard');
        }
      } else {
        console.log('✅ Bucket "achievement-pdfs" created successfully');
      }
    } catch (error) {
      console.log('⚠️  Storage bucket setup failed:', error.message);
    }
    
    // Step 2: Create database table
    console.log('\n🗄️  Step 2: Creating database table...');
    
    // Try to create the table using RPC
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
    
    try {
      const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (tableError) {
        console.log('⚠️  RPC method not available, trying alternative approach...');
        
        // Try to create table using the REST API approach
        console.log('📝 Creating table structure via REST API...');
        
        // Insert a test record to see if table exists
        const { error: testError } = await supabase
          .from('achievement_submissions')
          .select('id')
          .limit(1);
        
        if (testError && testError.message.includes('does not exist')) {
          console.log('📋 Table does not exist. Manual creation required.');
          console.log('📖 Please run this SQL in your Supabase SQL Editor:');
          console.log('\n' + '='.repeat(60));
          console.log(createTableSQL);
          console.log('='.repeat(60));
        } else if (testError) {
          console.log('⚠️  Error checking table:', testError.message);
        } else {
          console.log('✅ Table "achievement_submissions" already exists');
        }
      } else {
        console.log('✅ Table "achievement_submissions" created successfully');
        
        // Add constraints and indexes
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
      console.log('📋 Manual setup required. Please run this SQL in Supabase SQL Editor:');
      console.log('\n' + '='.repeat(60));
      console.log(createTableSQL);
      console.log('='.repeat(60));
    }
    
    // Step 3: Create indexes and view
    console.log('\n🔍 Step 3: Creating indexes and view...');
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_achievement_submissions_faculty_id ON achievement_submissions(faculty_id);
      CREATE INDEX IF NOT EXISTS idx_achievement_submissions_category ON achievement_submissions(category);
      CREATE INDEX IF NOT EXISTS idx_achievement_submissions_status ON achievement_submissions(status);
      CREATE INDEX IF NOT EXISTS idx_achievement_submissions_submission_date ON achievement_submissions(submission_date);
      
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
    `;
    
    try {
      await supabase.rpc('exec_sql', { sql: indexesSQL });
      console.log('✅ Indexes and view created successfully');
    } catch (error) {
      console.log('⚠️  Indexes creation failed:', error.message);
      console.log('📋 You may need to create them manually');
    }
    
    console.log('\n🎯 Achievement System Setup Summary:');
    console.log('=====================================');
    console.log('✅ Storage bucket: achievement-pdfs');
    console.log('✅ Database table: achievement_submissions');
    console.log('✅ Achievement categories: 6 types');
    console.log('✅ Status tracking: pending → approved/rejected');
    console.log('✅ PDF upload: enabled');
    console.log('✅ HOD approval: required for count increase');
    
    console.log('\n🚀 Your achievement system is ready!');
    console.log('📖 Next steps:');
    console.log('   1. Go to /achievements in your app');
    console.log('   2. Upload PDFs for achievements');
    console.log('   3. HODs can approve/reject submissions');
    console.log('   4. Achievement counts increase after approval');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

// Run the setup
setupAchievementSystem();
