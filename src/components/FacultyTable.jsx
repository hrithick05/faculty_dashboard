import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Edit, Eye, Plus, BarChart3, Trash2 } from "lucide-react";
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

  // Check user's role from database
  useEffect(() => {
    async function checkUserRole() {
      try {
        setIsLoadingRole(true);
        console.log('🔍 FacultyTable: Checking user role...');
        
        // Try database check first
        const isHead = await isCurrentUserHeadOfDepartment();
        console.log('🔍 FacultyTable: Database role check result:', isHead);
        
        // If database check fails, try stored designation as fallback
        if (!isHead) {
          const localFaculty = localStorage.getItem('loggedInFaculty');
          const cookieFaculty = getCookie('loggedInFaculty');
          const faculty = localFaculty ? JSON.parse(localFaculty) : cookieFaculty;
          const storedIsHead = faculty?.designation === 'Head of Department';
          console.log('🔍 FacultyTable: Fallback check result:', storedIsHead);
          setIsHeadOfDepartment(storedIsHead);
        } else {
          setIsHeadOfDepartment(isHead);
        }
      } catch (error) {
        console.error('❌ FacultyTable: Error checking user role:', error);
        // Fallback to stored designation
        const localFaculty = localStorage.getItem('loggedInFaculty');
        const cookieFaculty = getCookie('loggedInFaculty');
        const faculty = localFaculty ? JSON.parse(localFaculty) : cookieFaculty;
        const storedIsHead = faculty?.designation === 'Head of Department';
        console.log('🔍 FacultyTable: Fallback after error:', storedIsHead);
        setIsHeadOfDepartment(storedIsHead);
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

  // Handle remove faculty
  const handleRemoveFaculty = async (faculty) => {
    if (!isHeadOfDepartment) {
      return;
    }

    if (confirm(`Are you sure you want to remove ${faculty.name}? This action cannot be undone.`)) {
      try {
        const { error } = await supabase
          .from('faculty')
          .delete()
          .eq('id', faculty.id);

        if (error) {
          console.error('Error removing faculty:', error);
          alert('Failed to remove faculty. Please try again.');
        } else {
          console.log('Faculty removed successfully:', faculty.name);
          // Call the parent callback to refresh the data
          if (onRemoveFaculty) {
            onRemoveFaculty();
          }
        }
      } catch (error) {
        console.error('Exception removing faculty:', error);
        alert('An error occurred while removing faculty.');
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <CardTitle className="text-xl font-bold dark:text-white">Faculty Achievement Overview</CardTitle>
          {onAddFaculty && isHeadOfDepartment && !isLoadingRole ? (
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
          ) : (
            <div className="text-sm text-muted-foreground">
              {isLoadingRole ? 'Checking permissions...' : 'Add Faculty (Head of Department only)'}
            </div>
          )}
        </div>
        
        {/* Filters */}
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-full md:w-48">
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
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by achievement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Achievements</SelectItem>
              {achievementTypes.map(type => (
                <SelectItem key={type.key} value={type.key}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </form>

        {/* Summary Stats */}
        {selectedAchievement !== 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 bg-achievement rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {calculateTotal(selectedAchievement)}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">
                {Math.round(calculateTotal(selectedAchievement) / filteredFaculty.length)}
              </div>
              <div className="text-sm text-muted-foreground">Average</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-primary-dark">
                {getTopPerformer(selectedAchievement)?.name || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Top Performer</div>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-tableHeader">
                <TableHead className="font-semibold dark:text-white">Faculty Name</TableHead>
                <TableHead className="font-semibold dark:text-white">Designation</TableHead>
                <TableHead className="font-semibold dark:text-white">Department</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">R&D Proposals (Sangsation)</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">R&D Proposals (Submition)</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Academic Pass %</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Effective Mentoring</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">R&D Funding</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Journal Publications</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Co-Author Journals</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Student Publications</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Book Publications</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Patents</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Online Certifications</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Student Projects</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">FDP Works</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">FDP Worps</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Industry Collaborations</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Other Activities</TableHead>
                <TableHead className="font-semibold text-center dark:text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFaculty.map((faculty) => (
                <TableRow 
                  key={faculty.id} 
                  className="hover:bg-tableHover transition-colors"
                >
                  <TableCell className="font-medium dark:text-white">
                    <div>
                      <div className="font-semibold dark:text-white">{faculty.name}</div>
                      <div className="text-sm text-muted-foreground dark:text-white">{faculty.id}</div>
                    </div>
                  </TableCell>
                  <TableCell className="dark:text-white">
                    {faculty.designation}
                  </TableCell>
                  <TableCell className="dark:text-white">
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
                      {isHeadOfDepartment && faculty.id !== 'TARGET' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFaculty(faculty)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          title="Remove Faculty"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {filteredFaculty.map((faculty) => (
            <Card key={faculty.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg dark:text-white">{faculty.name}</h3>
                    <p className="text-sm text-muted-foreground dark:text-white">{faculty.id}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {faculty.designation}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {faculty.department}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewGraph(faculty)}
                      className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
                      title="View Individual Graph"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                    {isHeadOfDepartment && faculty.id !== 'TARGET' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFaculty(faculty)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
                        title="Remove Faculty"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-xs text-blue-600 font-medium">R&D Proposals</div>
                    <div className="text-lg font-bold text-blue-700">
                      {(faculty.rdproposalssangsation || 0) + (faculty.rdproposalssubmition || 0)}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-xs text-green-600 font-medium">Patents</div>
                    <div className="text-lg font-bold text-green-700">{faculty.patents || 0}</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded-lg">
                    <div className="text-xs text-purple-600 font-medium">Publications</div>
                    <div className="text-lg font-bold text-purple-700">
                      {(faculty.journalpublications || 0) + (faculty.bookpublications || 0)}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded-lg">
                    <div className="text-xs text-orange-600 font-medium">Projects</div>
                    <div className="text-lg font-bold text-orange-700">{faculty.studentprojects || 0}</div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Academic Pass:</span>
                    <span className="font-medium">{faculty.academicpasspercentage || '90%'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mentoring:</span>
                    <span className="font-medium">{faculty.effectivementoring || 'Yes'}</span>
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
      </CardContent>
    </Card>
  );
};

export default FacultyTable;