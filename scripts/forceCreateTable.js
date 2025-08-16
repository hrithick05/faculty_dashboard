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

async function forceCreateTable() {
  try {
    console.log('🔧 Attempting to force create table with password column...');
    
    // Try to create a completely new table by inserting data
    // This might auto-create the table if we're lucky
    const testData = {
      id: 'FORCE_CREATE_TEST',
      name: 'Test Faculty',
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
      password: 'password123'
    };
    
    // Try multiple table names to see if any work
    const tableNames = ['faculty_with_password', 'faculty_secure', 'faculty_v2', 'faculty_new'];
    
    for (const tableName of tableNames) {
      console.log(`🔄 Trying table: ${tableName}`);
      
      try {
        const { data, error } = await supabase
          .from(tableName)
          .insert(testData);
        
        if (error) {
          console.log(`⚠️ ${tableName} failed:`, error.message);
        } else {
          console.log(`✅ Successfully created ${tableName} with password column!`);
          
          // Now migrate all existing faculty data
          console.log('🔄 Migrating existing faculty data...');
          
          const { data: existingFaculty, error: fetchError } = await supabase
            .from('faculty')
            .select('*');
          
          if (fetchError) {
            console.error('❌ Error fetching existing faculty:', fetchError);
            return;
          }
          
          let successCount = 0;
          for (const faculty of existingFaculty) {
            const facultyWithPassword = {
              ...faculty,
              password: 'password123'
            };
            
            const { error: migrateError } = await supabase
              .from(tableName)
              .insert(facultyWithPassword);
            
            if (migrateError) {
              console.log(`⚠️ Failed to migrate ${faculty.id}:`, migrateError.message);
            } else {
              successCount++;
            }
          }
          
          console.log(`✅ Successfully migrated ${successCount} faculty members to ${tableName}`);
          
          // Clean up test record
          await supabase
            .from(tableName)
            .delete()
            .eq('id', 'FORCE_CREATE_TEST');
          
          console.log('🎉 New table created successfully with password column!');
          console.log(`📋 Use table: ${tableName}`);
          console.log('⚠️ You may need to update your backend to use this new table');
          return;
        }
        
      } catch (tableError) {
        console.log(`⚠️ Error with ${tableName}:`, tableError.message);
      }
    }
    
    console.log('❌ All table creation attempts failed');
    console.log('📝 This confirms that client-side code cannot create database columns');
    console.log('📝 You MUST add the password column manually in Supabase dashboard');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

forceCreateTable();
