import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Load .env file from the project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');
config({ path: resolve(__dirname, '../.env') });

// Script to insert mockFacultyData into Supabase
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Debug: Check environment variables
console.log('Environment variables check:');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

// Set your Supabase project URL and service role key here
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yfcukflinfinmjvllwin.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sbp_9673d8f4878607ed7472370a913f478a3fababdf';

console.log('Using SUPABASE_URL:', SUPABASE_URL);
console.log('Using SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const facultyJson = fs.readFileSync(new URL('../src/data/mockFaculty.json', import.meta.url), 'utf-8');
const mockFacultyData = JSON.parse(facultyJson);

async function seedFacultyData() {
  console.log('Starting to seed faculty data...');
  
  // First, let's test the connection
  try {
    const { data, error } = await supabase.from('faculty').select('count').limit(1);
    if (error) {
      console.error('Connection test failed:', error);
      return;
    }
    console.log('Connection successful!');
  } catch (err) {
    console.error('Connection error:', err);
    return;
  }

  for (const faculty of mockFacultyData) {
    try {
      const { data, error } = await supabase.from('faculty').upsert(faculty);
      if (error) {
        console.error(`Error inserting faculty ${faculty.id}:`, error.message);
        console.error('Full error:', error);
      } else {
        console.log(`Inserted/updated faculty ${faculty.id}`);
      }
    } catch (err) {
      console.error(`Exception inserting faculty ${faculty.id}:`, err);
    }
  }
  console.log('Faculty data seeding complete.');
}

seedFacultyData();
