import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Download, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import { getCookie } from '../utils/cookies';

// Supabase configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yfcukflinfinmjvllwin.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmY3VrZmxpbmZpbm1qdmxsd2luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNjYzNzIsImV4cCI6MjA2OTk0MjM3Mn0.JtFF_xnwjHtb8WnzbWxAJS5gNyv0u_WI7NgPBGoDJE4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const MySubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all'
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

  const statusIcons = {
    'pending': Clock,
    'approved': CheckCircle,
    'rejected': XCircle
  };

  // Fetch user's submissions
  const fetchMySubmissions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('achievement_submissions')
        .select('*')
        .eq('faculty_id', currentUser.id)
        .order('submission_date', { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
      setFilteredSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchMySubmissions();
    }
  }, [currentUser?.id]);

  // Apply filters
  useEffect(() => {
    let filtered = submissions;

    if (filters.status !== 'all') {
      filtered = filtered.filter(sub => sub.status === filters.status);
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(sub => sub.category === filters.category);
    }

    setFilteredSubmissions(filtered);
  }, [submissions, filters]);

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

  // Calculate statistics
  const getStats = () => {
    const total = submissions.length;
    const pending = submissions.filter(sub => sub.status === 'pending').length;
    const approved = submissions.filter(sub => sub.status === 'approved').length;
    const rejected = submissions.filter(sub => sub.status === 'rejected').length;
    const totalValue = submissions
      .filter(sub => sub.status === 'approved')
      .reduce((sum, sub) => sum + sub.achievement_value, 0);

    return { total, pending, approved, rejected, totalValue };
  };

  const stats = getStats();

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading your submissions...</span>
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
            My Achievement Submissions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track the status of your submitted achievements
          </p>
        </CardHeader>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Submissions</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-muted-foreground">Approved</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.totalValue}</div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
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
          </div>
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
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
                      {submissions.length === 0 ? 'No submissions yet' : 'No submissions match the current filters'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubmissions.map((submission) => {
                    const StatusIcon = statusIcons[submission.status];
                    return (
                      <TableRow key={submission.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {categoryLabels[submission.category]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={submission.title}>
                            {submission.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {submission.submission_type}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{submission.achievement_value}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[submission.status]}>
                            <StatusIcon className="h-3 w-3 mr-1" />
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
                                        <label className="text-sm font-medium">Category</label>
                                        <p className="text-sm">{categoryLabels[selectedSubmission.category]}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Type</label>
                                        <p className="text-sm">{selectedSubmission.submission_type}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Title</label>
                                        <p className="text-sm">{selectedSubmission.title}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Value</label>
                                        <p className="text-sm">{selectedSubmission.achievement_value}</p>
                                      </div>
                                    </div>
                                    
                                    {selectedSubmission.description && (
                                      <div>
                                        <label className="text-sm font-medium">Description</label>
                                        <p className="text-sm">{selectedSubmission.description}</p>
                                      </div>
                                    )}
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">Submitted</label>
                                        <p className="text-sm">{formatDate(selectedSubmission.submission_date)}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <Badge className={statusColors[selectedSubmission.status]}>
                                          {statusLabels[selectedSubmission.status]}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    {selectedSubmission.academic_year && (
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium">Academic Year</label>
                                          <p className="text-sm">{selectedSubmission.academic_year}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Semester</label>
                                          <p className="text-sm">{selectedSubmission.semester}</p>
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => downloadPDF(selectedSubmission.pdf_url, selectedSubmission.title)}
                                      >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download PDF
                                      </Button>
                                    </div>
                                    
                                    {selectedSubmission.status === 'rejected' && selectedSubmission.review_notes && (
                                      <div className="pt-4 border-t">
                                        <label className="text-sm font-medium">Rejection Reason</label>
                                        <p className="text-sm text-red-600">{selectedSubmission.review_notes}</p>
                                      </div>
                                    )}
                                    
                                    {selectedSubmission.status === 'approved' && (
                                      <div className="pt-4 border-t">
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                          <div className="flex items-center gap-2 text-green-800">
                                            <CheckCircle className="h-5 w-5" />
                                            <span className="font-medium">Achievement Approved!</span>
                                          </div>
                                          <p className="text-sm text-green-700 mt-1">
                                            Your achievement has been approved and added to your profile.
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MySubmissions;
