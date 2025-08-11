import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Load .env file from the project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
config({ path: resolve(__dirname, '../.env') });

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function setupDatabase() {
  console.log('Setting up database...');
  
  // First, let's try to create the table using a different approach
  console.log('Creating faculty table...');
  
  try {
    // Try to insert a test record to see if table exists
    const { data: testData, error: testError } = await supabase
      .from('faculty')
      .select('id')
      .limit(1);
    
    if (testError && testError.code === '42P01') {
      console.log('Table does not exist. Creating it...');
      
      // Since we can't create table via client, let's try to create it by inserting data
      // The table will be created automatically with the correct structure
      const facultyJson = fs.readFileSync(new URL('../src/data/mockFaculty.json', import.meta.url), 'utf-8');
      const mockFacultyData = JSON.parse(facultyJson);
      
      // Try to insert the first record to create the table
      const { data, error } = await supabase
        .from('faculty')
        .insert(mockFacultyData[0]);
      
      if (error) {
        console.error('Error creating table via insert:', error);
        console.log('Please create the table manually in Supabase dashboard with this SQL:');
        console.log(`
CREATE TABLE IF NOT EXISTS faculty (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT NOT NULL,
  rdProposalsSangsation INTEGER,
  rdProposalsSubmition INTEGER,
  rdProposals INTEGER,
  rdFunding INTEGER,
  journalPublications INTEGER,
  journalsCoAuthor INTEGER,
  studentPublications INTEGER,
  bookPublications INTEGER,
  patents INTEGER,
  onlineCertifications INTEGER,
  studentProjects INTEGER,
  fdpWorks INTEGER,
  fdpWorps INTEGER,
  industryCollabs INTEGER,
  otherActivities INTEGER,
  academicPassPercentage TEXT,
  effectiveMentoring TEXT
);
        `);
        return;
      } else {
        console.log('Table created successfully via first insert!');
        // Now insert the rest of the data
        await seedFacultyData();
      }
    } else if (testError) {
      console.error('Error checking table:', testError);
    } else {
      console.log('Table already exists. Seeding data...');
      await seedFacultyData();
    }
  } catch (err) {
    console.error('Exception during setup:', err);
  }
}

async function seedFacultyData() {
  console.log('Seeding faculty data...');
  
  const facultyJson = fs.readFileSync(new URL('../src/data/mockFaculty.json', import.meta.url), 'utf-8');
  const mockFacultyData = JSON.parse(facultyJson);

  for (const faculty of mockFacultyData) {
    try {
      const { data, error } = await supabase.from('faculty').upsert(faculty);
      if (error) {
        console.error(`Error inserting faculty ${faculty.id}:`, error.message);
      } else {
        console.log(`Inserted/updated faculty ${faculty.id}`);
      }
    } catch (err) {
      console.error(`Exception inserting faculty ${faculty.id}:`, err);
    }
  }
  console.log('Faculty data seeding complete!');
}

setupDatabase(); 