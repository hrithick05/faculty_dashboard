import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

async function addPasswordColumnDirect() {
  try {
    console.log('🔧 Trying direct SQL execution via Supabase...');
    console.log('🔗 Supabase URL:', supabaseUrl);
    
    // Extract the project ID from the URL
    const projectId = supabaseUrl.split('//')[1].split('.')[0];
    console.log('📋 Project ID:', projectId);
    
    // Try different endpoints that might allow SQL execution
    const endpoints = [
      `https://${projectId}.supabase.co/rest/v1/rpc/exec_sql`,
      `https://${projectId}.supabase.co/rest/v1/rpc/execute_sql`,
      `https://${projectId}.supabase.co/rest/v1/rpc/run_sql`,
      `https://${projectId}.supabase.co/rest/v1/rpc/sql`,
      `https://${projectId}.supabase.co/rest/v1/sql`,
      `https://${projectId}.supabase.co/sql/v1/query`
    ];
    
    for (const endpoint of endpoints) {
      console.log(`🔄 Trying endpoint: ${endpoint}`);
      
      try {
        const response = await fetch(endpoint, {
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
          console.log(`✅ Success with endpoint: ${endpoint}`);
          
          // Now update all existing faculty members
          console.log('🔧 Setting default passwords for all faculty members...');
          
          const updateResponse = await fetch(endpoint, {
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
            console.log('🎉 Password column setup complete!');
            return;
          } else {
            console.log('⚠️ Password update failed, but column was added');
            return;
          }
          
        } else {
          const errorText = await response.text();
          console.log(`⚠️ Failed with ${endpoint}:`, response.status, errorText.substring(0, 100));
        }
        
      } catch (endpointError) {
        console.log(`⚠️ Error with ${endpoint}:`, endpointError.message);
      }
    }
    
    console.log('❌ All endpoints failed');
    console.log('📝 You need to add the password column manually in Supabase dashboard');
    console.log('📝 SQL: ALTER TABLE faculty ADD COLUMN password TEXT DEFAULT \'password123\';');
    console.log('📝 UPDATE faculty SET password = \'password123\' WHERE password IS NULL;');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addPasswordColumnDirect();
