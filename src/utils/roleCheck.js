import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yfcukflinfinmjvllwin.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY3VrZmxpbmZpbm1qdmxsd2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjYzNzIsImV4cCI6MjA2OTk0MjM3Mn0.JtFF_xnwjHtb8WnzbWxAJS5gNyv0u_WI7NgPBGoDJE4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Check if the current user is Head of Department by querying the database
 * @param {string} facultyId - The faculty ID to check
 * @returns {Promise<boolean>} - True if user is Head of Department, false otherwise
 */
export async function checkIsHeadOfDepartment(facultyId) {
  try {
    if (!facultyId) {
      console.log('❌ No faculty ID provided for role check');
      return false;
    }

    console.log('🔍 Checking designation for faculty ID:', facultyId);
    
    const { data, error } = await supabase
      .from('faculty')
      .select('designation')
      .eq('id', facultyId)
      .single();

    if (error) {
      console.error('❌ Error checking designation:', error);
      return false;
    }

    if (!data) {
      console.log('❌ No faculty found with ID:', facultyId);
      return false;
    }

    console.log('🔍 Database returned data:', data);
    console.log('🔍 Database designation:', data.designation);
    console.log('🔍 Comparing with "Head of Department"');
    
    const designation = data.designation?.toLowerCase() || '';
    console.log('🔍 Checking designation:', designation);
    
    // EXTREMELY STRICT HOD CHECK - only allow exact matches
    const isHeadOfDepartment = designation === 'head of department' || 
                               designation === 'hod' ||
                               designation === 'head of department';
    
    console.log('✅ Designation check result:', designation, 'isHeadOfDepartment:', isHeadOfDepartment);
    console.log('🔍 Exact matches checked:');
    console.log('  - "head of department":', designation === 'head of department');
    console.log('  - "hod":', designation === 'hod');
    console.log('  - Current designation:', `"${designation}"`);
    
    return isHeadOfDepartment;
  } catch (error) {
    console.error('❌ Exception checking designation:', error);
    return false;
  }
}

/**
 * Get the current logged-in faculty ID from localStorage or cookies
 * @returns {string|null} - The faculty ID or null if not found
 */
export function getCurrentFacultyId() {
  try {
    const localFaculty = localStorage.getItem('loggedInFaculty');
    const cookieFaculty = getCookie('loggedInFaculty');
    
    console.log('🔍 Getting current faculty ID:');
    console.log('  - localStorage faculty:', localFaculty);
    console.log('  - cookie faculty:', cookieFaculty);
    
    const faculty = localFaculty ? JSON.parse(localFaculty) : cookieFaculty;
    const facultyId = faculty?.id || null;
    
    console.log('  - Parsed faculty:', faculty);
    console.log('  - Faculty ID:', facultyId);
    console.log('  - Faculty designation:', faculty?.designation);
    
    return facultyId;
  } catch (error) {
    console.error('❌ Error getting current faculty ID:', error);
    return null;
  }
}

/**
 * Check if current user is Head of Department using database query
 * @returns {Promise<boolean>} - True if user is Head of Department, false otherwise
 */
export async function isCurrentUserHeadOfDepartment() {
  const facultyId = getCurrentFacultyId();
  return await checkIsHeadOfDepartment(facultyId);
}

/**
 * Test function to verify database connection and role checking
 * @param {string} facultyId - Faculty ID to test
 * @returns {Promise<void>}
 */
export async function testRoleCheck(facultyId) {
  console.log('🧪 Testing role check for faculty ID:', facultyId);
  
  try {
    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from('faculty')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return;
    }
    
    console.log('✅ Database connection successful');
    
    // Test specific faculty
    const isHead = await checkIsHeadOfDepartment(facultyId);
    console.log('✅ Role check result for', facultyId, ':', isHead);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Helper function to get cookie (imported from cookies.js)
function getCookie(name) {
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop().split(';').shift();
      // URL decode the cookie value before parsing
      const decodedValue = decodeURIComponent(cookieValue);
      return JSON.parse(decodedValue);
    }
    return null;
  } catch (error) {
    console.error('❌ Error parsing cookie:', error);
    return null;
  }
}
