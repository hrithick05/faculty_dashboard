-- Migration: Create notifications table for faculty messages
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  faculty_id TEXT NOT NULL REFERENCES faculty(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('success', 'info', 'warning', 'error')),
  is_read BOOLEAN DEFAULT FALSE,
  related_submission_id UUID REFERENCES achievement_submissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_faculty_id ON notifications(faculty_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_related_submission ON notifications(related_submission_id);

-- Create a view for unread notifications count
CREATE OR REPLACE VIEW unread_notifications_count AS
SELECT 
  faculty_id,
  COUNT(*) as unread_count
FROM notifications 
WHERE is_read = FALSE
GROUP BY faculty_id;
