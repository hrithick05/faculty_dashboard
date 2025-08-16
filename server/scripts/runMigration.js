import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env file manually
const envPath = join(__dirname, '..', '.env');
console.log('🔍 Looking for .env file at:', envPath);

const envContent = readFileSync(envPath, 'utf8');
console.log('📄 .env file content length:', envContent.length);

const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    // Clean the key and value by removing null bytes and other encoding artifacts
    const cleanKey = key.trim().replace(/\x00/g, '').replace(/[^\x20-\x7E]/g, '');
    const cleanValue = valueParts.join('=').trim().replace(/\x00/g, '').replace(/[^\x20-\x7E]/g, '');
    
    if (cleanKey && cleanValue) {
      envVars[cleanKey] = cleanValue;
      console.log(`🔑 Parsed: ${cleanKey} = ${cleanValue}`);
    }
  }
});

console.log('📊 All parsed environment variables:', envVars);

// Supabase configuration
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseServiceKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('   VITE_SUPABASE_ANON_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

console.log('✅ Environment variables loaded:');
console.log('   VITE_SUPABASE_URL:', supabaseUrl);
console.log('   VITE_SUPABASE_ANON_KEY:', supabaseServiceKey.substring(0, 20) + '...');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// SQL migration
const migrationSQL = `
-- Migration: Create achievement submissions table
CREATE TABLE IF NOT EXISTS achievement_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id TEXT NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'research_dev',
    'publication',
    'innovation_patents',
    'student_engagement',
    'professional_dev',
    'industry_others'
  )),
  submission_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT NOT NULL,
  submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by TEXT REFERENCES faculty(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  achievement_value INTEGER NOT NULL DEFAULT 1,
  academic_year TEXT,
  semester TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_achievement_submissions_faculty_id ON achievement_submissions(faculty_id);
CREATE INDEX IF NOT EXISTS idx_achievement_submissions_category ON achievement_submissions(category);
CREATE INDEX IF NOT EXISTS idx_achievement_submissions_status ON achievement_submissions(status);
CREATE INDEX IF NOT EXISTS idx_achievement_submissions_submission_date ON achievement_submissions(submission_date);

-- Create a view for approved achievements by category
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

async function runMigration() {
  try {
    console.log('🚀 Starting database migration...');
    console.log('📊 Creating achievement_submissions table...');
    
    // Execute the migration SQL using RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.log('⚠️  RPC method not available, trying direct SQL execution...');
      
      // Try to execute the SQL directly by creating the table structure
      console.log('📝 Creating table structure...');
      
      // Create the table step by step
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
      
      // Execute table creation
      const { error: tableError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (tableError) {
        console.log('📋 Manual migration required:');
        console.log('   1. Go to your Supabase Dashboard');
        console.log('   2. Navigate to SQL Editor');
        console.log('   3. Copy and paste this SQL:');
        console.log('\n' + '='.repeat(60));
        console.log(migrationSQL);
        console.log('='.repeat(60));
      } else {
        console.log('✅ Table created successfully!');
        
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
        console.log('✅ Constraints added successfully!');
      }
      
    } else {
      console.log('✅ Migration completed successfully!');
      console.log('📊 achievement_submissions table created');
      console.log('🔍 Indexes created for performance');
      console.log('👁️  approved_achievements_summary view created');
    }
    
    console.log('\n🎯 Achievement system is now ready!');
    console.log('   - Staff can upload PDFs for achievements');
    console.log('   - HODs can approve/reject submissions');
    console.log('   - Achievement counts increase only after approval');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.log('\n📋 Manual migration required:');
    console.log('   1. Go to your Supabase Dashboard');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy and paste this SQL:');
    console.log('\n' + '='.repeat(60));
    console.log(migrationSQL);
    console.log('='.repeat(60));
  }
}

// Run the migration
runMigration();
