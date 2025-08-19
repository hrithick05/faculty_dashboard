import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { getCookie } from "@/utils/cookies";
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  User, 
  Clock, 
  Award, 
  Eye, 
  Download, 
  Filter, 
  Search, 
  RefreshCw,
  Trash2,
  ArrowLeft
} from 'lucide-react';

const HODReviewPanel = () => {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState('');
  const [reviewReason, setReviewReason] = useState('');
  const [lastSubmissionCount, setLastSubmissionCount] = useState(0);
  const [newSubmissionsCount, setNewSubmissionsCount] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [facultyToDelete, setFacultyToDelete] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const { toast } = useToast();

  // Get current user info with better error handling
  const getCurrentUser = () => {
    try {
      const localFaculty = localStorage.getItem('loggedInFaculty');
      const cookieFaculty = getCookie('loggedInFaculty');
      
      console.log('🔍 Getting current user in HODReviewPanel:');
      console.log('  - localStorage faculty:', localFaculty);
      console.log('  - cookie faculty:', cookieFaculty);
      
      const faculty = localFaculty ? JSON.parse(localFaculty) : cookieFaculty;
      
      if (!faculty) {
        console.log('❌ No faculty data found in storage or cookies');
        return null;
      }
      
      console.log('✅ Current user:', faculty);
      console.log('  - ID:', faculty.id);
      console.log('  - Name:', faculty.name);
      console.log('  - Designation:', faculty.designation);
      console.log('  - Department:', faculty.department);
      
      return faculty;
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return null;
    }
  };

  // Check if current user is HOD
  const isCurrentUserHOD = () => {
    const user = getCurrentUser();
    if (!user) return false;
    
    const designation = user.designation?.toLowerCase() || '';
    const isHOD = designation.includes('hod') || 
                   designation.includes('head') || 
                   designation.includes('chair') ||
                   designation.includes('professor') ||
                   designation.includes('director');
    
    console.log('🔍 HOD check for user:', user.name);
    console.log('  - Designation:', designation);
    console.log('  - Is HOD:', isHOD);
    
    return isHOD;
  };

  // Verify user permissions on component mount
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      console.log('❌ No user found, redirecting to login');
      toast({
        title: "Authentication Required",
        description: "Please log in to access the HOD Review Panel",
        variant: "destructive"
      });
      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }
    
    if (!isCurrentUserHOD()) {
      console.log('❌ User is not HOD, redirecting to dashboard');
      toast({
        title: "Access Denied",
        description: "Only Head of Department can access this panel",
        variant: "destructive"
      });
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      return;
    }
    
    console.log('✅ User authenticated and authorized as HOD');
    // Start fetching data
    fetchSubmissions();
  }, []);

  // Fetch submissions from backend
  const fetchSubmissions = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      console.log('🔍 Fetching submissions from backend...');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/achievements/all`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📋 Backend response:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Backend returned error');
      }
      
      // Get all submissions without filtering
      const allSubmissions = data.data || [];
      console.log(`📊 Found ${allSubmissions.length} total submissions`);
      
      // Show all submissions that have basic data
      const validSubmissions = allSubmissions.filter(submission => 
        submission.faculty_id && 
        submission.faculty_name &&
        submission.status
      );
      
      console.log(`✅ Valid submissions: ${validSubmissions.length}`);
      console.log('📋 Submissions data:', validSubmissions);
      
      // Log the order of submissions to verify they're in the right order
      console.log('📅 Submission order check (should be newest first):');
      validSubmissions.forEach((submission, index) => {
        console.log(`  ${index + 1}. ID: ${submission.id}, Title: ${submission.title}, Submitted: ${submission.submitted_at}, Status: ${submission.status}`);
      });
      
      // Fetch updated achievement counts for approved submissions
      const submissionsWithCounts = await fetchFacultyAchievementCounts(validSubmissions);
      
      // IMPORTANT: Don't re-sort here! The backend already returns them in the correct order
      // The backend orders by submitted_at DESC (newest first), so preserve that order
      const finalSubmissions = submissionsWithCounts;
      
      console.log('🎯 Final submissions order (preserving backend order):');
      finalSubmissions.forEach((submission, index) => {
        console.log(`  ${index + 1}. ID: ${submission.id}, Title: ${submission.title}, Submitted: ${submission.submitted_at}, Status: ${submission.status}`);
      });
      
      setSubmissions(finalSubmissions);
      setFilteredSubmissions(finalSubmissions);
      
      // Check for new submissions
      if (lastSubmissionCount > 0 && finalSubmissions.length > lastSubmissionCount) {
        const newCount = finalSubmissions.length - lastSubmissionCount;
        setNewSubmissionsCount(newCount);
        toast({
          title: "New Submissions Detected! 🆕",
          description: `${newCount} new submission(s) have been added.`,
        });
      }
      
      setLastSubmissionCount(finalSubmissions.length);
      
      // Verify the order is correct
      verifySubmissionOrder();
      
      if (isRefresh) {
        toast({
          title: "Data Refreshed",
          description: `Found ${validSubmissions.length} submissions.`,
        });
      }
    } catch (error) {
      console.error('❌ Error fetching submissions:', error);
      toast({
        title: "Failed to Load Submissions",
        description: `Error: ${error.message}`,
        variant: "destructive"
      });
      setSubmissions([]);
      setFilteredSubmissions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Check data types
  const checkDataTypes = () => {
    console.log('🔍 Checking data types...');
    submissions.forEach((sub, idx) => {
      console.log(`  ${idx + 1}. ID: ${sub.id} (${typeof sub.id})`);
      console.log(`     Title: ${sub.title} (${typeof sub.title})`);
      console.log(`     Submitted: ${sub.submitted_at} (${typeof sub.submitted_at})`);
      console.log(`     Status: ${sub.status} (${typeof sub.status})`);
      console.log(`     Raw submitted_at:`, sub.submitted_at);
      console.log(`     Parsed date:`, new Date(sub.submitted_at));
      console.log('     ---');
    });
  };

  // Manual sort function to debug ordering
  const manualSortSubmissions = () => {
    console.log('🔧 Manually sorting submissions...');
    
    const sorted = [...submissions].sort((a, b) => {
      const dateA = new Date(a.submitted_at);
      const dateB = new Date(b.submitted_at);
      console.log(`  Comparing: ${a.title} (${dateA}) vs ${b.title} (${dateB})`);
      return dateB - dateA; // Newest first
    });
    
    console.log('📊 Manual sort result:');
    sorted.forEach((sub, idx) => {
      console.log(`  ${idx + 1}. ID: ${sub.id}, Title: ${sub.title}, Submitted: ${sub.submitted_at}`);
    });
    
    setSubmissions(sorted);
    setFilteredSubmissions(sorted);
    
    toast({
      title: "Manual Sort Applied",
      description: "Submissions have been manually sorted by date",
    });
  };

  // Test date parsing
  const testDateParsing = () => {
    console.log('🧪 Testing date parsing...');
    submissions.forEach((sub, idx) => {
      const rawDate = sub.submitted_at;
      const parsedDate = new Date(rawDate);
      const isValid = !isNaN(parsedDate.getTime());
      
      console.log(`  ${idx + 1}. ID: ${sub.id}, Raw: "${rawDate}", Parsed: ${parsedDate}, Valid: ${isValid}`);
    });
  };

  // Verify submission order
  const verifySubmissionOrder = () => {
    if (submissions.length < 2) return true;
    
    for (let i = 0; i < submissions.length - 1; i++) {
      const current = new Date(submissions[i].submitted_at);
      const next = new Date(submissions[i + 1].submitted_at);
      
      if (current < next) {
        console.error(`❌ Order issue: Submission ${i + 1} (${submissions[i].title}) is newer than submission ${i + 2} (${submissions[i + 1].title})`);
        return false;
      }
    }
    
    console.log('✅ All submissions are in correct order (newest first)');
    return true;
  };

  // Fetch updated faculty achievement counts for approved submissions
  const fetchFacultyAchievementCounts = async (submissions) => {
    try {
      // Get unique faculty IDs from approved submissions
      const approvedSubmissions = submissions.filter(s => s.status === 'approved');
      const facultyIds = [...new Set(approvedSubmissions.map(s => s.faculty_id))];
      
      if (facultyIds.length === 0) return submissions;
      
      console.log('🔍 Fetching updated achievement counts for faculty:', facultyIds);
      
      // Fetch faculty data from Supabase
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yfcukflinfinmjvllwin.supabase.co';
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY3VrZmxpbmZpbm1qdmxsd2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjYzNzIsImV4cCI6MjA2OTk0MjM3Mn0.JtFF_xnwjHtb8WnzbWxAJS5gNyv0u_WI7NgPBGoDJE4';
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { data: facultyData, error } = await supabase
        .from('faculty')
        .select('id, journalpublications, patents, studentprojects, rdproposalssangsation, rdproposalssubmition, rdfunding, journalscoauthor, studentpublications, bookpublications, onlinecertifications, fdpworks, fdpworps, industrycollabs, otheractivities')
        .in('id', facultyIds);
      
      if (error) {
        console.error('❌ Error fetching faculty data:', error);
        return submissions;
      }
      
      // Create a map of faculty ID to achievement counts
      const facultyCounts = {};
      facultyData?.forEach(faculty => {
        facultyCounts[faculty.id] = faculty;
      });
      
      // Update submissions with current achievement counts while preserving order
      const updatedSubmissions = submissions.map(submission => {
        if (submission.status === 'approved' && facultyCounts[submission.faculty_id]) {
          const faculty = facultyCounts[submission.faculty_id];
          const achievementType = submission.achievement_type;
          const currentCount = faculty[achievementType] || 0;
          
          return {
            ...submission,
            current_achievement_count: currentCount,
            achievement_updated: true
          };
        }
        return submission;
      });
      
      console.log('✅ Updated submissions with current achievement counts (order preserved)');
      return updatedSubmissions;
      
    } catch (error) {
      console.error('❌ Error fetching faculty achievement counts:', error);
      return submissions;
    }
  };

  // Filter submissions based on search and status
  useEffect(() => {
    let filtered = submissions;
    
    if (searchTerm) {
      filtered = filtered.filter(submission =>
        submission.faculty_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        submission.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(submission => submission.status === statusFilter);
    }
    
    setFilteredSubmissions(filtered);
  }, [submissions, searchTerm, statusFilter]);

  // Handle approval/rejection
  const handleReview = async (submissionId, action, reason) => {
    try {
      console.log('🔍 Reviewing submission:', submissionId, 'Action:', action);
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/achievements/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          action,
          reason,
          hodId: 'CSE001' // This should come from the logged-in HOD
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to review submission');
      }

      const result = await response.json();
      
      // Show success message with achievement count update info
      if (action === 'approve') {
        toast({
          title: "Submission Approved & Achievement Count Updated!",
          description: result.message || "Faculty achievement count has been automatically updated in the database.",
        });
      } else {
        toast({
          title: "Submission Rejected",
          description: result.message || `Submission has been ${action}d successfully.`,
        });
      }

      // Refresh the submissions list
      await fetchSubmissions(true);
      
      // Close dialog
      setReviewDialog(false);
      setSelectedSubmission(null);
      setReviewAction('');
      setReviewReason('');
      
    } catch (error) {
      console.error('❌ Review error:', error);
      toast({
        title: "Review Failed",
        description: error.message || "Could not process review. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Open review dialog
  const openReviewDialog = (submission, action) => {
    setSelectedSubmission(submission);
    setReviewAction(action);
    setReviewDialog(true);
  };

  // Open delete faculty dialog
  const openDeleteDialog = (submission) => {
    setFacultyToDelete(submission);
    setDeleteConfirmation('');
    setDeleteDialog(true);
  };

  // Handle faculty deletion
  const handleDeleteFaculty = async () => {
    if (deleteConfirmation !== facultyToDelete?.faculty_name) {
      toast({
        title: "Confirmation Mismatch",
        description: "Please type the faculty name exactly to confirm deletion.",
        variant: "destructive"
      });
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/faculty/delete-details`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facultyId: facultyToDelete.faculty_id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete faculty');
      }

      const result = await response.json();
      
      toast({
        title: "Faculty Deleted Successfully",
        description: result.message || "Faculty details have been removed from the system.",
      });

      // Refresh submissions to reflect the deletion
      await fetchSubmissions(true);
      
      // Close dialog
      setDeleteDialog(false);
      setFacultyToDelete(null);
      setDeleteConfirmation('');
      
    } catch (error) {
      console.error('❌ Delete faculty error:', error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Could not delete faculty. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const variants = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive'
    };
    
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status?.charAt(0)?.toUpperCase() + status?.slice(1) || 'Unknown'}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Convert to IST (UTC+5:30)
      const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
      
      return istDate.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Format date in readable IST format
  const formatDateIST = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      // Convert to IST (UTC+5:30)
      const istDate = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
      
      const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      };
      
      return istDate.toLocaleDateString('en-IN', options) + ' IST';
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Load submissions on component mount
  useEffect(() => {
    fetchSubmissions();
    
    // Auto-refresh every 2 minutes to catch new submissions
    const autoRefreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing submissions...');
      fetchSubmissions(true);
    }, 2 * 60 * 1000); // 2 minutes
    
    return () => clearInterval(autoRefreshInterval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Debug Section - Only show in development */}
      {import.meta.env.DEV && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">🔍 Debug Info (Development Only)</h3>
          <div className="text-xs text-yellow-700 space-y-1">
            <div>Current User: {getCurrentUser()?.name || 'None'}</div>
            <div>Designation: {getCurrentUser()?.designation || 'None'}</div>
            <div>Is HOD: {isCurrentUserHOD() ? 'Yes' : 'No'}</div>
            <div>localStorage: {localStorage.getItem('loggedInFaculty') ? 'Present' : 'Empty'}</div>
            <div>Cookie: {getCookie('loggedInFaculty') ? 'Present' : 'Empty'}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/dashboard')} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HOD Review Panel</h1>
            <p className="text-gray-600 mt-2">
              Review and approve faculty achievement submissions ({submissions.length} total)
            </p>
            {submissions.length > 0 && (
              <div className="mt-2 text-sm text-blue-600">
                <span className="font-medium">Latest submission:</span> {formatDateIST(submissions[0]?.submitted_at)} - {submissions[0]?.title}
              </div>
            )}
            {submissions.filter(s => s.status === 'pending').length > 0 && (
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-yellow-800 font-medium">
                  ⚠️ {submissions.filter(s => s.status === 'pending').length} pending submission(s) require your review
                </span>
              </div>
            )}
            {newSubmissionsCount > 0 && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-green-800 font-medium">
                  🆕 {newSubmissionsCount} new submission(s) detected since last refresh
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => fetchSubmissions(true)} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => {
              console.log('🔄 Force refreshing submissions...');
              setSubmissions([]);
              setFilteredSubmissions([]);
              // Clear any cached data and fetch fresh
              setTimeout(() => fetchSubmissions(true), 100);
            }} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Force Refresh
          </Button>
          <Button 
            onClick={() => {
              console.log('🧹 Clearing cache and refreshing...');
              setSubmissions([]);
              setFilteredSubmissions([]);
              setSearchTerm('');
              setStatusFilter('all');
              // Force a complete refresh
              setTimeout(() => fetchSubmissions(true), 100);
            }} 
            disabled={refreshing}
            variant="destructive"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear & Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by faculty name, title, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses ({submissions.length})</SelectItem>
                <SelectItem value="pending">Pending ({submissions.filter(s => s.status === 'pending').length})</SelectItem>
                <SelectItem value="approved">Approved ({submissions.filter(s => s.status === 'approved').length})</SelectItem>
                <SelectItem value="rejected">Rejected ({submissions.filter(s => s.status === 'rejected').length})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              {submissions.length === 0 ? (
                <div className="py-12">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
                  <p className="text-gray-600">
                    Faculty members haven't submitted any achievements for review.
                  </p>
                  <Button 
                    onClick={() => fetchSubmissions(true)} 
                    className="mt-4"
                    variant="outline"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Check Again
                  </Button>
                </div>
              ) : (
                <div className="py-12">
                  <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Matching Submissions</h3>
                  <p className="text-gray-600">
                    Try adjusting your search terms or status filter.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          (() => {
            console.log('🎨 Rendering submissions in UI order:');
            filteredSubmissions.forEach((sub, idx) => {
              console.log(`  ${idx + 1}. ID: ${sub.id}, Title: ${sub.title}, Submitted: ${sub.submitted_at}, Status: ${sub.status}`);
            });
            return filteredSubmissions.map((submission, index) => (
              <Card key={submission.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Submission Number and Timestamp */}
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${index === 0 ? 'bg-green-100' : 'bg-purple-100'}`}>
                        <span className={`text-lg font-bold ${index === 0 ? 'text-green-600' : 'text-purple-600'}`}>
                          {index === 0 ? '🆕' : `#${index + 1}`}
                        </span>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          {index === 0 ? 'Newest' : 'Submission Order'}
                        </div>
                        <div className="text-xs text-gray-600">
                          {formatDateIST(submission.submitted_at)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {submission.id}
                        </div>
                      </div>
                    </div>
                    
                    {/* PDF Info */}
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {submission.title || 'Untitled Achievement'}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {submission.description || 'No description provided'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            Category: {submission.category} • Type: {submission.achievement_type}
                          </span>
                          {submission.pdf_url && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(submission.pdf_url, '_blank')}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View PDF
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(submission.pdf_url, '_blank')}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Faculty Info */}
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <User className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">{submission.faculty_name}</p>
                        <p className="text-sm text-gray-600">{submission.department}</p>
                        <p className="text-xs text-gray-500">
                          ID: {submission.faculty_id}
                        </p>
                        {submission.status === 'approved' && submission.current_achievement_count !== undefined && (
                          <div className="mt-1 p-1 bg-green-50 border border-green-200 rounded text-xs">
                            <span className="text-green-700 font-medium">
                              Current {submission.achievement_type}: {submission.current_achievement_count}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status and Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(submission.status)}
                        <div className="text-xs text-gray-500">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formatDateIST(submission.submitted_at)}
                        </div>
                      </div>
                      
                      {submission.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => openReviewDialog(submission, 'approve')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openReviewDialog(submission, 'reject')}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      
                      {/* Reset Faculty Performance Data Button - Visible to all users for testing */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteDialog(submission)}
                        className="mt-2 border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Reset Performance Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          })()
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Submission
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Submission Details:</h4>
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p><strong>Faculty:</strong> {selectedSubmission?.faculty_name}</p>
                <p><strong>Title:</strong> {selectedSubmission?.title}</p>
                <p><strong>Category:</strong> {selectedSubmission?.category}</p>
                <p><strong>Current Count:</strong> {selectedSubmission?.current_count}</p>
                <p><strong>Requested Increase:</strong> +{selectedSubmission?.requested_increase}</p>
                {reviewAction === 'approve' && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-800 font-medium">
                      🎯 Upon Approval: Achievement count will increase from {selectedSubmission?.current_count} to {selectedSubmission?.current_count + (selectedSubmission?.requested_increase || 1)}
                    </p>
                    <p className="text-green-700 text-xs mt-1">
                      This change will be automatically applied to the faculty member's profile.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                {reviewAction === 'approve' ? 'Approval' : 'Rejection'} Reason (Optional):
              </label>
              <Textarea
                placeholder={reviewAction === 'approve' ? 'Add any notes about this approval...' : 'Explain why this submission was rejected...'}
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setReviewDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleReview(selectedSubmission.id, reviewAction, reviewReason)}
                className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {reviewAction === 'approve' ? 'Approve' : 'Reject'} Submission
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Faculty Details Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
                  <DialogHeader>
          <DialogTitle className="text-red-600">Reset Faculty Performance Data</DialogTitle>
        </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-800 mb-2">⚠️ Warning: This action cannot be undone!</h4>
              <p className="text-red-700 text-sm">
                This will permanently delete all faculty details including:
              </p>
              <ul className="text-red-700 text-sm mt-2 list-disc list-inside">
                <li>All achievement submissions</li>
                <li>Performance metrics and counts</li>
                <li>Custom passwords</li>
                <li>Review history and notes</li>
              </ul>
              <p className="text-red-700 text-sm mt-2 font-medium">
                <strong>⚠️ WARNING: This will reset all faculty performance metrics to zero!</strong>
              </p>
              <p className="text-red-700 text-sm mt-1">
                All achievement counts, publications, and performance data will be reset to zero/null.
              </p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium mb-2">Faculty to Delete:</h4>
              <div className="text-sm">
                <p><strong>Name:</strong> {facultyToDelete?.faculty_name}</p>
                <p><strong>ID:</strong> {facultyToDelete?.faculty_id}</p>
                <p><strong>Department:</strong> {facultyToDelete?.department}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h4 className="font-medium mb-2 text-blue-800">HOD Performing Action:</h4>
              <div className="text-sm text-blue-700">
                <p><strong>Name:</strong> {getCurrentUser()?.name}</p>
                <p><strong>ID:</strong> {getCurrentUser()?.id}</p>
                <p><strong>Designation:</strong> {getCurrentUser()?.designation}</p>
                <p><strong>Department:</strong> {getCurrentUser()?.department}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-red-600">
                Type exactly "DELETE_FACULTY_DETAILS" to confirm:
              </label>
              <Input
                placeholder="DELETE_FACULTY_DETAILS"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="border-red-200 focus:border-red-500"
              />
            </div>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialog(false);
                  setFacultyToDelete(null);
                  setDeleteConfirmation('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteFaculty}
                variant="destructive"
                disabled={deleteConfirmation !== 'DELETE_FACULTY_DETAILS'}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Faculty Details
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HODReviewPanel;
