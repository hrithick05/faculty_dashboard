console.log('🚀 Achievement System Database Migration');
console.log('=====================================');
console.log('');
console.log('📋 Copy and paste this SQL in your Supabase SQL Editor:');
console.log('');

const migrationSQL = `-- Migration: Create achievement submissions table
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
GROUP BY faculty_id, category, submission_type;`;

console.log(migrationSQL);
console.log('');
console.log('📖 Next steps:');
console.log('   1. Go to your Supabase Dashboard');
console.log('   2. Navigate to SQL Editor');
console.log('   3. Copy and paste the SQL above');
console.log('   4. Click "Run" to execute the migration');
console.log('');
console.log('✅ After running this SQL, your achievement system will be ready!');
console.log('');
console.log('🎯 Then you can:');
console.log('   - Upload PDFs for achievements');
console.log('   - HODs can approve/reject submissions');
console.log('   - Achievement counts will increase only after approval');
