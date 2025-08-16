import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { LogIn, User, IdCard, KeyRound } from "lucide-react";

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

  // Optional: preload list (kept for debug/consistency with existing code)
  const [facultyList, setFacultyList] = useState([]);

  // New states for two-step flow
  const [verified, setVerified] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [wantsChange, setWantsChange] = useState(false);
  const [newFacultyId, setNewFacultyId] = useState('');
  const [confirmNewFacultyId, setConfirmNewFacultyId] = useState('');

  const navigate = useNavigate();

  // Load faculty data on component mount (debug/support)
  useEffect(() => {
    const loadFacultyData = async () => {
      try {
        const { data, error } = await supabase
          .from('faculty')
          .select('*')
          .neq('id', 'TARGET')
          .order('name');

        if (error) {
          console.error('Error loading faculty data:', error);
          return;
        }
        setFacultyList(data || []);
      } catch (error) {
        console.error('Exception loading faculty data:', error);
      }
    };
    loadFacultyData();
  }, []);

  const finalizeLogin = (faculty) => {
    const loginInfo = {
      ...faculty,
      loginTime: new Date().toISOString(),
      rememberMe,
    };

    localStorage.setItem('loggedInFaculty', JSON.stringify(loginInfo));
    if (rememberMe) {
      setCookie('loggedInFaculty', loginInfo, 30);
      setCookie('sessionInfo', { loginTime: loginInfo.loginTime, rememberMe }, 30);
    } else {
      setCookie('loggedInFaculty', loginInfo, 1);
      setCookie('sessionInfo', { loginTime: loginInfo.loginTime, rememberMe }, 1);
    }

    navigate('/dashboard');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Step 1: verify credentials if not verified yet
    if (!verified) {
      setLoading(true);
      try {
        const { data: facultyData, error } = await supabase
          .from('faculty')
          .select('*')
          .neq('id', 'TARGET');

        if (error) {
          console.error('Error fetching faculty data:', error);
          setError('Failed to connect to database. Please try again.');
          return;
        }

        const faculty = (facultyData || []).find((f) => {
          const nameMatch = (f.name || '').toLowerCase() === name.toLowerCase();
          const idMatch = (f.id || '').toLowerCase() === facultyId.toLowerCase();
          return nameMatch && idMatch;
        });

        if (!faculty) {
          setError('Invalid faculty name or ID. Please check your credentials and try again.');
          return;
        }

        // Verified successfully
        setVerified(true);
        setSelectedFaculty(faculty);

        // If user does not want to change ID, finish login immediately
        if (!wantsChange) {
          finalizeLogin(faculty);
        }
      } catch (err) {
        console.error('Login error:', err);
        setError('Failed to connect to database. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Step 2: already verified
    if (verified && selectedFaculty) {
      if (!wantsChange) {
        finalizeLogin(selectedFaculty);
        return;
      }

      // Wants to change the Faculty ID (password)
      const newId = (newFacultyId || '').trim();
      const confirmId = (confirmNewFacultyId || '').trim();

      if (!newId) {
        setError('Please enter a new Faculty ID.');
        return;
      }
      if (newId.toLowerCase() === 'target') {
        setError('This Faculty ID is reserved. Please choose a different ID.');
        return;
      }
      if (newId !== confirmId) {
        setError('New Faculty ID and confirmation do not match.');
        return;
      }

      // If the new ID equals the old one, just continue
      if (newId.toLowerCase() === selectedFaculty.id.toLowerCase()) {
        finalizeLogin(selectedFaculty);
        return;
      }

      setLoading(true);
      try {
        // Check uniqueness
        const { data: existing, error: checkErr } = await supabase
          .from('faculty')
          .select('id')
          .eq('id', newId)
          .limit(1);

        if (checkErr) {
          console.error('ID check error:', checkErr);
          setError('Unable to validate new Faculty ID. Please try again.');
          return;
        }
        if (existing && existing.length > 0) {
          setError('This Faculty ID is already in use. Please choose another.');
          return;
        }

        // Update backend ID
        const { data: updatedRows, error: updateErr } = await supabase
          .from('faculty')
          .update({ id: newId })
          .eq('id', selectedFaculty.id)
          .select('*');

        if (updateErr) {
          console.error('Update error:', updateErr);
          setError(`Failed to update Faculty ID: ${updateErr.message}`);
          return;
        }

        const updatedFaculty = { ...selectedFaculty, id: newId };
        setSelectedFaculty(updatedFaculty);
        setFacultyId(newId);

        finalizeLogin(updatedFaculty);
      } catch (err) {
        console.error('Unexpected update error:', err);
        setError('Unexpected error while updating Faculty ID. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
              <p className="text-gray-600 mt-2">Sign in to your faculty dashboard</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {!verified ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Full Name
                    </div>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 px-4 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-base"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facultyId" className="text-sm font-medium text-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <IdCard className="w-4 h-4 text-purple-600" />
                      Faculty ID
                    </div>
                  </Label>
                  <Input
                    id="facultyId"
                    type="text"
                    placeholder="Enter your faculty ID"
                    value={facultyId}
                    onChange={(e) => setFacultyId(e.target.value)}
                    className="h-12 px-4 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-base"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    className="rounded"
                  />
                  <Label htmlFor="rememberMe" className="text-sm text-gray-600">
                    Remember me for 30 days
                  </Label>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4" />
                      Sign In
                    </div>
                  )}
                </Button>
              </form>
            ) : (
              <div className="space-y-5">
                {/* Faculty Selection */}
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome, {selectedFaculty?.name}!</h3>
                  <p className="text-gray-600 text-sm">Faculty ID: {selectedFaculty?.id}</p>
                  <p className="text-gray-600 text-sm">{selectedFaculty?.designation} • {selectedFaculty?.department}</p>
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => finalizeLogin(selectedFaculty)}
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Continue to Dashboard
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      setVerified(false);
                      setSelectedFaculty(null);
                      setError('');
                    }}
                    className="w-full h-12 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
                  >
                    Sign in as Different User
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
