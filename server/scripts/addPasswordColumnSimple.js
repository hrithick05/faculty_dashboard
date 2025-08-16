import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addPasswordColumnSimple() {
  try {
    console.log('🔧 Trying simple approach to add password column...');
    
    // First, let's try to insert a new faculty member with a password field
    // This might auto-create the column if the database allows it
    console.log('🔄 Attempting to insert test faculty with password...');
    
    const testFaculty = {
      id: 'TEST_PASSWORD',
      name: 'Test Faculty for Password',
      designation: 'Test',
      department: 'Test',
      password: 'password123'
    };
    
    try {
      const { data, error } = await supabase
        .from('faculty')
        .insert(testFaculty);
      
      if (error) {
        console.log('⚠️ Insert failed:', error.message);
        
        if (error.message.includes('password')) {
          console.log('❌ Password column does not exist and cannot be auto-created');
          console.log('📝 You need to add it manually in Supabase dashboard');
          console.log('📝 SQL: ALTER TABLE faculty ADD COLUMN password TEXT DEFAULT \'password123\';');
          return;
        }
      } else {
        console.log('✅ Test faculty inserted successfully with password!');
        
        // Now verify the password column exists
        console.log('🔍 Verifying password column...');
        const { data: verifyData, error: verifyError } = await supabase
          .from('faculty')
          .select('id, name, password')
          .eq('id', 'TEST_PASSWORD')
          .single();
        
        if (verifyError) {
          console.error('❌ Error verifying:', verifyError);
        } else if (verifyData.password) {
          console.log('✅ Password column confirmed!');
          console.log('📋 Sample data:', verifyData);
          
          // Now update all existing faculty members
          console.log('🔧 Updating all existing faculty with default passwords...');
          
          const { error: updateError } = await supabase
            .from('faculty')
            .update({ password: 'password123' })
            .neq('id', 'TEST_PASSWORD'); // Don't update our test record
          
          if (updateError) {
            console.error('❌ Error updating existing faculty:', updateError);
          } else {
            console.log('✅ All existing faculty updated with default passwords!');
          }
          
          // Clean up test record
          console.log('🧹 Cleaning up test record...');
          await supabase
            .from('faculty')
            .delete()
            .eq('id', 'TEST_PASSWORD');
          
          console.log('✅ Password column setup complete!');
          
        } else {
          console.log('⚠️ Password field not accessible after insert');
        }
      }
      
    } catch (insertError) {
      console.error('❌ Insert error:', insertError);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

addPasswordColumnSimple();
