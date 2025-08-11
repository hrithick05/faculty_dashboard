import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Save, AlertTriangle, User, Building, GraduationCap, BookOpen, Award, Briefcase, Users } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { isCurrentUserHeadOfDepartment } from '../utils/roleCheck';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yfcukflinfinmjvllwin.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY3VrZmxpbmZpbm1qdmxsd2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjYzNzIsImV4cCI6MjA2OTk0MjM3Mn0.JtFF_xnwjHtb8WnzbWxAJS5gNyv0u_WI7NgPBGoDJE4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const AddFaculty = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isHeadOfDepartment, setIsHeadOfDepartment] = useState(false);
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: '',
    rdProposalsSangsation: 0,
    rdProposalsSubmition: 0,
    rdProposals: 0,
    rdFunding: 0,
    journalPublications: 0,
    journalsCoAuthor: 0,
    studentPublications: 0,
    bookPublications: 0,
    patents: 0,
    onlineCertifications: 0,
    studentProjects: 0,
    fdpWorks: 0,
    fdpWorps: 0,
    industryCollabs: 0,
    otherActivities: 0,
    academicPassPercentage: '90%',
    effectiveMentoring: 'Yes'
  });

  // Check user's role from database
  useEffect(() => {
    async function checkUserRole() {
      try {
        setIsLoadingRole(true);
        const isHead = await isCurrentUserHeadOfDepartment();
        setIsHeadOfDepartment(isHead);
        
        if (!isHead) {
          toast({
            title: "Access Denied",
            description: "You do not have permission to add faculty. Only Head of Department can add faculty.",
            variant: "destructive"
          });
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsHeadOfDepartment(false);
        toast({
          title: "Error",
          description: "Failed to verify permissions. Please try again.",
          variant: "destructive"
        });
        navigate('/dashboard');
      } finally {
        setIsLoadingRole(false);
      }
    }

    checkUserRole();
  }, [navigate, toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('rdProposals') || name.includes('rdFunding') || name.includes('journal') || 
              name.includes('student') || name.includes('book') || name.includes('patents') || 
              name.includes('online') || name.includes('fdp') || name.includes('industry') || 
              name.includes('other') ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Double-check user permissions before submitting
      const isHead = await isCurrentUserHeadOfDepartment();
      if (!isHead) {
        toast({
          title: "Access Denied",
          description: "You do not have permission to add faculty. Only Head of Department can add faculty.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Validate required fields
      if (!formData.name || !formData.designation || !formData.department) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields (Name, Designation, Department).",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Create new faculty object with unique ID - using correct database column names
      const newFaculty = {
        id: `FAC${Date.now()}`, // Generate unique ID based on timestamp
        name: formData.name,
        designation: formData.designation,
        department: formData.department,
        rdproposalssangsation: formData.rdProposalsSangsation,
        rdproposalssubmition: formData.rdProposalsSubmition,
        rdproposals: formData.rdProposalsSangsation + formData.rdProposalsSubmition, // Calculate total
        rdfunding: formData.rdFunding,
        journalpublications: formData.journalPublications,
        journalscoauthor: formData.journalsCoAuthor,
        studentpublications: formData.studentPublications,
        bookpublications: formData.bookPublications,
        patents: formData.patents,
        onlinecertifications: formData.onlineCertifications,
        studentprojects: formData.studentProjects,
        fdpworks: formData.fdpWorks,
        fdpworps: formData.fdpWorps,
        industrycollabs: formData.industryCollabs,
        otheractivities: formData.otherActivities,
        academicpasspercentage: formData.academicPassPercentage,
        effectivementoring: formData.effectiveMentoring
      };

      console.log('🔍 Attempting to insert faculty:', newFaculty);
      
      // Insert into Supabase database
      const { data, error } = await supabase
        .from('faculty')
        .insert([newFaculty]);

      if (error) {
        console.error('❌ Error inserting faculty:', error);
        console.error('❌ Error details:', error.message);
        console.error('❌ Error code:', error.code);
        toast({
          title: "Error",
          description: `Failed to add faculty member: ${error.message}`,
          variant: "destructive"
        });
      } else {
        setSuccess(true);
        toast({
          title: "Success",
          description: "Faculty added successfully!",
        });
        
        // Reset form to initial values
        setFormData({
          name: '',
          designation: '',
          department: '',
          rdProposalsSangsation: 0,
          rdProposalsSubmition: 0,
          rdProposals: 0,
          rdFunding: 0,
          journalPublications: 0,
          journalsCoAuthor: 0,
          studentPublications: 0,
          bookPublications: 0,
          patents: 0,
          onlineCertifications: 0,
          studentProjects: 0,
          fdpWorks: 0,
          fdpWorps: 0,
          industryCollabs: 0,
          otherActivities: 0,
          academicPassPercentage: '90%',
          effectiveMentoring: 'Yes'
        });
        
        // Navigate back to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
    } catch (error) {
      console.error('Error adding faculty:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking role
  if (isLoadingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Show access denied if user is not Head of Department
  if (!isHeadOfDepartment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8 text-lg">
            You do not have permission to add faculty. Only Head of Department can add faculty.
          </p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded-lg px-3 py-2 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Add New Faculty Member
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Create a new faculty profile with comprehensive details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
                  Faculty Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                  {/* Basic Information */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Basic Information</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter full name"
                          required
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-3 py-2 sm:px-4 sm:py-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="designation" className="text-sm font-medium text-gray-700">Designation *</Label>
                        <Input
                          id="designation"
                          name="designation"
                          value={formData.designation}
                          onChange={handleChange}
                          placeholder="e.g., Assistant Professor"
                          required
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-3 py-2 sm:px-4 sm:py-3"
                        />
                      </div>
                      <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                        <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department *</Label>
                        <Input
                          id="department"
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          placeholder="e.g., Computer Science"
                          required
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-3 py-2 sm:px-4 sm:py-3"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Research & Development */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <GraduationCap className="w-6 h-6 text-green-600" />
                      <h3 className="text-xl font-semibold text-gray-800">Research & Development</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="rdProposalsSangsation" className="text-sm font-medium text-gray-700">R&D Proposals (Sangsation)</Label>
                        <Input
                          id="rdProposalsSangsation"
                          name="rdProposalsSangsation"
                          type="number"
                          min="0"
                          value={formData.rdProposalsSangsation}
                          onChange={handleChange}
                          placeholder="0"
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rdProposalsSubmition" className="text-sm font-medium text-gray-700">R&D Proposals (Submition)</Label>
                        <Input
                          id="rdProposalsSubmition"
                          name="rdProposalsSubmition"
                          type="number"
                          min="0"
                          value={formData.rdProposalsSubmition}
                          onChange={handleChange}
                          placeholder="0"
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rdFunding" className="text-sm font-medium text-gray-700">R&D Funding</Label>
                        <Input
                          id="rdFunding"
                          name="rdFunding"
                          type="number"
                          min="0"
                          value={formData.rdFunding}
                          onChange={handleChange}
                          placeholder="0"
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Publications */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                      <h3 className="text-xl font-semibold text-gray-800">Publications</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="journalPublications" className="text-sm font-medium text-gray-700">Journal Publications</Label>
                        <Input
                          id="journalPublications"
                          name="journalPublications"
                          type="number"
                          min="0"
                          value={formData.journalPublications}
                          onChange={handleChange}
                          placeholder="0"
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="journalsCoAuthor" className="text-sm font-medium text-gray-700">Co-Author Journals</Label>
                        <Input
                          id="journalsCoAuthor"
                          name="journalsCoAuthor"
                          type="number"
                          min="0"
                          value={formData.journalsCoAuthor}
                          onChange={handleChange}
                          placeholder="0"
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentPublications" className="text-sm font-medium text-gray-700">Student Publications</Label>
                        <Input
                          id="studentPublications"
                          name="studentPublications"
                          type="number"
                          min="0"
                          value={formData.studentPublications}
                          onChange={handleChange}
                          placeholder="0"
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bookPublications" className="text-sm font-medium text-gray-700">Book Publications</Label>
                        <Input
                          id="bookPublications"
                          name="bookPublications"
                          type="number"
                          min="0"
                          value={formData.bookPublications}
                          onChange={handleChange}
                          placeholder="0"
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Innovation & Projects */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Award className="w-6 h-6 text-yellow-600" />
                      <h3 className="text-xl font-semibold text-gray-800">Innovation & Projects</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="patents" className="text-sm font-medium text-gray-700">Patents</Label>
                        <Input
                          id="patents"
                          name="patents"
                          type="number"
                          min="0"
                          value={formData.patents}
                          onChange={handleChange}
                          placeholder="0"
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="onlineCertifications" className="text-sm font-medium text-gray-700">Online Certifications</Label>
                        <Input
                          id="onlineCertifications"
                          name="onlineCertifications"
                          type="number"
                          min="0"
                          value={formData.onlineCertifications}
                          onChange={handleChange}
                          placeholder="0"
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentProjects" className="text-sm font-medium text-gray-700">Student Projects</Label>
                        <Input
                          id="studentProjects"
                          name="studentProjects"
                          type="number"
                          min="0"
                          value={formData.studentProjects}
                          onChange={handleChange}
                          placeholder="0"
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industryCollabs" className="text-sm font-medium text-gray-700">Industry Collaborations</Label>
                        <Input
                          id="industryCollabs"
                          name="industryCollabs"
                          type="number"
                          min="0"
                          value={formData.industryCollabs}
                          onChange={handleChange}
                          placeholder="0"
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Professional Development */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Briefcase className="w-6 h-6 text-indigo-600" />
                      <h3 className="text-xl font-semibold text-gray-800">Professional Development</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fdpWorks" className="text-sm font-medium text-gray-700">FDP Works</Label>
                        <Input
                          id="fdpWorks"
                          name="fdpWorks"
                          type="number"
                          min="0"
                          value={formData.fdpWorks}
                          onChange={handleChange}
                          placeholder="0"
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fdpWorps" className="text-sm font-medium text-gray-700">FDP Workshops</Label>
                        <Input
                          id="fdpWorps"
                          name="fdpWorps"
                          type="number"
                          min="0"
                          value={formData.fdpWorps}
                          onChange={handleChange}
                          placeholder="0"
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="otherActivities" className="text-sm font-medium text-gray-700">Other Activities</Label>
                        <Input
                          id="otherActivities"
                          name="otherActivities"
                          type="number"
                          min="0"
                          value={formData.otherActivities}
                          onChange={handleChange}
                          placeholder="0"
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Academic Metrics */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <Users className="w-6 h-6 text-teal-600" />
                      <h3 className="text-xl font-semibold text-gray-800">Academic Metrics</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="academicPassPercentage" className="text-sm font-medium text-gray-700">Academic Pass %</Label>
                        <Input
                          id="academicPassPercentage"
                          name="academicPassPercentage"
                          value={formData.academicPassPercentage}
                          onChange={handleChange}
                          placeholder="90%"
                          className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="effectiveMentoring" className="text-sm font-medium text-gray-700">Effective Mentoring</Label>
                        <Select 
                          value={formData.effectiveMentoring} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, effectiveMentoring: value }))}
                        >
                          <SelectTrigger className="border-2 border-gray-200 focus:border-blue-500 rounded-lg px-4 py-3">
                            <SelectValue placeholder="Select mentoring status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      className="px-8 py-3 text-gray-600 border-gray-300 hover:bg-gray-50 rounded-lg font-medium"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Adding Faculty...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          Add Faculty
                        </div>
                      )}
                    </Button>
                  </div>
                </form>

                {/* Success Message */}
                {success && (
                  <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <Plus className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-green-800 font-medium">Faculty added successfully!</p>
                        <p className="text-green-600 text-sm">Redirecting to dashboard...</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="text-lg">Form Progress</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Basic Info</span>
                    <span className={`text-sm font-medium ${formData.name && formData.designation && formData.department ? 'text-green-600' : 'text-gray-400'}`}>
                      {formData.name && formData.designation && formData.department ? '✓' : '○'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">R&D Data</span>
                    <span className="text-sm font-medium text-blue-600">○</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Publications</span>
                    <span className="text-sm font-medium text-blue-600">○</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Projects</span>
                    <span className="text-sm font-medium text-blue-600">○</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                <CardTitle className="text-lg">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p>All numeric fields default to 0</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p>Academic Pass % defaults to 90%</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p>R&D Proposals total is calculated automatically</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <p>Only required fields are marked with *</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFaculty;
