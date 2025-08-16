import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Load .env file from the project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
config({ path: resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function createFacultyTable() {
  console.log('Creating faculty table via REST API...');
  
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
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY
      },
      body: JSON.stringify({ sql: createTableSQL })
    });

    if (response.ok) {
      console.log('Faculty table created successfully!');
    } else {
      const error = await response.text();
      console.error('Error creating table:', error);
    }
  } catch (err) {
    console.error('Exception creating table:', err);
  }
}

createFacultyTable(); 