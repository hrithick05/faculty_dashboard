import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import { getCookie } from '../utils/cookies';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yfcukflinfinmjvllwin.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY3VrZmxpbmZpbm1qdmxsd2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjYzNzIsImV4cCI6MjA2OTk0MjM3Mn0.JtFF_xnwjHtb8WnzbWxAJS5gNyv0u_WI7NgPBGoDJE4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const AchievementReviewPanel = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    department: 'all'
  });

  // Get current user info
  const getCurrentUser = () => {
    const localFaculty = localStorage.getItem('loggedInFaculty');
    const cookieFaculty = getCookie('loggedInFaculty');
    return localFaculty ? JSON.parse(localFaculty) : cookieFaculty;
  };

  const currentUser = getCurrentUser();

  const categoryLabels = {
    'research_dev': 'Research & Development',
    'publication': 'Publication',
    'innovation_patents': 'Innovation & Patents',
    'student_engagement': 'Student Engagement',
    'professional_dev': 'Professional Development',
    'industry_others': 'Industry & Others'
  };

  const statusLabels = {
    'pending': 'Pending Review',
    'approved': 'Approved',
    'rejected': 'Rejected'
  };

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  };

  // Fetch all submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      
      // Fetch submissions with faculty details
      const { data, error } = await supabase
        .from('achievement_submissions')
        .select(`
          *,
          faculty:faculty_id(id, name, department, designation)
        `)
        .order('submission_date', { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
      setFilteredSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setMessage({ type: 'error', text: 'Failed to fetch submissions' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = submissions;

    if (filters.status !== 'all') {
      filtered = filtered.filter(sub => sub.status === filters.status);
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(sub => sub.category === filters.category);
    }

    if (filters.department !== 'all') {
      filtered = filtered.filter(sub => sub.faculty?.department === filters.department);
    }

    setFilteredSubmissions(filtered);
  }, [submissions, filters]);

  // Get unique departments
  const departments = Array.from(new Set(submissions.map(sub => sub.faculty?.department).filter(Boolean)));

  // Handle review submission
  const handleReview = async (submissionId, status) => {
    if (!reviewNotes.trim() && status === 'rejected') {
      setMessage({ type: 'error', text: 'Please provide review notes for rejected submissions' });
      return;
    }

    setIsReviewing(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('achievement_submissions')
        .update({
          status: status,
          reviewed_by: currentUser.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', submissionId);

      if (error) throw error;

      // If approved, update faculty achievement counts
      if (status === 'approved') {
        await updateFacultyAchievements(submissionId);
      }

      setMessage({ 
        type: 'success', 
        text: `Submission ${status} successfully` 
      });

      // Refresh submissions
      await fetchSubmissions();
      
      // Reset form
      setSelectedSubmission(null);
      setReviewNotes('');
      
    } catch (error) {
      console.error('Error reviewing submission:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to review submission' 
      });
    } finally {
      setIsReviewing(false);
    }
  };

  // Update faculty achievement counts after approval
  const updateFacultyAchievements = async (submissionId) => {
    try {
      // Get the approved submission
      const { data: submission } = await supabase
        .from('achievement_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (!submission) return;

      // Map category to faculty table field
      const categoryFieldMap = {
        'research_dev': 'rdProposals',
        'publication': 'journalPublications',
        'innovation_patents': 'patents',
        'student_engagement': 'studentProjects',
        'professional_dev': 'fdpWorks',
        'industry_others': 'industryCollabs'
      };

      const fieldToUpdate = categoryFieldMap[submission.category];
      if (!fieldToUpdate) return;

      // Update faculty achievement count
      const { error } = await supabase
        .from('faculty')
        .update({
          [fieldToUpdate]: supabase.sql`${fieldToUpdate} + ${submission.achievement_value}`
        })
        .eq('id', submission.faculty_id);

      if (error) {
        console.error('Error updating faculty achievements:', error);
      }
    } catch (error) {
      console.error('Error updating faculty achievements:', error);
    }
  };

  // Download PDF
  const downloadPDF = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'achievement.pdf';
    link.target = '_blank';
    link.click();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading submissions...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Achievement Review Panel
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Review and approve faculty achievement submissions
          </p>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.department} onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchSubmissions}
              className="ml-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Message Display */}
      {message.text && (
        <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Submissions Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No submissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{submission.faculty?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {submission.faculty?.department} • {submission.faculty?.designation}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {categoryLabels[submission.category]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={submission.title}>
                          {submission.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {submission.submission_type}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{submission.achievement_value}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[submission.status]}>
                          {statusLabels[submission.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(submission.submission_date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* View Details */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedSubmission(submission)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Submission Details</DialogTitle>
                              </DialogHeader>
                              {selectedSubmission && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Faculty</label>
                                      <p className="text-sm">{selectedSubmission.faculty?.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Department</label>
                                      <p className="text-sm">{selectedSubmission.faculty?.department}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Category</label>
                                      <p className="text-sm">{categoryLabels[selectedSubmission.category]}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Type</label>
                                      <p className="text-sm">{selectedSubmission.submission_type}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="text-sm font-medium">Title</label>
                                    <p className="text-sm">{selectedSubmission.title}</p>
                                  </div>
                                  
                                  {selectedSubmission.description && (
                                    <div>
                                      <label className="text-sm font-medium">Description</label>
                                      <p className="text-sm">{selectedSubmission.description}</p>
                                    </div>
                                  )}
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium">Achievement Value</label>
                                      <p className="text-sm">{selectedSubmission.achievement_value}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium">Submitted</label>
                                      <p className="text-sm">{formatDate(selectedSubmission.submission_date)}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => downloadPDF(selectedSubmission.pdf_url, selectedSubmission.title)}
                                    >
                                      <Download className="h-4 w-4 mr-2" />
                                      Download PDF
                                    </Button>
                                  </div>
                                  
                                  {selectedSubmission.status === 'pending' && (
                                    <div className="space-y-4 pt-4 border-t">
                                      <div>
                                        <label className="text-sm font-medium">Review Notes</label>
                                        <Textarea
                                          placeholder="Add review notes (required for rejection)"
                                          value={reviewNotes}
                                          onChange={(e) => setReviewNotes(e.target.value)}
                                          rows={3}
                                        />
                                      </div>
                                      
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => handleReview(selectedSubmission.id, 'approved')}
                                          disabled={isReviewing}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Approve
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleReview(selectedSubmission.id, 'rejected')}
                                          disabled={isReviewing || !reviewNotes.trim()}
                                        >
                                          <XCircle className="h-4 w-4 mr-2" />
                                          Reject
                                        </Button>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {selectedSubmission.status !== 'pending' && (
                                    <div className="pt-4 border-t">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium">Reviewed By</label>
                                          <p className="text-sm">{selectedSubmission.reviewed_by}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Reviewed At</label>
                                          <p className="text-sm">{formatDate(selectedSubmission.reviewed_at)}</p>
                                        </div>
                                      </div>
                                      {selectedSubmission.review_notes && (
                                        <div>
                                          <label className="text-sm font-medium">Review Notes</label>
                                          <p className="text-sm">{selectedSubmission.review_notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementReviewPanel;
