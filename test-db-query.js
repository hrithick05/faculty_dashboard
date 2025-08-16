import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

console.log('🔍 Environment variables check:');
console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('VITE_SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabaseQuery() {
  try {
    console.log('🔍 Testing database connection and queries...');
    
    // 1. Test basic connection
    console.log('\n1️⃣ Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('achievement_submissions')
      .select('count(*)', { count: 'exact', head: true });
    
    if (testError) {
      console.error('❌ Connection test failed:', testError);
      return;
    }
    
    console.log('✅ Connection successful');
    
    // 2. Check table structure
    console.log('\n2️⃣ Checking table structure...');
    const { data: structureData, error: structureError } = await supabase
      .from('achievement_submissions')
      .select('*')
      .limit(1);
    
    if (structureError) {
      console.error('❌ Structure check failed:', structureError);
      return;
    }
    
    if (structureData && structureData.length > 0) {
      console.log('✅ Table structure:', Object.keys(structureData[0]));
    } else {
      console.log('ℹ️ Table exists but has no data');
    }
    
    // 3. Count total records
    console.log('\n3️⃣ Counting total records...');
    const { count, error: countError } = await supabase
      .from('achievement_submissions')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Count failed:', countError);
      return;
    }
    
    console.log(`📊 Total records in table: ${count}`);
    
    // 4. Get all records
    console.log('\n4️⃣ Fetching all records...');
    const { data: allData, error: allError } = await supabase
      .from('achievement_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (allError) {
      console.error('❌ Fetch all failed:', allError);
      return;
    }
    
    console.log(`✅ Successfully fetched ${allData?.length || 0} records`);
    
    // 5. Show sample data
    if (allData && allData.length > 0) {
      console.log('\n5️⃣ Sample record data:');
      console.log(JSON.stringify(allData[0], null, 2));
      
      // Check for specific fields
      const sample = allData[0];
      console.log('\n6️⃣ Field validation:');
      console.log('id:', sample.id ? '✅' : '❌');
      console.log('faculty_id:', sample.faculty_id ? '✅' : '❌');
      console.log('faculty_name:', sample.faculty_name ? '✅' : '❌');
      console.log('category:', sample.category ? '✅' : '❌');
      console.log('achievement_type:', sample.achievement_type ? '✅' : '❌');
      console.log('title:', sample.title ? '✅' : '❌');
      console.log('pdf_url:', sample.pdf_url ? '✅' : '❌');
      console.log('pdf_name:', sample.pdf_name ? '✅' : '❌');
      console.log('status:', sample.status ? '✅' : '❌');
      console.log('submitted_at:', sample.submitted_at ? '✅' : '❌');
    } else {
      console.log('\n5️⃣ No records found in table');
    }
    
    // 6. Test specific query (like the one in the API)
    console.log('\n7️⃣ Testing API-like query...');
    const { data: apiData, error: apiError } = await supabase
      .from('achievement_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });
    
    if (apiError) {
      console.error('❌ API-like query failed:', apiError);
      return;
    }
    
    console.log(`✅ API-like query returned ${apiData?.length || 0} records`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDatabaseQuery();
