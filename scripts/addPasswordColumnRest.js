import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

async function addPasswordColumnViaRest() {
  try {
    console.log('🔧 Adding password column via Supabase REST API...');
    console.log('🔗 Supabase URL:', supabaseUrl);
    
    // Extract the project ID from the URL
    const projectId = supabaseUrl.split('//')[1].split('.')[0];
    console.log('📋 Project ID:', projectId);
    
    // Use the Supabase REST API to execute SQL
    const sqlEndpoint = `https://${projectId}.supabase.co/rest/v1/rpc/exec_sql`;
    
    console.log('🔄 Attempting to add password column...');
    
    const response = await fetch(sqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        sql: 'ALTER TABLE faculty ADD COLUMN IF NOT EXISTS password TEXT DEFAULT \'password123\''
      })
    });
    
    if (response.ok) {
      console.log('✅ Password column added successfully!');
      
      // Now update all existing faculty members with default password
      console.log('🔧 Setting default passwords for all faculty members...');
      
      const updateResponse = await fetch(sqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          sql: 'UPDATE faculty SET password = \'password123\' WHERE password IS NULL'
        })
      });
      
      if (updateResponse.ok) {
        console.log('✅ Default passwords set successfully!');
      } else {
        console.log('⚠️ Password update failed, but column was added');
      }
      
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to add password column:', response.status, errorText);
      
      // Try alternative approach - create a new table
      console.log('🔄 Trying alternative approach...');
      
      const createTableResponse = await fetch(sqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          sql: `
            CREATE TABLE IF NOT EXISTS faculty_new (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              designation TEXT NOT NULL,
              department TEXT NOT NULL,
              rdproposalssangsation INTEGER,
              rdproposalssubmition INTEGER,
              rdproposals INTEGER,
              rdfunding INTEGER,
              journalpublications INTEGER,
              journalscoauthor INTEGER,
              studentpublications INTEGER,
              bookpublications INTEGER,
              patents INTEGER,
              onlinecertifications INTEGER,
              studentprojects INTEGER,
              fdpworks INTEGER,
              fdpworps INTEGER,
              industrycollabs INTEGER,
              otheractivities INTEGER,
              academicpasspercentage TEXT,
              effectivementoring TEXT,
              password TEXT DEFAULT 'password123'
            )
          `
        })
      });
      
      if (createTableResponse.ok) {
        console.log('✅ New faculty table created with password column!');
        console.log('⚠️ You will need to migrate data from old table to new table');
      } else {
        console.log('❌ All automated methods failed');
        console.log('📝 Please add the password column manually in Supabase dashboard:');
        console.log('ALTER TABLE faculty ADD COLUMN password TEXT DEFAULT \'password123\';');
        console.log('UPDATE faculty SET password = \'password123\' WHERE password IS NULL;');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.log('📝 Please add the password column manually in Supabase dashboard:');
    console.log('ALTER TABLE faculty ADD COLUMN password TEXT DEFAULT \'password123\';');
    console.log('UPDATE faculty SET password = \'password123\' WHERE password IS NULL;');
  }
}

addPasswordColumnViaRest();
