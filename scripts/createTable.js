import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Load .env file from the project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
config({ path: resolve(__dirname, '../.env') });

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createFacultyTable() {
  console.log('Creating faculty table...');
  
  const createTableSQL = `
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
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    if (error) {
      console.error('Error creating table:', error);
    } else {
      console.log('Faculty table created successfully!');
    }
  } catch (err) {
    console.error('Exception creating table:', err);
  }
}

createFacultyTable(); 