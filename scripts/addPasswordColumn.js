import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY; // Using service key for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing');
  console.error('VITE_SUPABASE_SERVICE_KEY:', supabaseKey ? 'Found' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addPasswordColumn() {
  try {
    console.log('🔧 Adding password column to faculty table...');
    console.log('🔗 Supabase URL:', supabaseUrl);
    
    // First, check current table structure
    console.log('🔍 Checking current faculty table structure...');
    const { data: facultyData, error: checkError } = await supabase
      .from('faculty')
      .select('*')
      .limit(1);
    
    if (checkError) {
      console.error('❌ Error checking faculty table:', checkError);
      return;
    }
    
    console.log('✅ Faculty table accessible');
    console.log('📋 Current columns:', Object.keys(facultyData[0]));
    
    // Check if password column already exists
    if (facultyData[0].hasOwnProperty('password')) {
      console.log('✅ Password column already exists!');
      return;
    }
    
    console.log('🔧 Password column does not exist. Trying alternative approach...');
    
    // Try to add password column by inserting a record with the new field
    // This might auto-create the column if the database allows it
    console.log('🔄 Attempting to add password column via data insertion...');
    
    try {
      // Get all faculty data
      const { data: allFaculty, error: fetchError } = await supabase
        .from('faculty')
        .select('*');
      
      if (fetchError) {
        throw fetchError;
      }
      
      console.log(`📊 Found ${allFaculty.length} faculty members to update`);
      
      // Try to update each faculty member with a password field
      let successCount = 0;
      let errorCount = 0;
      
      for (const faculty of allFaculty) {
        try {
          const { error: updateError } = await supabase
            .from('faculty')
            .update({ 
              ...faculty,
              password: 'password123' 
            })
            .eq('id', faculty.id);
          
          if (updateError) {
            console.log(`⚠️ Failed to update ${faculty.id}:`, updateError.message);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (individualError) {
          console.log(`⚠️ Error updating ${faculty.id}:`, individualError.message);
          errorCount++;
        }
      }
      
      console.log(`📊 Update results: ${successCount} successful, ${errorCount} failed`);
      
      if (successCount > 0) {
        console.log('✅ Some faculty members were updated with passwords');
        
        // Verify if the password column now exists
        console.log('🔍 Verifying password column was added...');
        const { data: verifyData, error: verifyError } = await supabase
          .from('faculty')
          .select('id, name, password')
          .limit(1);
        
        if (verifyError) {
          console.error('❌ Error verifying password column:', verifyError);
        } else if (verifyData[0].hasOwnProperty('password')) {
          console.log('✅ Password column verified successfully!');
          console.log('📋 Sample faculty data with password:', verifyData[0]);
        } else {
          console.log('⚠️ Password column still not accessible after updates');
        }
      }
      
    } catch (insertError) {
      console.error('❌ Error in data insertion approach:', insertError);
      
      // Last resort: Try to create a new table with the password column
      console.log('🔄 Attempting to create new faculty table with password column...');
      
      try {
        // This approach might not work without proper permissions, but worth trying
        console.log('⚠️ Cannot create new table via client. Please add password column manually.');
        console.log('📝 SQL to run in Supabase SQL Editor:');
        console.log('ALTER TABLE faculty ADD COLUMN password TEXT DEFAULT \'password123\';');
        console.log('UPDATE faculty SET password = \'password123\' WHERE password IS NULL;');
        
      } catch (tableError) {
        console.error('❌ All automated methods failed');
        console.error('❌ Please add the password column manually in Supabase dashboard');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addPasswordColumn();
