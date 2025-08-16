# Achievement Management System

## Overview

The Achievement Management System is a comprehensive solution that allows faculty members to submit their achievements (research, publications, patents, etc.) for HOD approval. The system ensures that achievement counts only increase after proper verification and approval by the Head of Department.

## Features

### 🎯 For Faculty Members
- **Submit Achievements**: Upload PDFs and provide details for various achievement categories
- **Track Submissions**: Monitor the status of submitted achievements (pending, approved, rejected)
- **View Statistics**: See submission counts and approval rates
- **Download PDFs**: Access submitted documents for reference

### 🔍 For HODs (Heads of Department)
- **Review Panel**: Comprehensive interface to review all faculty submissions
- **Approve/Reject**: Make decisions on achievement submissions with notes
- **Filter & Search**: Find submissions by status, category, or department
- **Update Counts**: Automatically update faculty achievement counts upon approval

## Achievement Categories

| Category | Database Field | Description |
|----------|----------------|-------------|
| Research & Development | `rdProposals` | Research proposals, papers, grants, projects |
| Publication | `journalPublications` | Journal articles, conference papers, books |
| Innovation & Patents | `patents` | Patent filings, innovations, technology transfer |
| Student Engagement | `studentProjects` | Student mentoring, projects, workshops |
| Professional Development | `fdpWorks` | FDP workshops, certifications, training |
| Industry & Others | `industryCollabs` | Industry collaborations, consultancy, visits |

## How It Works

### 1. Submission Process
1. Faculty member logs into the system
2. Navigates to **Achievements** → **Submit Achievement**
3. Selects achievement category and type
4. Uploads supporting PDF document
5. Provides title, description, and achievement value
6. Submits for HOD review

### 2. Review Process
1. HOD accesses **Achievements** → **Review Panel**
2. Views all pending submissions with filters
3. Downloads and reviews PDF documents
4. Approves or rejects with review notes
5. System automatically updates faculty achievement counts

### 3. Count Update
- **Approved**: Achievement value is added to the corresponding faculty field
- **Rejected**: No count update, faculty can see rejection reason
- **Pending**: No count update until HOD decision

## Database Schema

### New Table: `achievement_submissions`
```sql
CREATE TABLE achievement_submissions (
  id UUID PRIMARY KEY,
  faculty_id TEXT REFERENCES faculty(id),
  category TEXT NOT NULL,
  submission_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT NOT NULL,
  submission_date TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  reviewed_by TEXT REFERENCES faculty(id),
  reviewed_at TIMESTAMP,
  review_notes TEXT,
  achievement_value INTEGER DEFAULT 1,
  academic_year TEXT,
  semester TEXT
);
```

### Storage Bucket: `achievement-pdfs`
- Private bucket for secure PDF storage
- 10MB file size limit
- PDF files only
- Access controlled by user authentication

## Setup Instructions

### 1. Database Migration
Run the new migration to create the achievement submissions table:
```bash
# Apply the new migration
psql -h your-supabase-host -U postgres -d postgres -f supabase/migrations/03_create_achievement_submissions_table.sql
```

### 2. Storage Setup
Set up the Supabase storage bucket for PDFs:
```bash
# Install dependencies if needed
npm install @supabase/supabase-js

# Run storage setup script
node scripts/setupStorage.js
```

**Manual Setup Alternative:**
1. Go to Supabase Dashboard → Storage
2. Create bucket named `achievement-pdfs`
3. Set as private (not public)
4. Add policies for authenticated users

### 3. Environment Variables
Ensure these are set in your `.env` file:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_SUPABASE_SERVICE_KEY=your-supabase-service-key
```

## Usage Guide

### Faculty Members

#### Submitting an Achievement
1. Navigate to `/achievements`
2. Click **Submit Achievement** tab
3. Fill in the form:
   - Select category (Research & Development, Publication, etc.)
   - Choose submission type
   - Enter title and description
   - Set achievement value (default: 1)
   - Upload PDF document
4. Click **Submit Achievement**

#### Tracking Submissions
1. Go to **My Submissions** tab
2. View all your submissions with status indicators
3. Filter by status or category
4. Click **View** to see details and download PDFs

### HODs (Heads of Department)

#### Reviewing Submissions
1. Navigate to `/achievements`
2. Click **Review Panel** tab
3. Use filters to find specific submissions
4. Click **View** on any submission to:
   - See submission details
   - Download and review PDF
   - Approve or reject with notes
5. Approved submissions automatically update faculty counts

#### Filtering Options
- **Status**: Pending, Approved, Rejected
- **Category**: All achievement categories
- **Department**: Filter by faculty department

## Security Features

- **Authentication Required**: Only logged-in users can access
- **Role-Based Access**: HOD review panel only visible to HODs
- **PDF Security**: Private storage bucket with controlled access
- **Data Validation**: Input validation and file type restrictions
- **Audit Trail**: Complete submission and review history

## File Management

### PDF Requirements
- **Format**: PDF only
- **Size**: Maximum 10MB
- **Content**: Supporting documentation for achievements
- **Storage**: Secure Supabase storage with access control

### File Naming
Files are automatically renamed with timestamp prefix:
```
{timestamp}_{original-filename}.pdf
```

## Troubleshooting

### Common Issues

#### PDF Upload Fails
- Check file size (max 10MB)
- Ensure file is PDF format
- Verify internet connection
- Check Supabase storage bucket exists

#### HOD Review Panel Not Visible
- Verify user designation is "Head of Department"
- Check database role verification
- Ensure proper authentication

#### Achievement Counts Not Updating
- Verify submission was approved by HOD
- Check database connection
- Review approval workflow logs

### Support
For technical issues:
1. Check browser console for errors
2. Verify Supabase configuration
3. Check database migration status
4. Review storage bucket policies

## Future Enhancements

- **Email Notifications**: Alert faculty of approval/rejection
- **Bulk Operations**: Process multiple submissions at once
- **Advanced Analytics**: Submission trends and department performance
- **Mobile App**: Native mobile interface
- **Integration**: Connect with external academic databases
- **Workflow Automation**: Multi-level approval processes

## API Endpoints

### Submissions
- `POST /achievement_submissions` - Create new submission
- `GET /achievement_submissions` - List submissions
- `PUT /achievement_submissions/:id` - Update submission status

### Storage
- `POST /storage/v1/object/upload` - Upload PDF
- `GET /storage/v1/object/public/:path` - Download PDF

## Contributing

To contribute to the achievement system:
1. Follow existing code patterns
2. Add proper error handling
3. Include user feedback mechanisms
4. Test with various user roles
5. Update documentation

---

**Note**: This system ensures data integrity by requiring HOD approval before updating achievement counts, maintaining the academic rigor of the faculty dashboard.
