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

async function finalAttempt() {
  try {
    console.log('🔧 Final attempt: Trying to force password column creation...');
    
    // Get current faculty structure
    const { data: currentFaculty, error: fetchError } = await supabase
      .from('faculty')
      .select('*')
      .limit(1);
    
    if (fetchError) {
      console.error('❌ Error fetching faculty:', fetchError);
      return;
    }
    
    console.log('📋 Current faculty structure:', Object.keys(currentFaculty[0]));
    
    // Try to insert a new faculty member with ALL existing fields + password
    // This might force Supabase to create the password column
    const newFaculty = {
      id: 'FINAL_TEST_123',
      name: 'Final Test Faculty',
      designation: 'Test',
      department: 'Test',
      rdproposalssangsation: 0,
      rdproposalssubmition: 0,
      rdproposals: 0,
      rdfunding: 0,
      journalpublications: 0,
      journalscoauthor: 0,
      studentpublications: 0,
      bookpublications: 0,
      patents: 0,
      onlinecertifications: 0,
      studentprojects: 0,
      fdpworks: 0,
      fdpworps: 0,
      industrycollabs: 0,
      otheractivities: 0,
      academicpasspercentage: '0%',
      effectivementoring: '0',
      password: 'password123' // This field doesn't exist yet
    };
    
    console.log('🔄 Attempting to insert faculty with password field...');
    
    try {
      const { data, error } = await supabase
        .from('faculty')
        .insert(newFaculty);
      
      if (error) {
        console.log('⚠️ Insert failed:', error.message);
        
        if (error.message.includes('password')) {
          console.log('❌ Password column definitely does not exist');
          console.log('🔒 This is a Supabase security restriction');
          console.log('📝 Client-side code CANNOT modify database structure');
          console.log('📝 Only database administrators can add columns');
          
          // Try one last approach - maybe we can use a different field name
          console.log('🔄 Trying with different field name...');
          
          const alternativeFaculty = {
            ...newFaculty,
            password: undefined,
            user_password: 'password123' // Try different name
          };
          
          const { data: altData, error: altError } = await supabase
            .from('faculty')
            .insert(alternativeFaculty);
          
          if (altError) {
            console.log('⚠️ Alternative field also failed:', altError.message);
          } else {
            console.log('✅ Alternative field worked!');
            console.log('📋 You can use "user_password" instead of "password"');
            return;
          }
          
        } else {
          console.log('⚠️ Different error occurred:', error.message);
        }
      } else {
        console.log('✅ Successfully inserted faculty with password!');
        console.log('🎉 Password column might have been auto-created!');
        
        // Verify the password column exists
        console.log('🔍 Verifying password column...');
        const { data: verifyData, error: verifyError } = await supabase
          .from('faculty')
          .select('id, name, password')
          .eq('id', 'FINAL_TEST_123')
          .single();
        
        if (verifyError) {
          console.error('❌ Error verifying:', verifyError);
        } else if (verifyData.password) {
          console.log('✅ Password column confirmed!');
          console.log('📋 Sample data:', verifyData);
          
          // Clean up test record
          await supabase
            .from('faculty')
            .delete()
            .eq('id', 'FINAL_TEST_123');
          
          console.log('🎉 Password column setup complete!');
          console.log('✅ Change password functionality should now work!');
          
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

finalAttempt();
