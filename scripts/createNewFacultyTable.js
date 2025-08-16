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

async function createNewFacultyTable() {
  try {
    console.log('🔧 Creating new faculty table with password column...');
    
    // First, get all existing faculty data
    console.log('📋 Fetching existing faculty data...');
    const { data: existingFaculty, error: fetchError } = await supabase
      .from('faculty')
      .select('*');
    
    if (fetchError) {
      console.error('❌ Error fetching existing faculty:', fetchError);
      return;
    }
    
    console.log(`✅ Found ${existingFaculty.length} existing faculty members`);
    
    // Create a new table with the password column
    console.log('🔄 Attempting to create new faculty table...');
    
    // Try to create a new table by inserting data with the password field
    // This might auto-create the table structure
    const testFaculty = {
      id: 'TEMP_MIGRATION',
      name: 'Temporary Migration Record',
      designation: 'Temporary',
      department: 'Temporary',
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
      password: 'password123'
    };
    
    try {
      // Try to insert into a new table name
      const { data: insertData, error: insertError } = await supabase
        .from('faculty_new')
        .insert(testFaculty);
      
      if (insertError) {
        console.log('⚠️ Insert into faculty_new failed:', insertError.message);
        
        // Try to insert into the original table with password field
        console.log('🔄 Trying to insert into original faculty table with password...');
        
        const { data: originalInsert, error: originalError } = await supabase
          .from('faculty')
          .insert(testFaculty);
        
        if (originalError) {
          console.log('⚠️ Original table insert failed:', originalError.message);
          
          if (originalError.message.includes('password')) {
            console.log('❌ Password column definitely does not exist');
            console.log('📝 You MUST add it manually in Supabase dashboard');
            console.log('📝 Go to: https://supabase.com/dashboard/project/yfcukflinfinmjvllwin');
            console.log('📝 Navigate to: Table Editor → faculty → Add Column');
            console.log('📝 Column Name: password, Type: text, Default: password123');
            return;
          }
        } else {
          console.log('✅ Successfully inserted into original table with password!');
          
          // Now verify the password column exists
          console.log('🔍 Verifying password column...');
          const { data: verifyData, error: verifyError } = await supabase
            .from('faculty')
            .select('id, name, password')
            .eq('id', 'TEMP_MIGRATION')
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
              .neq('id', 'TEMP_MIGRATION'); // Don't update our temp record
            
            if (updateError) {
              console.error('❌ Error updating existing faculty:', updateError);
            } else {
              console.log('✅ All existing faculty updated with default passwords!');
            }
            
            // Clean up temp record
            console.log('🧹 Cleaning up temp record...');
            await supabase
              .from('faculty')
              .delete()
              .eq('id', 'TEMP_MIGRATION');
            
            console.log('🎉 Password column setup complete!');
            console.log('✅ Change password functionality should now work!');
            
          } else {
            console.log('⚠️ Password field not accessible after insert');
          }
        }
        
      } else {
        console.log('✅ Successfully created faculty_new table!');
        console.log('📋 New table structure includes password column');
        
        // Now migrate all existing data
        console.log('🔄 Migrating existing faculty data...');
        
        for (const faculty of existingFaculty) {
          const facultyWithPassword = {
            ...faculty,
            password: 'password123'
          };
          
          const { error: migrateError } = await supabase
            .from('faculty_new')
            .insert(facultyWithPassword);
          
          if (migrateError) {
            console.log(`⚠️ Failed to migrate ${faculty.id}:`, migrateError.message);
          }
        }
        
        console.log('✅ Migration complete!');
        console.log('⚠️ Note: You now have both faculty and faculty_new tables');
        console.log('📝 You may want to rename tables in Supabase dashboard');
      }
      
    } catch (insertError) {
      console.error('❌ Insert error:', insertError);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

createNewFacultyTable();
