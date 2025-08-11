import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LogIn, User, IdCard } from "lucide-react";

import { setCookie } from '../utils/cookies';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yfcukflinfinmjvllwin.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY3VrZmxpbmZpbm1qdmxsd2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjYzNzIsImV4cCI6MjA2OTk0MjM3Mn0.JtFF_xnwjHtb8WnzbWxAJS5gNyv0u_WI7NgPBGoDJE4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LoginForm = () => {
  const [name, setName] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const navigate = useNavigate();

  // Load faculty data on component mount
  useEffect(() => {
    const loadFacultyData = async () => {
      try {
        console.log('🔍 Loading faculty data from Supabase...');
        const { data, error } = await supabase
          .from('faculty')
          .select('*')
          .neq('id', 'TARGET') // Exclude TARGET
          .order('name');

        if (error) {
          console.error('❌ Error loading faculty data:', error);
          return;
        }

        console.log('✅ Faculty data loaded:', data);
        setFacultyList(data || []);
      } catch (error) {
        console.error('❌ Exception loading faculty data:', error);
      }
    };
    loadFacultyData();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔍 Attempting login with:', { name, facultyId });
      
      // Fetch faculty data from Supabase
      const { data: facultyData, error } = await supabase
        .from('faculty')
        .select('*')
        .neq('id', 'TARGET');

      if (error) {
        console.error('❌ Error fetching faculty data:', error);
        setError('Failed to connect to database. Please try again.');
        return;
      }

      console.log('✅ Fetched faculty data:', facultyData);
      console.log('Number of faculty records:', facultyData.length);
      
      // Log all faculty names and IDs for debugging
      console.log('All faculty in database:');
      facultyData.forEach(f => {
        console.log(`- Name: "${f.name}", ID: "${f.id}", Designation: "${f.designation}"`);
      });
      
      // Exact matching for name and ID (case-insensitive)
      const faculty = facultyData.find(f => {
        const nameMatch = f.name.toLowerCase() === name.toLowerCase();
        const idMatch = f.id.toLowerCase() === facultyId.toLowerCase();
        return nameMatch && idMatch;
      });

      console.log('Found faculty:', faculty);
      console.log('Search criteria:', { 
        searchName: name.toLowerCase(), 
        searchId: facultyId.toLowerCase() 
      });

      if (faculty) {
        // Store login info
        const loginInfo = {
          ...faculty,
          loginTime: new Date().toISOString(),
          rememberMe
        };

        // Store in localStorage
        localStorage.setItem('loggedInFaculty', JSON.stringify(loginInfo));
        
        // Store in cookies if remember me is checked
        if (rememberMe) {
          setCookie('loggedInFaculty', loginInfo, 30);
          setCookie('sessionInfo', { loginTime: loginInfo.loginTime, rememberMe }, 30);
        } else {
          setCookie('loggedInFaculty', loginInfo, 1);
          setCookie('sessionInfo', { loginTime: loginInfo.loginTime, rememberMe }, 1);
        }

        console.log('Login successful, navigating to dashboard');
        navigate('/dashboard');
      } else {
        console.log('No matching faculty found');
        setError('Invalid faculty name or ID. Please check your credentials and try again.');
        
        // Show available faculty for debugging
        console.log('Available faculty:', facultyData.map(f => ({ name: f.name, id: f.id })));
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to connect to database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4">
      <Card className="w-full max-w-md shadow-xl border border-purple-200 dark:border-purple-700">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full w-16 h-16 flex items-center justify-center">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Faculty Login</CardTitle>
          <p className="text-purple-700 dark:text-purple-300">Enter your credentials to access the dashboard</p>
          <div className="text-xs text-muted-foreground mt-2">
            <p><strong>Test Accounts:</strong></p>
            <p>Head of Department: Dr. G.Vinoth Chakaravarthy (CSE001)</p>
            <p>Associate Professor: Dr.A.M.Rajeshwari (CSE002)</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <User className="w-4 h-4" />
                Faculty Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border-2 border-purple-200 focus:border-purple-500 dark:border-purple-700 dark:focus:border-purple-400"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="facultyId" className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <IdCard className="w-4 h-4" />
                Faculty ID
              </Label>
              <Input
                id="facultyId"
                type="text"
                placeholder="Enter your faculty ID"
                value={facultyId}
                onChange={(e) => setFacultyId(e.target.value)}
                required
                className="w-full border-2 border-purple-200 focus:border-purple-500 dark:border-purple-700 dark:focus:border-purple-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
              />
              <Label htmlFor="rememberMe" className="text-sm text-purple-700 dark:text-purple-300">
                Remember me for 30 days
              </Label>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200" 
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;