import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, Edit, Eye, Plus, BarChart3, Trash2, User, AlertTriangle } from "lucide-react";
import { achievementTypes } from '../data/mockFaculty';
import { getCookie } from '../utils/cookies';
import { isCurrentUserHeadOfDepartment } from '../utils/roleCheck';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yfcukflinfinmjvllwin.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY3VrZmxpbmZpbm1qdmxsd2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjYzNzIsImV4cCI6MjA2OTk0MjM3Mn0.JtFF_xnwjHtb8WnzbWxAJS5gNyv0u_WI7NgPBGoDJE4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const FacultyTable = ({ 
  facultyData, 
  onEditFaculty, 
  onViewDetails, 
  onAddFaculty,
  onRemoveFaculty
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isHeadOfDepartment, setIsHeadOfDepartment] = useState(false);
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(''); // 'complete' or 'reset'

  // Check user's role from database - STRICT HOD ONLY
  useEffect(() => {
    async function checkUserRole() {
      try {
        setIsLoadingRole(true);
        console.log('🔍 FacultyTable: Checking user role...');
        
        // ONLY use database check - no fallback to stored designation
        const isHead = await isCurrentUserHeadOfDepartment();
        console.log('🔍 FacultyTable: Database role check result:', isHead);
        
        // SECURITY: Force hide admin features unless explicitly confirmed as HOD
        if (isHead === true && typeof isHead === 'boolean') {
          console.log('✅ FacultyTable: User confirmed as HOD');
          setIsHeadOfDepartment(true);
        } else {
          console.log('❌ FacultyTable: User is NOT HOD - hiding all admin features');
          console.log('🔍 isHead value:', isHead, 'type:', typeof isHead);
          setIsHeadOfDepartment(false);
        }
      } catch (error) {
        console.error('❌ FacultyTable: Error checking user role:', error);
        // If there's an error, assume user is NOT HOD for security
        setIsHeadOfDepartment(false);
        console.log('🔒 FacultyTable: Security fallback - treating user as non-HOD');
      } finally {
        setIsLoadingRole(false);
      }
    }

    checkUserRole();
  }, []);

  // Get unique departments
  const departments = Array.from(new Set(facultyData.map(f => f.department)));

  // Filter faculty based on search and filters
  const filteredFaculty = facultyData.filter(faculty => {
    const matchesSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faculty.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || 
                             faculty.department === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  // Calculate total for a specific achievement type
  const calculateTotal = (achievementKey) => {
    if (achievementKey === 'all') return 0;
    return filteredFaculty.reduce((sum, faculty) => sum + faculty[achievementKey], 0);
  };

  // Get top performer for an achievement type
  const getTopPerformer = (achievementKey) => {
    if (achievementKey === 'all') return null;
    return filteredFaculty.reduce((top, faculty) => 
      faculty[achievementKey] > (top?.[achievementKey] || 0) ? faculty : top, null);
  };

  // Handle view individual graph
  const handleViewGraph = (faculty) => {
    navigate(`/faculty-stats/${faculty.id}`);
  };

  // Handle remove faculty - open delete dialog
  const handleRemoveFaculty = (faculty) => {
    console.log('🔒 FacultyTable: Delete button clicked for faculty:', faculty.name);
    console.log('🔒 FacultyTable: Current user isHeadOfDepartment:', isHeadOfDepartment);
    
    // STRICT HOD CHECK - no exceptions
    if (!isHeadOfDepartment || isHeadOfDepartment === false) {
      console.log('❌ FacultyTable: Access denied - User is not HOD');
      alert('Access denied. Only Head of Department can perform this action.');
      return;
    }
    
    // Additional security: check if user is still HOD in database
    isCurrentUserHeadOfDepartment().then(isStillHOD => {
      if (!isStillHOD) {
        console.log('❌ FacultyTable: Security check failed - user lost HOD status');
        alert('Security check failed. Please refresh the page and try again.');
        return;
      }
      
      console.log('✅ FacultyTable: Access granted - Opening delete dialog');
      setFacultyToDelete(faculty);
      setDeleteDialog(true);
    }).catch(error => {
      console.error('❌ FacultyTable: Security check error:', error);
      alert('Security check failed. Please refresh the page and try again.');
    });
  };

  // Handle complete faculty deletion
  const handleCompleteDelete = async () => {
    console.log('🔒 FacultyTable: Complete delete requested for faculty:', facultyToDelete?.name);
    console.log('🔒 FacultyTable: Current user isHeadOfDepartment:', isHeadOfDepartment);
    
    if (!facultyToDelete) return;
    
    // Double-check HOD status before proceeding
    if (!isHeadOfDepartment) {
      console.log('❌ FacultyTable: Access denied - User is not HOD');
      alert('Access denied. Only Head of Department can perform this action.');
      return;
    }

    try {
      const { error } = await supabase
        .from('faculty')
        .delete()
        .eq('id', facultyToDelete.id);

      if (error) {
        console.error('Error removing faculty:', error);
        alert('Failed to remove faculty. Please try again.');
      } else {
        console.log('Faculty removed successfully:', facultyToDelete.name);
        // Call the parent callback to refresh the data
        if (onRemoveFaculty) {
          onRemoveFaculty();
        }
        setDeleteDialog(false);
        setFacultyToDelete(null);
      }
    } catch (error) {
      console.error('Exception removing faculty:', error);
      alert('An error occurred while removing faculty.');
    }
  };

  // Handle reset faculty performance data
  const handleResetPerformance = async () => {
    console.log('🔒 FacultyTable: Reset performance requested for faculty:', facultyToDelete?.name);
    console.log('🔒 FacultyTable: Current user isHeadOfDepartment:', isHeadOfDepartment);
    
    if (!facultyToDelete) return;
    
    // Double-check HOD status before proceeding
    if (!isHeadOfDepartment) {
      console.log('❌ FacultyTable: Access denied - User is not HOD');
      alert('Access denied. Only Head of Department can perform this action.');
      return;
    }

    try {
      // Reset all performance metrics to zero/null
      const resetData = {
        rdproposalssangsation: 0,
        rdproposalssubmition: 0,
        rdproposals: 0,
        rdfunding: 0,
        journalpublications: 0,
        journalscoauthor: 0,
        studentpublications: 0,
        bookpublications: 0,
        patents: 0,
        onlinecertifications: 0,
        studentprojects: 0,
        fdpworks: 0,
        fdpworps: 0,
        industrycollabs: 0,
        otheractivities: 0,
        academicpasspercentage: null,
        effectivementoring: null
      };

      const { error } = await supabase
        .from('faculty')
        .update(resetData)
        .eq('id', facultyToDelete.id);

      if (error) {
        console.error('Error resetting faculty performance:', error);
        alert('Failed to reset faculty performance. Please try again.');
      } else {
        console.log('Faculty performance reset successfully:', facultyToDelete.name);
        // Call the parent callback to refresh the data
        if (onRemoveFaculty) {
          onRemoveFaculty();
        }
        setDeleteDialog(false);
        setFacultyToDelete(null);
      }
    } catch (error) {
      console.error('Exception resetting faculty performance:', error);
      alert('An error occurred while resetting faculty performance.');
    }
  };

  return (
    <>
      <Card className="w-full">
      <CardHeader className="space-y-4">
        {/* Title and Add Faculty Button */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <CardTitle className="text-xl font-bold dark:text-white">Faculty Achievement Overview</CardTitle>
          
          {/* Admin Elements - ONLY SHOW FOR HODs */}
          {isHeadOfDepartment === true && onAddFaculty && !isLoadingRole && (
            <Button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🔍 Add Faculty button clicked');
                onAddFaculty();
              }} 
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600 shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Add Faculty
            </Button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search faculty by name or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="h-12 px-4 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 min-w-[140px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedAchievement} onValueChange={setSelectedAchievement}>
              <SelectTrigger className="h-12 px-4 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 min-w-[140px]">
                <SelectValue placeholder="Achievement Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Achievements</SelectItem>
                {achievementTypes.map((type) => (
                  <SelectItem key={type.key} value={type.key}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Achievement Summary - Enhanced for Mobile */}
        {selectedAchievement !== 'all' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50 shadow-sm">
            <div className="text-center p-3 bg-white/60 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-700">
                {calculateTotal(selectedAchievement)}
              </div>
              <div className="text-sm text-blue-600 font-medium">Total</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-green-700">
                {Math.round(calculateTotal(selectedAchievement) / filteredFaculty.length)}
              </div>
              <div className="text-sm text-green-600 font-medium">Average</div>
            </div>
            <div className="text-center p-3 bg-white/60 rounded-lg backdrop-blur-sm">
              <div className="text-lg font-semibold text-purple-700 truncate">
                {getTopPerformer(selectedAchievement)?.name || 'N/A'}
              </div>
              <div className="text-sm text-purple-600 font-medium">Top Performer</div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto relative">
          <div className="sticky-table">
            <Table>
            <TableHeader>
              <TableRow className="bg-tableHeader">
                                  <TableHead 
                    className="font-semibold dark:text-white min-w-[200px]"
                    style={{ position: 'sticky', left: 0, zIndex: 20, backgroundColor: '#f3f4f6' }}
                  >
                    Faculty Name
                  </TableHead>
                  <TableHead className="font-semibold dark:text-white min-w-[150px]">Designation</TableHead>
                  <TableHead className="font-semibold dark:text-white min-w-[150px]">Department</TableHead>
                <TableHead className="font-semibold text-center dark:text-white min-w-[180px]">R&D Proposals (Sangsation)</TableHead>
                <TableHead className="font-semibold text-center dark:text-white min-w-[180px]">R&D Proposals (Submition)</TableHead>
                <TableHead className="font-semibold text-center dark:text-white min-w-[140px]">Academic Pass %</TableHead>
                <TableHead className="font-semibold text-center dark:text-white min-w-[150px]">Effective Mentoring</TableHead>
                <TableHead className="font-semibold text-center dark:text-white min-w-[120px]">R&D Funding</TableHead>
                <TableHead className="font-semibold text-center dark:text-white min-w-[150px]">Journal Publications</TableHead>
                <TableHead className="font-semibold text-center dark:text-white min-w-[150px]">Co-Author Journals</TableHead>
                <TableHead className="font-semibold text-center dark:text-white min-w-[150px]">Student Publications</TableHead>
                <TableHead className="font-semibold text-center dark:text-white min-w-[150px]">Book Publications</TableHead>
                <TableHead className="font-semibold text-center dark:text-white min-w-[120px]">Patents</TableHead>
                <TableHead className="font-semibold text-center dark:text-white min-w-[160px]">Online Certifications</TableHead>
                <TableHead className="font-semibold text-center dark:text-white min-w-[140px]">Student Projects</TableHead>
                <TableHead className="font-semibold text-center dark:text-white min-w-[120px]">FDP Works</TableHead>
                <TableHead className="font-semibold text-center dark:text-white min-w-[120px]">FDP Worps</TableHead>
                <TableHead className="font-semibold text-center dark:text-white min-w-[160px]">Industry Collaborations</TableHead>
                <TableHead className="font-semibold text-center dark:text-white min-w-[140px]">Other Activities</TableHead>
                <TableHead className="font-semibold text-center dark:text-white min-w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaculty.map((faculty) => (
                <TableRow 
                  key={faculty.id} 
                  className="hover:bg-tableHover transition-colors"
                >
                  <TableCell 
                    className="font-medium dark:text-white min-w-[200px]"
                    style={{ position: 'sticky', left: 0, zIndex: 20, backgroundColor: 'white' }}
                  >
                  <div>
                  <div className="font-semibold dark:text-white">{faculty.name}</div>
                  {/* FACULTY ID - ONLY VISIBLE TO HODs */}
                  {isHeadOfDepartment === true ? (
                    <div className="text-sm text-muted-foreground dark:text-white">{faculty.id}</div>
                  ) : null}
                  </div>
                  </TableCell>
                  <TableCell className="dark:text-white min-w-[150px]">
                    {faculty.designation}
                  </TableCell>
                  <TableCell className="dark:text-white min-w-[150px]">
                    <Badge variant="secondary" className="text-xs dark:text-white">
                      {faculty.department}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center dark:text-white">{faculty.rdproposalssangsation ?? ''}</TableCell>
                  <TableCell className="text-center dark:text-white">{faculty.rdproposalssubmition ?? ''}</TableCell>
                  <TableCell className="text-center dark:text-white">{faculty.academicpasspercentage ?? '90%'}</TableCell>
                  <TableCell className="text-center dark:text-white">{faculty.effectivementoring ?? 'Yes'}</TableCell>
                  <TableCell className="text-center dark:text-white">{faculty.rdfunding}</TableCell>
                  <TableCell className="text-center dark:text-white">{faculty.journalpublications}</TableCell>
                  <TableCell className="text-center dark:text-white">{faculty.journalscoauthor}</TableCell>
                  <TableCell className="text-center dark:text-white">{faculty.studentpublications}</TableCell>
                  <TableCell className="text-center dark:text-white">{faculty.bookpublications}</TableCell>
                  <TableCell className="text-center font-semibold text-success dark:text-white">
                    {faculty.patents}
                  </TableCell>
                  <TableCell className="text-center dark:text-white">{faculty.onlinecertifications}</TableCell>
                  <TableCell className="text-center dark:text-white">{faculty.studentprojects}</TableCell>
                  <TableCell className="text-center dark:text-white">{faculty.fdpworks}</TableCell>
                  <TableCell className="text-center dark:text-white">{faculty.fdpworps}</TableCell>
                  <TableCell className="text-center dark:text-white">{faculty.industrycollabs}</TableCell>
                  <TableCell className="text-center dark:text-white">{faculty.otheractivities}</TableCell>
                  <TableCell className="text-center dark:text-white">
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewGraph(faculty)}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View Individual Graph"
                      >
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      {/* DELETE BUTTON - ONLY VISIBLE TO HODs */}
                      {isHeadOfDepartment === true && faculty.id !== 'TARGET' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFaculty(faculty)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Remove Faculty"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredFaculty.map((faculty) => (
            <Card key={faculty.id} className="p-5 hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{faculty.name}</h3>
                        {/* FACULTY ID - ONLY VISIBLE TO HODs */}
                        {isHeadOfDepartment === true ? (
                          <p className="text-xs text-gray-500 font-mono">{faculty.id}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                        {faculty.designation}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                        {faculty.department}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewGraph(faculty)}
                      className="h-10 w-10 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
                      title="View Individual Graph"
                    >
                      <BarChart3 className="w-5 h-5" />
                    </Button>
                    {/* DELETE BUTTON - ONLY VISIBLE TO HODs */}
                    {isHeadOfDepartment === true && faculty.id !== 'TARGET' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFaculty(faculty)}
                        className="h-10 w-10 p-0 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                        title="Remove Faculty"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    ) : null}
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200/50">
                    <div className="text-xs text-blue-700 font-semibold mb-1">R&D Proposals</div>
                    <div className="text-xl font-bold text-blue-800">
                      {(faculty.rdproposalssangsation || 0) + (faculty.rdproposalssubmition || 0)}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200/50">
                    <div className="text-xs text-green-700 font-semibold mb-1">Patents</div>
                    <div className="text-xl font-bold text-green-800">{faculty.patents || 0}</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200/50">
                    <div className="text-xs text-purple-700 font-semibold mb-1">Publications</div>
                    <div className="text-xl font-bold text-purple-800">
                      {(faculty.journalpublications || 0) + (faculty.bookpublications || 0)}
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200/50">
                    <div className="text-xs text-orange-700 font-semibold mb-1">Projects</div>
                    <div className="text-xl font-bold text-orange-800">{faculty.studentprojects || 0}</div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="bg-gray-50/50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Academic Pass:</span>
                    <span className="font-bold text-gray-900">{faculty.academicpasspercentage || '90%'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">Mentoring:</span>
                    <span className="font-bold text-gray-900">{faculty.effectivementoring || 'Yes'}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">R&D Funding:</span>
                    <span className="font-bold text-gray-900">₹{faculty.rdfunding || 0}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredFaculty.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No faculty members found matching your criteria.
          </div>
        )}
        
        {/* Admin Features Notice - REMOVED for clean faculty view */}
      </CardContent>
    </Card>

    {/* Delete Faculty Confirmation Dialog */}
    <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Delete Faculty Options
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-800 mb-2">⚠️ Warning: This action cannot be undone!</h4>
            <p className="text-red-700 text-sm">
              Faculty: <strong>{facultyToDelete?.name}</strong> ({facultyToDelete?.id})
            </p>
            <p className="text-red-700 text-sm">
              Department: <strong>{facultyToDelete?.department}</strong>
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h5 className="font-medium text-blue-800 mb-2">Option 1: Reset Performance Data</h5>
              <p className="text-blue-700 text-sm">
                • Keeps faculty record (name, department, designation)
                • Resets all performance metrics to zero
                • Faculty can start fresh with clean slate
              </p>
              <Button
                onClick={handleResetPerformance}
                variant="outline"
                className="mt-2 w-full border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Reset Performance Data
              </Button>
            </div>
            
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <h5 className="font-medium text-red-800 mb-2">Option 2: Complete Deletion</h5>
              <p className="text-red-700 text-sm">
                • Completely removes faculty from database
                • All data permanently deleted
                • Cannot be recovered
              </p>
              <Button
                onClick={handleCompleteDelete}
                variant="destructive"
                className="mt-2 w-full"
              >
                Delete Faculty Completely
              </Button>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialog(false);
                setFacultyToDelete(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default FacultyTable;