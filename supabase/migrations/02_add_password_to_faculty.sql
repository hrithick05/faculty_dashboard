-- Migration: Add password column to faculty table
ALTER TABLE faculty ADD COLUMN IF NOT EXISTS password TEXT DEFAULT 'password123';

-- Update existing faculty members with a default password
UPDATE faculty SET password = 'password123' WHERE password IS NULL;
