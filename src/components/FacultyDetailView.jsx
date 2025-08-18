import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogOut, User, Award, BookOpen, Lightbulb, Users, Trophy, GraduationCap, Building, Edit, Upload, FileText, Plus, X, RefreshCw, Info } from "lucide-react";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { getCookie, setCookie, deleteCookie } from '../utils/cookies';

const FacultyDetailView = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Load faculty data from localStorage or cookies
  const localFaculty = localStorage.getItem('loggedInFaculty');
  const cookieFaculty = getCookie('loggedInFaculty');
  const faculty = localFaculty ? JSON.parse(localFaculty) : cookieFaculty;
  
  const [editedFaculty, setEditedFaculty] = useState(faculty);
  const [isEditing, setIsEditing] = useState(false);
  const [pdfSubmissions, setPdfSubmissions] = useState({});
  const [submissionTitles, setSubmissionTitles] = useState({});
  const [submissionDescriptions, setSubmissionDescriptions] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // If no faculty data, redirect to login
  if (!faculty || !faculty.id) {
    navigate('/login');
    return null;
  }

  // Function to fetch latest achievement counts from database
  const refreshAchievementCounts = async () => {
    try {
      setIsRefreshing(true);
      console.log('🔄 Refreshing achievement counts for faculty:', faculty.id);
      
      // Fetch latest faculty data from database
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/faculty/${faculty.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch updated faculty data');
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const updatedFaculty = result.data;
        console.log('✅ Updated faculty data:', updatedFaculty);
        
        // Update both the main faculty object and editedFaculty
        Object.assign(faculty, updatedFaculty);
        setEditedFaculty({ ...updatedFaculty });
        
        // Update localStorage and cookies
        localStorage.setItem('loggedInFaculty', JSON.stringify(updatedFaculty));
        setCookie('loggedInFaculty', updatedFaculty, 7);
        
        toast({
          title: "Achievement Counts Updated! 🎉",
          description: "Latest achievement counts have been refreshed from the database.",
        });
      }
    } catch (error) {
      console.error('❌ Error refreshing achievement counts:', error);
      toast({
        title: "Refresh Failed",
        description: "Could not update achievement counts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Initialize editedFaculty when faculty data changes
  useEffect(() => {
    if (faculty && !editedFaculty) {
      setEditedFaculty({ ...faculty });
    }
  }, [faculty, editedFaculty]);

  // Auto-refresh achievement counts when component mounts
  useEffect(() => {
    console.log('🔄 Auto-refreshing achievement counts on component mount...');
    refreshAchievementCounts();
  }, []); // Empty dependency array means this runs only once when component mounts

  const handleSave = () => {
    console.log('💾 Saving faculty achievements:', editedFaculty);
    
    // Update both localStorage and cookies
    localStorage.setItem('loggedInFaculty', JSON.stringify(editedFaculty));
    setCookie('loggedInFaculty', editedFaculty, 7);
    
    // Update the main faculty object to reflect changes immediately
    // This ensures the UI shows the updated values
    Object.assign(faculty, editedFaculty);
    
    setIsEditing(false);
    toast({
      title: "Success",
      description: "Your achievements have been updated successfully!",
    });
    
    console.log('✅ Faculty achievements saved successfully');
  };

  const handleLogout = () => {
    // Clear both localStorage and cookies
    localStorage.removeItem('loggedInFaculty');
    deleteCookie('loggedInFaculty');
    deleteCookie('loginTimestamp');
    deleteCookie('sessionInfo');
    deleteCookie('lastActivity');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    
    navigate('/login');
  };

  const startEditing = () => {
    console.log('✏️ Starting edit mode...');
    setEditedFaculty({ ...faculty });
    setIsEditing(true);
    console.log('✅ Edit mode started with faculty data:', editedFaculty);
  };

  const handleCancel = () => {
    console.log('❌ Cancelling edit mode...');
    setEditedFaculty({ ...faculty });
    setPdfSubmissions({});
    setSubmissionTitles({});
    setSubmissionDescriptions({});
    setIsEditing(false);
    console.log('✅ Edit mode cancelled, data reset');
  };

  const updateField = (field, value) => {
    console.log(`🔄 Updating field: ${field} = ${value}`);
    setEditedFaculty(prev => {
      const updated = { ...prev, [field]: value };
      console.log('📝 Updated editedFaculty:', updated);
      return updated;
    });
  };

  // Handle PDF file selection
  const handlePdfSelect = (categoryKey, fieldKey, file) => {
    if (file && file.type === 'application/pdf') {
      setPdfSubmissions(prev => ({
        ...prev,
        [`${categoryKey}_${fieldKey}`]: {
          file: file,
          name: file.name,
          size: file.size
        }
      }));
      toast({
        title: "PDF Selected",
        description: `${file.name} has been selected for upload.`,
      });
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid PDF file.",
        variant: "destructive"
      });
    }
  };

  // Handle PDF submission
  const handlePdfSubmit = async (categoryKey, fieldKey) => {
    const submission = pdfSubmissions[`${categoryKey}_${fieldKey}`];
    if (!submission) {
      toast({
        title: "No PDF Selected",
        description: "Please select a PDF file first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get the title and description from the state
      const title = submissionTitles[`${categoryKey}_${fieldKey}`] || 'Untitled Achievement';
      const description = submissionDescriptions[`${categoryKey}_${fieldKey}`] || 'No description provided';
      
      // Set uploading state
      setIsUploading(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('pdf', submission.file);
      formData.append('facultyId', faculty.id);
      formData.append('facultyName', faculty.name);
      formData.append('department', faculty.department);
      formData.append('category', categoryKey);
      formData.append('achievementType', fieldKey);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('currentCount', faculty[fieldKey] || 0);
      formData.append('requestedIncrease', '1');
      
      console.log('📤 Uploading PDF to backend:', {
        facultyId: faculty.id,
        facultyName: faculty.name,
        category: categoryKey,
        achievementType: fieldKey,
        title: title,
        fileName: submission.name
      });
      
      // Upload to backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/achievements/submit`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "PDF Uploaded Successfully! 🎉",
          description: `${submission.name} has been submitted for HOD review. Achievement count will increase after approval.`,
        });
        
        // Clear the submission after successful upload
        setPdfSubmissions(prev => {
          const newState = { ...prev };
          delete newState[`${categoryKey}_${fieldKey}`];
          return newState;
        });
        
        // Clear the form inputs
        setSubmissionTitles(prev => {
          const newState = { ...prev };
          delete newState[`${categoryKey}_${fieldKey}`];
          return newState;
        });
        
        setSubmissionDescriptions(prev => {
          const newState = { ...prev };
          delete newState[`${categoryKey}_${fieldKey}`];
          return newState;
        });
        
        // Automatically refresh achievement counts after successful upload
        // This ensures the UI shows the latest counts from the database
        setTimeout(() => {
          refreshAchievementCounts();
        }, 1000); // Wait 1 second for the backend to process
        
      } else {
        throw new Error(result.message || 'Upload failed');
      }

    } catch (error) {
      console.error('❌ PDF upload error:', error);
      toast({
        title: "Upload Failed",
        description: `Failed to upload PDF: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Remove PDF selection
  const removePdfSelection = (categoryKey, fieldKey) => {
    setPdfSubmissions(prev => {
      const newState = { ...prev };
      delete newState[`${categoryKey}_${fieldKey}`];
      return newState;
    });
  };

  const achievementCategories = [
    {
      title: "Research & Development",
      key: "research_dev",
      icon: <Lightbulb className="w-5 h-5" />,
      items: [
        { key: 'rdproposalssangsation', label: 'R&D Proposals (Sangsation)', value: (isEditing ? editedFaculty : faculty).rdproposalssangsation },
        { key: 'rdproposalssubmition', label: 'R&D Proposals (Submition)', value: (isEditing ? editedFaculty : faculty).rdproposalssubmition },
        { key: 'rdfunding', label: 'R&D Funding (in lakhs)', value: (isEditing ? editedFaculty : faculty).rdfunding },
      ]
    },
    {
      title: "Publications",
      key: "publication",
      icon: <BookOpen className="w-5 h-5" />,
      items: [
        { key: 'journalpublications', label: 'Journal Publications', value: (isEditing ? editedFaculty : faculty).journalpublications },
        { key: 'journalscoauthor', label: 'Co-Author Publications', value: (isEditing ? editedFaculty : faculty).journalscoauthor },
        { key: 'bookpublications', label: 'Book Publications', value: (isEditing ? editedFaculty : faculty).bookpublications },
        { key: 'studentpublications', label: 'Student Publications', value: (isEditing ? editedFaculty : faculty).studentpublications },
      ]
    },
    {
      title: "Innovation & Patents",
      key: "innovation_patents",
      icon: <Award className="w-5 h-5" />,
      items: [
        { key: 'patents', label: 'Patents Filed', value: (isEditing ? editedFaculty : faculty).patents },
        { key: 'onlinecertifications', label: 'Online Certifications', value: (isEditing ? editedFaculty : faculty).onlinecertifications },
      ]
    },
    {
      title: "Student Engagement",
      key: "student_engagement",
      icon: <Users className="w-5 h-5" />,
      items: [
        { key: 'studentprojects', label: 'Student Projects Guided', value: (isEditing ? editedFaculty : faculty).studentprojects },
      ]
    },
    {
      title: "Professional Development",
      key: "professional_dev",
      icon: <GraduationCap className="w-5 h-5" />,
      items: [
        { key: 'fdpworks', label: 'FDP Works', value: (isEditing ? editedFaculty : faculty).fdpworks },
        { key: 'fdpworps', label: 'FDP Worps', value: (isEditing ? editedFaculty : faculty).fdpworps },
      ]
    },
    {
      title: "Industry & Others",
      key: "industry_others",
      icon: <Building className="w-5 h-5" />,
      items: [
        { key: 'industrycollabs', label: 'Industry Collaborations', value: (isEditing ? editedFaculty : faculty).industrycollabs },
        { key: 'otheractivities', label: 'Other Activities', value: (isEditing ? editedFaculty : faculty).otheractivities },
      ]
    }
  ];

  // Calculate total achievements from numeric fields only
  const currentFaculty = isEditing ? editedFaculty : faculty;
  const totalAchievements = [
    currentFaculty.rdproposalssangsation || 0,
    currentFaculty.rdproposalssubmition || 0,
    currentFaculty.rdfunding || 0,
    currentFaculty.journalpublications || 0,
    currentFaculty.journalscoauthor || 0,
    currentFaculty.bookpublications || 0,
    currentFaculty.studentpublications || 0,
    currentFaculty.patents || 0,
    currentFaculty.onlinecertifications || 0,
    currentFaculty.studentprojects || 0,
    currentFaculty.fdpworks || 0,
    currentFaculty.fdpworps || 0,
    currentFaculty.industrycollabs || 0,
    currentFaculty.otheractivities || 0
  ].reduce((sum, val) => sum + val, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900">
      <div className="container mx-auto p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-800 dark:via-pink-800 dark:to-blue-800 text-white rounded-2xl p-6 shadow-2xl border border-purple-200 dark:border-purple-700">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">{faculty.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {faculty.id}
                  </Badge>
                  <span className="text-white/80">•</span>
                  <span className="text-white/90">{faculty.department}</span>
                </div>
                <div className="mt-2">
                  <Label className="text-sm font-medium text-white/90">Designation:</Label>{' '}
                  {isEditing ? (
                    <select
                      value={editedFaculty.designation || faculty.designation}
                      onChange={e => updateField('designation', e.target.value)}
                      className="ml-2 px-2 py-1 rounded border bg-white/20 text-white border-white/30"
                    >
                      <option value="Head of Department">Head of Department</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                    </select>
                  ) : (
                    <Badge variant="secondary" className="ml-2 bg-white/20 text-white border-white/30">{faculty.designation}</Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => isEditing ? handleCancel() : startEditing()}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel Edit' : 'Edit Achievements'}
              </Button>
              <Button 
                variant="outline" 
                onClick={refreshAchievementCounts}
                disabled={isRefreshing}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh Counts'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Back
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
          
          <div className="flex gap-4 mt-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">{totalAchievements}</div>
              <div className="text-white/90 text-sm">Total Achievements</div>
            </div>
            {isRefreshing && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1"></div>
                <div className="text-white/80 text-xs">Updating...</div>
              </div>
            )}
          </div>
        </div>

        {/* Save/Cancel Buttons when editing */}
        {isEditing && (
          <div className="space-y-4">
            {/* Show changes summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">📝 Changes Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {achievementCategories.flatMap(category => 
                  category.items.filter(item => 
                    editedFaculty[item.key] !== faculty[item.key]
                  ).map(item => (
                    <div key={item.key} className="flex justify-between items-center bg-white p-2 rounded border">
                      <span className="text-blue-700 font-medium">{item.label}:</span>
                      <span className="text-blue-600">
                        {faculty[item.key] || 0} → {editedFaculty[item.key] || 0}
                      </span>
                    </div>
                  ))
                )}
              </div>
              {achievementCategories.flatMap(category => 
                category.items.filter(item => editedFaculty[item.key] !== faculty[item.key])
              ).length === 0 && (
                <p className="text-blue-600 text-center">No changes made yet</p>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCancel} className="border-2 border-purple-200 hover:border-purple-500">
                Cancel Changes
              </Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Achievement Categories */}
        <div className="space-y-4">
          {/* Info about real-time counts */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-blue-800">
              <Info className="w-4 h-4" />
              <span className="text-sm font-medium">
                Real-time Achievement Counts
              </span>
            </div>
            <p className="text-blue-700 text-xs mt-1">
              Achievement counts are automatically updated from the database. Use the "Refresh Counts" button to get the latest data.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {achievementCategories.map((category, index) => (
              <Card key={index} className="shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-200 dark:border-purple-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                      {category.icon}
                    </div>
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {category.items.map((item) => (
                      <div key={item.key} className="space-y-3">
                        <div className="flex justify-between items-center">
                          <Label className="text-sm font-medium text-purple-700 dark:text-purple-300">{item.label}</Label>
                          {isEditing ? (
                            <Input
                              type="number"
                              min="0"
                              value={editedFaculty[item.key] || 0}
                              onChange={(e) => updateField(item.key, parseInt(e.target.value) || 0)}
                              className={`w-20 text-right border-2 focus:border-purple-500 ${
                                editedFaculty[item.key] !== faculty[item.key] 
                                  ? 'border-green-500 bg-green-50' 
                                  : 'border-purple-200'
                              }`}
                            />
                          ) : (
                            <Badge variant="secondary" className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                              {item.value}
                            </Badge>
                          )}
                        </div>
                        
                        {/* PDF Upload Section - Only show when editing */}
                        {isEditing && (
                          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-purple-600" />
                              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Upload PDF for Achievement</span>
                            </div>
                            
                            {/* PDF File Input */}
                            <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="file"
                                  accept=".pdf"
                                  onChange={(e) => handlePdfSelect(category.key, item.key, e.target.files[0])}
                                  className="flex-1 border-2 border-purple-200 focus:border-purple-500"
                                />
                                {pdfSubmissions[`${category.key}_${item.key}`] && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removePdfSelection(category.key, item.key)}
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                              
                              {/* Selected PDF Display */}
                              {pdfSubmissions[`${category.key}_${item.key}`] && (
                                <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-green-200 dark:border-green-700">
                                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-sm font-medium">{pdfSubmissions[`${category.key}_${item.key}`].name}</span>
                                    <span className="text-xs text-green-600 dark:text-green-400">
                                      ({(pdfSubmissions[`${category.key}_${item.key}`].size / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                  </div>
                                  
                                  {/* Title and Description Inputs */}
                                  <div className="mt-3 space-y-2">
                                    <Input
                                      placeholder="Achievement Title"
                                      value={submissionTitles[`${category.key}_${item.key}`] || ''}
                                      onChange={(e) => setSubmissionTitles(prev => ({
                                        ...prev,
                                        [`${category.key}_${item.key}`]: e.target.value
                                      }))}
                                      className="border-2 border-green-200 focus:border-green-500"
                                    />
                                    <Textarea
                                      placeholder="Brief description of the achievement"
                                      value={submissionDescriptions[`${category.key}_${item.key}`] || ''}
                                      onChange={(e) => setSubmissionDescriptions(prev => ({
                                        ...prev,
                                        [`${category.key}_${item.key}`]: e.target.value
                                      }))}
                                      className="border-2 border-green-200 focus:border-green-500 min-h-[60px]"
                                    />
                                  </div>
                                  
                                  {/* Submit Button */}
                                  <Button
                                    onClick={() => handlePdfSubmit(category.key, item.key)}
                                    disabled={isUploading}
                                    className="w-full mt-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                                  >
                                    {isUploading ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Uploading...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Submit Achievement
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievement Summary Card */}
        <Card className="shadow-xl border border-purple-200 dark:border-purple-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Achievement Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{faculty.patents}</div>
                <div className="text-sm text-purple-600">Patents</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{faculty.journalpublications}</div>
                <div className="text-sm text-blue-600">Publications</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">{faculty.studentprojects}</div>
                <div className="text-sm text-green-600">Projects</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{faculty.industrycollabs}</div>
                <div className="text-sm text-orange-600">Industry</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Pass Percentage & Effective Mentoring */}
        <Card className="shadow-xl border border-purple-200 dark:border-purple-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              <GraduationCap className="w-5 h-5 text-purple-500" />
              Academic & Mentoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-purple-700 dark:text-purple-300">Academic Pass Percentage</Label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={editedFaculty.academicpasspercentage ?? '90%'}
                    onChange={e => updateField('academicpasspercentage', e.target.value)}
                    className="w-24 text-right border-2 border-purple-200 focus:border-purple-500"
                  />
                ) : (
                  <Badge variant="secondary" className="text-lg font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    {faculty.academicpasspercentage ?? '90%'}
                  </Badge>
                )}
              </div>
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium text-purple-700 dark:text-purple-300">Effective Mentoring</Label>
                {isEditing ? (
                  <Input
                    type="text"
                    value={editedFaculty.effectivementoring ?? 'Yes'}
                    onChange={e => updateField('effectivementoring', e.target.value)}
                    className="w-24 text-right border-2 border-purple-200 focus:border-purple-500"
                  />
                ) : (
                  <Badge variant="secondary" className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                    {faculty.effectivementoring ?? 'Yes'}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacultyDetailView;