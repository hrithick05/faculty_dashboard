# Achievement System Setup Guide

## 🚀 Quick Setup (Recommended)

### Option 1: Run Migration Script
```bash
npm run migrate
```

### Option 2: Setup Storage
```bash
npm run setup:storage
```

## 📋 Manual Setup (If scripts fail)

### Step 1: Database Migration

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Create the achievement_submissions table**
   - Copy and paste this SQL:

```sql
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
```

4. **Click "Run" to execute the SQL**

### Step 2: Storage Setup

1. **Go to Storage in Supabase Dashboard**
   - Click on "Storage" in the left sidebar

2. **Create a new bucket**
   - Click "Create a new bucket"
   - Name: `achievement-pdfs`
   - Public bucket: ✅ Check this
   - Click "Create bucket"

3. **Set up storage policies**
   - Click on the `achievement-pdfs` bucket
   - Go to "Policies" tab
   - Click "New Policy"

4. **Create policies for different access levels:**

   **Policy 1: Allow authenticated users to upload**
   ```sql
   -- Name: Allow authenticated uploads
   -- Target: INSERT
   -- Using expression: auth.role() = 'authenticated'
   ```

   **Policy 2: Allow users to view their own files**
   ```sql
   -- Name: Allow users to view own files
   -- Target: SELECT
   -- Using expression: auth.uid()::text = (storage.foldername(name))[1]
   ```

   **Policy 3: Allow HODs to view all files**
   ```sql
   -- Name: Allow HODs to view all files
   -- Target: SELECT
   -- Using expression: EXISTS (
   --   SELECT 1 FROM faculty 
   --   WHERE id = auth.uid()::text 
   --   AND role = 'HOD'
   -- )
   ```

## 🔧 Environment Variables

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## ✅ Verification

After setup, you should see:

1. **Database**: `achievement_submissions` table exists
2. **Storage**: `achievement-pdfs` bucket exists
3. **Frontend**: Achievement management page accessible at `/achievements`

## 🚨 Troubleshooting

### Common Issues:

1. **"Table already exists"**
   - This is fine, the table was created successfully

2. **"Permission denied"**
   - Check your Supabase API keys
   - Ensure you're using the correct project

3. **"Foreign key constraint failed"**
   - Make sure the `faculty` table exists and has data
   - Check that faculty IDs match between tables

### Need Help?

- Check Supabase logs in the Dashboard
- Verify your environment variables
- Ensure your Supabase project is active

## 🎯 Next Steps

Once setup is complete:

1. **Test the system** by uploading a PDF
2. **Verify HOD access** to the review panel
3. **Check achievement counts** update correctly
4. **Test the complete workflow** from submission to approval

---

**Note**: If you encounter any issues, the manual setup (Option 2) is the most reliable method and gives you full control over the database structure.
