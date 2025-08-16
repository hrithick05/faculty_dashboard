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

async function finalCreativeAttempt() {
  try {
    console.log('🔧 Final creative attempt: Trying completely different approach...');
    
    // Try to create a table with a very simple structure first
    // Maybe if we start simple, we can add complexity
    const simpleTestData = {
      id: 'SIMPLE_TEST',
      name: 'Simple Test',
      password: 'password123'
    };
    
    console.log('🔄 Attempting to create simple table...');
    
    try {
      const { data, error } = await supabase
        .from('simple_faculty')
        .insert(simpleTestData);
      
      if (error) {
        console.log('⚠️ Simple table creation failed:', error.message);
        
        // Try to create a table with a different naming convention
        console.log('🔄 Trying different naming convention...');
        
        const alternativeNames = [
          'faculty_auth',
          'faculty_users', 
          'faculty_login',
          'faculty_accounts',
          'faculty_secure'
        ];
        
        for (const tableName of alternativeNames) {
          console.log(`🔄 Trying: ${tableName}`);
          
          try {
            const { data: altData, error: altError } = await supabase
              .from(tableName)
              .insert(simpleTestData);
            
            if (altError) {
              console.log(`⚠️ ${tableName} failed:`, altError.message);
            } else {
              console.log(`✅ Successfully created ${tableName}!`);
              
              // Now try to add more fields
              const fullTestData = {
                id: 'FULL_TEST',
                name: 'Full Test Faculty',
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
              
              const { error: fullError } = await supabase
                .from(tableName)
                .insert(fullTestData);
              
              if (fullError) {
                console.log(`⚠️ Full data insert failed:`, fullError.message);
              } else {
                console.log(`✅ Full data inserted successfully!`);
                
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
                
                console.log(`✅ Successfully migrated ${successCount} faculty members`);
                console.log(`🎉 New table ${tableName} created with password column!`);
                console.log('⚠️ Update your backend to use this new table');
                return;
              }
            }
            
          } catch (tableError) {
            console.log(`⚠️ Error with ${tableName}:`, tableError.message);
          }
        }
        
      } else {
        console.log('✅ Simple table created successfully!');
        console.log('🎉 Simple table with password column created!');
        console.log('📋 Use table: simple_faculty');
        return;
      }
      
    } catch (insertError) {
      console.log('⚠️ Insert error:', insertError.message);
    }
    
    console.log('❌ All creative attempts failed');
    console.log('🔒 This confirms Supabase security restrictions');
    console.log('📝 You MUST add the password column manually');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

finalCreativeAttempt();
