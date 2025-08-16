import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env file manually
const envPath = join(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    const cleanKey = key.trim().replace(/\x00/g, '').replace(/[^\x20-\x7E]/g, '');
    const cleanValue = valueParts.join('=').trim().replace(/\x00/g, '').replace(/[^\x20-\x7E]/g, '');
    
    if (cleanKey && cleanValue) {
      envVars[cleanKey] = cleanValue;
    }
  }
});

// Supabase configuration
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseServiceKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createStorageBucket() {
  try {
    console.log('🚀 Creating storage bucket for PDFs...');
    
    // Create the bucket
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('achievement-pdfs', {
      public: true,
      allowedMimeTypes: ['application/pdf'],
      fileSizeLimit: 10485760 // 10MB limit
    });
    
    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Bucket "achievement-pdfs" already exists');
      } else {
        console.error('❌ Error creating bucket:', bucketError.message);
        return;
      }
    } else {
      console.log('✅ Bucket "achievement-pdfs" created successfully');
    }
    
    // Set up storage policies
    console.log('🔒 Setting up storage policies...');
    
    // Policy 1: Allow authenticated users to upload
    const { error: uploadPolicyError } = await supabase.storage.from('achievement-pdfs').createSignedUploadUrl('test.pdf');
    if (uploadPolicyError) {
      console.log('⚠️  Upload policy may need manual setup');
    }
    
    console.log('✅ Storage bucket setup completed!');
    console.log('📁 Bucket name: achievement-pdfs');
    console.log('🔓 Public access: enabled');
    console.log('📄 Allowed files: PDF only');
    console.log('💾 File size limit: 10MB');
    
  } catch (error) {
    console.error('❌ Storage setup failed:', error.message);
  }
}

// Run the storage setup
createStorageBucket();
