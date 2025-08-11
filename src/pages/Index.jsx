import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  BookOpen, 
  Award, 
  Search, 
  Plus, 
  Eye, 
  BarChart3,
  LogOut,
  TrendingUp,
  User
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { getCookie, setCookie, deleteCookie } from '../utils/cookies';
import { achievementTypes } from '../data/mockFaculty';
import StatCard from '../components/StatCard';
import FacultyTable from '../components/FacultyTable';
import TargetTable from '../components/TargetTable';
import { useTheme } from '../contexts/ThemeContext';
import { isCurrentUserHeadOfDepartment } from '../utils/roleCheck';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yfcukflinfinmjvllwin.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY3VrZmxpbmZpbm1qdmxsd2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjYzNzIsImV4cCI6MjA2OTk0MjM3Mn0.JtFF_xnwjHtb8WnzbWxAJS5gNyv0u_WI7NgPBGoDJE4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const Index = () => {
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState('all');
  
  const [loggedInFaculty, setLoggedInFaculty] = useState(() => {
    const localFaculty = localStorage.getItem('loggedInFaculty');
    const cookieFaculty = getCookie('loggedInFaculty');
    
    if (localFaculty) {
      return JSON.parse(localFaculty);
    } else if (cookieFaculty) {
      // Restore to localStorage if we have cookie data
      localStorage.setItem('loggedInFaculty', JSON.stringify(cookieFaculty));
      return cookieFaculty;
    }
    return null;
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Update last activity timestamp
  useEffect(() => {
    if (loggedInFaculty) {
      setCookie('lastActivity', new Date().toISOString(), 7);
    }
  }, [loggedInFaculty]);

  // Function to load faculty data
  const loadFacultyData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching faculty data from Supabase...');
      
      const { data, error } = await supabase
        .from('faculty')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Error fetching faculty data:', error);
        toast({
          title: "Error",
          description: "Failed to load faculty data. Please try again.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Faculty data loaded:', data);
      setFacultyData(data || []);
    } catch (error) {
      console.error('❌ Exception loading faculty data:', error);
      toast({
        title: "Error",
        description: "Failed to load faculty data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch faculty data from Supabase
  useEffect(() => {
    loadFacultyData();
  }, []);

  // Separate target row from faculty data
  const targetRow = facultyData.find(f => f.id === 'TARGET');
  const nonTargetFaculty = facultyData.filter(f => f.id !== 'TARGET');

  // Filter faculty based on search and department
  const filteredFaculty = nonTargetFaculty.filter(faculty => {
    const matchesSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faculty.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || faculty.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments
  const departments = [...new Set(nonTargetFaculty.map(f => f.department))];

  // Calculate summary statistics
  const totalFaculty = facultyData.length;
  const totalPublications = facultyData.reduce((sum, faculty) => 
    sum + (faculty.journalpublications || 0) + (faculty.bookpublications || 0), 0);
  const totalPatents = facultyData.reduce((sum, faculty) => sum + (faculty.patents || 0), 0);
  const totalProjects = facultyData.reduce((sum, faculty) => sum + (faculty.studentprojects || 0), 0);

  // Handle faculty edit
  const handleEditFaculty = (faculty) => {
    // Navigate to faculty detail view for editing
    navigate('/details', { state: { faculty } });
  };

  // Handle view faculty details
  const handleViewDetails = (faculty) => {
    navigate('/details', { state: { faculty } });
  };

  // Handle add faculty
  const handleAddFaculty = async () => {
    console.log('🔍 handleAddFaculty called');
    console.log('🔍 Current logged in faculty:', loggedInFaculty);
    
    try {
      console.log('🔍 Checking user role...');
      const isHead = await isCurrentUserHeadOfDepartment();
      console.log('🔍 Is Head of Department:', isHead);
      
      if (isHead) {
        console.log('🔍 Navigating to /add-faculty');
        navigate('/add-faculty');
      } else {
        console.log('🔍 Access denied - not Head of Department');
        console.log('🔍 Current user ID:', loggedInFaculty?.id);
        console.log('🔍 Current user designation:', loggedInFaculty?.designation);
        toast({
          title: "Access Denied",
          description: "Only Head of Department can add new faculty members.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Error checking user role:', error);
      toast({
        title: "Error",
        description: "Failed to verify permissions. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('loggedInFaculty');
    deleteCookie('loggedInFaculty');
    deleteCookie('loginTimestamp');
    deleteCookie('sessionInfo');
    deleteCookie('lastActivity');
    setLoggedInFaculty(null);
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with enhanced styling */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
              🎓 Faculty Dashboard
            </h1>
            <p className="text-purple-700 dark:text-purple-300 text-base sm:text-lg">Welcome back, {loggedInFaculty?.name || 'User'}!</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/details')}
              className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 shadow-lg transform hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
            >
              <User className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">View My Details</span>
              <span className="sm:hidden">Details</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/top-performer')}
              className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600 shadow-lg transform hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
            >
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Top Performers</span>
              <span className="sm:hidden">Top</span>
            </Button>

            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 hover:from-red-600 hover:to-pink-600 shadow-lg transform hover:scale-105 transition-all duration-200 text-xs sm:text-sm"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Out</span>
            </Button>
          </div>
        </div>

        {/* Statistics Cards with enhanced styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Total Faculty"
            value={totalFaculty}
            icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
            className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl transform hover:scale-105 transition-all duration-200"
          />
          <StatCard
            title="Total Publications"
            value={totalPublications}
            icon={<BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />}
            className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-xl transform hover:scale-105 transition-all duration-200"
          />
          <StatCard
            title="Total Patents"
            value={totalPatents}
            icon={<Award className="w-5 h-5 sm:w-6 sm:h-6" />}
            className="bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-xl transform hover:scale-105 transition-all duration-200"
          />
        </div>

        {/* Search and Filters with enhanced styling */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl mb-6 sm:mb-8 border border-purple-200 dark:border-purple-700">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-4 h-4" />
              <Input
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-purple-200 focus:border-purple-500 dark:border-purple-700 dark:focus:border-purple-400"
              />
            </div>
            
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full sm:w-48 border-2 border-purple-200 focus:border-purple-500 dark:border-purple-700 dark:focus:border-purple-400">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedAchievement} onValueChange={setSelectedAchievement}>
              <SelectTrigger className="w-full sm:w-48 border-2 border-purple-200 focus:border-purple-500 dark:border-purple-700 dark:focus:border-purple-400">
                <SelectValue placeholder="Filter by achievement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Achievements</SelectItem>
                {achievementTypes.map(type => (
                  <SelectItem key={type.key} value={type.key}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Target Table with enhanced styling */}
        {targetRow && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-4 flex items-center justify-center gap-2">
              <span className="text-3xl">🎯</span>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Department Targets</span>
            </h2>
            <TargetTable target={targetRow} />
          </div>
        )}

        {/* Faculty Table with enhanced styling */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-200 dark:border-purple-700">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              👥 Faculty Achievement Overview
            </h2>
            <FacultyTable
              facultyData={filteredFaculty}
              onEditFaculty={handleEditFaculty}
              onViewDetails={handleViewDetails}
              onAddFaculty={handleAddFaculty}
              onRemoveFaculty={loadFacultyData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;