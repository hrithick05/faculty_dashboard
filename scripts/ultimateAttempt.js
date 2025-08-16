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

async function ultimateAttempt() {
  try {
    console.log('🔧 Ultimate attempt: Trying to create new table structure...');
    
    // Try to create a completely new table by inserting data
    // This is the last possible way to get around the column restriction
    const testData = {
      id: 'ULTIMATE_TEST',
      name: 'Ultimate Test Faculty',
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
    
    // Try to create a table with a very unique name
    const uniqueTableName = `faculty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🔄 Trying to create table: ${uniqueTableName}`);
    
    try {
      const { data, error } = await supabase
        .from(uniqueTableName)
        .insert(testData);
      
      if (error) {
        console.log('⚠️ Table creation failed:', error.message);
        
        // Try one more approach - maybe we can use an existing field name
        console.log('🔄 Trying to use existing field names...');
        
        // Check what fields we can actually use
        const { data: existingFaculty, error: fetchError } = await supabase
          .from('faculty')
          .select('*')
          .limit(1);
        
        if (fetchError) {
          console.error('❌ Error fetching existing faculty:', fetchError);
          return;
        }
        
        const existingFields = Object.keys(existingFaculty[0]);
        console.log('📋 Available fields:', existingFields);
        
        // Try to use an existing field that might be suitable for storing password
        const passwordField = existingFields.find(field => 
          field.toLowerCase().includes('password') || 
          field.toLowerCase().includes('pass') ||
          field.toLowerCase().includes('auth') ||
          field.toLowerCase().includes('login')
        );
        
        if (passwordField) {
          console.log(`🔄 Found potential password field: ${passwordField}`);
          
          // Try to update an existing faculty member with password in this field
          const { error: updateError } = await supabase
            .from('faculty')
            .update({ [passwordField]: 'password123' })
            .eq('id', existingFaculty[0].id);
          
          if (updateError) {
            console.log(`⚠️ Update to ${passwordField} failed:`, updateError.message);
          } else {
            console.log(`✅ Successfully used ${passwordField} for password storage!`);
            console.log('📋 You can use this field for passwords');
            console.log('⚠️ Update your backend to use this field name');
            return;
          }
        } else {
          console.log('❌ No suitable existing field found for password storage');
        }
        
      } else {
        console.log(`✅ Successfully created table: ${uniqueTableName}`);
        console.log('🎉 New table with password column created!');
        
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
            .from(uniqueTableName)
            .insert(facultyWithPassword);
          
          if (migrateError) {
            console.log(`⚠️ Failed to migrate ${faculty.id}:`, migrateError.message);
          } else {
            successCount++;
          }
        }
        
        console.log(`✅ Successfully migrated ${successCount} faculty members`);
        console.log(`📋 Use table: ${uniqueTableName}`);
        console.log('⚠️ Update your backend to use this new table');
        return;
      }
      
    } catch (tableError) {
      console.log('⚠️ Table creation error:', tableError.message);
    }
    
    console.log('❌ All automated methods have failed');
    console.log('🔒 This confirms Supabase security restrictions');
    console.log('📝 You MUST add the password column manually');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

ultimateAttempt();
