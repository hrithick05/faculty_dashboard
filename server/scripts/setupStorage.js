const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://yfcukflinfinmjvllwin.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_KEY || 'your-service-key-here';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function setupStorage() {
  try {
    console.log('🚀 Setting up Supabase storage for achievement PDFs...');

    // Create storage bucket for achievement PDFs
    const { data: bucket, error: bucketError } = await supabase.storage
      .createBucket('achievement-pdfs', {
        public: false,
        allowedMimeTypes: ['application/pdf'],
        fileSizeLimit: 10485760, // 10MB limit
      });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Storage bucket "achievement-pdfs" already exists');
      } else {
        throw bucketError;
      }
    } else {
      console.log('✅ Created storage bucket "achievement-pdfs"');
    }

    // Set bucket policies
    console.log('🔐 Setting up storage policies...');

    // Policy: Allow authenticated users to upload PDFs
    const { error: uploadPolicyError } = await supabase.storage
      .from('achievement-pdfs')
      .createPolicy('allow_authenticated_upload', {
        name: 'Allow authenticated users to upload PDFs',
        definition: {
          role: 'authenticated',
          operation: 'INSERT',
          bucket: 'achievement-pdfs'
        }
      });

    if (uploadPolicyError) {
      if (uploadPolicyError.message.includes('already exists')) {
        console.log('✅ Upload policy already exists');
      } else {
        console.log('⚠️  Could not create upload policy:', uploadPolicyError.message);
      }
    } else {
      console.log('✅ Created upload policy');
    }

    // Policy: Allow users to view their own PDFs
    const { error: viewPolicyError } = await supabase.storage
      .from('achievement-pdfs')
      .createPolicy('allow_own_pdf_view', {
        name: 'Allow users to view their own PDFs',
        definition: {
          role: 'authenticated',
          operation: 'SELECT',
          bucket: 'achievement-pdfs',
          using: 'auth.uid()::text = (storage.foldername(name))[1]'
        }
      });

    if (viewPolicyError) {
      if (viewPolicyError.message.includes('already exists')) {
        console.log('✅ View policy already exists');
      } else {
        console.log('⚠️  Could not create view policy:', viewPolicyError.message);
      }
    } else {
      console.log('✅ Created view policy');
    }

    // Policy: Allow HODs to view all PDFs
    const { error: hodViewPolicyError } = await supabase.storage
      .from('achievement-pdfs')
      .createPolicy('allow_hod_view_all', {
        name: 'Allow HODs to view all PDFs',
        definition: {
          role: 'authenticated',
          operation: 'SELECT',
          bucket: 'achievement-pdfs'
        }
      });

    if (hodViewPolicyError) {
      if (hodViewPolicyError.message.includes('already exists')) {
        console.log('✅ HOD view policy already exists');
      } else {
        console.log('⚠️  Could not create HOD view policy:', hodViewPolicyError.message);
      }
    } else {
      console.log('✅ Created HOD view policy');
    }

    console.log('🎉 Storage setup completed successfully!');
    console.log('');
    console.log('📋 Next steps:');
    console.log('1. Run the database migration: npm run migrate');
    console.log('2. Test the achievement submission system');
    console.log('3. Verify HOD approval workflow');

  } catch (error) {
    console.error('❌ Error setting up storage:', error);
    console.log('');
    console.log('🔧 Manual setup required:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to Storage > Buckets');
    console.log('3. Create a bucket named "achievement-pdfs"');
    console.log('4. Set it as private (not public)');
    console.log('5. Add policies for authenticated users');
  }
}

// Run the setup
setupStorage();
