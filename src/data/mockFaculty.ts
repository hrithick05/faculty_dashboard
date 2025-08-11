import { FacultyMember, AchievementType } from '../types/faculty';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration - load from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yfcukflinfinmjvllwin.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY3VrZmxpbmZpbm1qdmxsd2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjYzNzIsImV4cCI6MjA2OTk0MjM3Mn0.JtFF_xnwjHtb8WnzbWxAJS5gNyv0u_WI7NgPBGoDJE4';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Achievement types configuration
export const achievementTypes: AchievementType[] = [
  { key: 'rdproposalssangsation', label: 'R&D Proposals (Sangsation)', shortLabel: 'R&D Sangsation' },
  { key: 'rdproposalssubmition', label: 'R&D Proposals (Submition)', shortLabel: 'R&D Submition' },
  { key: 'rdfunding', label: 'R&D Funding', shortLabel: 'R&D Fund' },
  { key: 'journalpublications', label: 'Journal Publications', shortLabel: 'Journals' },
  { key: 'journalscoauthor', label: 'Co-Author Journals', shortLabel: 'Co-Author' },
  { key: 'studentpublications', label: 'Student Publications', shortLabel: 'Student Pub' },
  { key: 'bookpublications', label: 'Book Publications', shortLabel: 'Books' },
  { key: 'patents', label: 'Patents', shortLabel: 'Patents' },
  { key: 'onlinecertifications', label: 'Online Certifications', shortLabel: 'Certs' },
  { key: 'studentprojects', label: 'Student Projects', shortLabel: 'Projects' },
  { key: 'fdpworks', label: 'FDP Works', shortLabel: 'FDP Works' },
  { key: 'fdpworps', label: 'FDP Worps', shortLabel: 'FDP Worps' },
  { key: 'industrycollabs', label: 'Industry Collaborations', shortLabel: 'Industry' },
  { key: 'otheractivities', label: 'Other Activities', shortLabel: 'Others' }
];

// Function to fetch faculty data from Supabase
export async function fetchFacultyData(): Promise<FacultyMember[]> {
  try {
    console.log('Fetching faculty data from Supabase...');
    console.log('Supabase URL:', SUPABASE_URL);
    console.log('Supabase Anon Key:', SUPABASE_ANON_KEY.substring(0, 20) + '...');
    
    const { data, error } = await supabase.from('faculty').select('*');
    
    if (error) {
      console.error('Error fetching faculty data:', error);
      return [];
    }
    
    console.log('Faculty data fetched successfully:', data?.length, 'records');
    console.log('First record sample:', data?.[0]);
    return data || [];
  } catch (error) {
    console.error('Exception fetching faculty data:', error);
    return [];
  }
}

// Test function to verify Supabase connection
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('faculty').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test exception:', error);
    return false;
  }
}

// Function to fetch a single faculty member by ID
export async function fetchFacultyById(id: string): Promise<FacultyMember | null> {
  try {
    const { data, error } = await supabase
      .from('faculty')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching faculty by ID:', error);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Exception fetching faculty by ID:', error);
    return null;
  }
}

// Function to update faculty data
export async function updateFacultyData(faculty: FacultyMember): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('faculty')
      .upsert(faculty);
    
    if (error) {
      console.error('Error updating faculty data:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Exception updating faculty data:', error);
    return false;
  }
}

// Legacy export for backward compatibility (will be removed)
export const mockFacultyData: FacultyMember[] = [];