import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogOut, User, Award, BookOpen, Lightbulb, Users, Trophy, GraduationCap, Building, Edit } from "lucide-react";
import { useState } from 'react';
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
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedFaculty, setEditedFaculty] = useState(faculty);

  // If no faculty data, redirect to login
  if (!faculty || !faculty.id) {
    navigate('/login');
    return null;
  }

  const handleSave = () => {
    // Update both localStorage and cookies
    localStorage.setItem('loggedInFaculty', JSON.stringify(editedFaculty));
    setCookie('loggedInFaculty', editedFaculty, 7);
    
    setIsEditing(false);
    toast({
      title: "Success",
      description: "Your achievements have been updated successfully!",
    });
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

  const handleCancel = () => {
    setEditedFaculty(faculty);
    setIsEditing(false);
  };

  const updateField = (field, value) => {
    setEditedFaculty(prev => ({ ...prev, [field]: value }));
  };

  const achievementCategories = [
    {
      title: "Research & Development",
      icon: <Lightbulb className="w-5 h-5" />,
      items: [
        { key: 'rdproposalssangsation', label: 'R&D Proposals (Sangsation)', value: faculty.rdproposalssangsation },
        { key: 'rdproposalssubmition', label: 'R&D Proposals (Submition)', value: faculty.rdproposalssubmition },
        { key: 'rdfunding', label: 'R&D Funding (in lakhs)', value: faculty.rdfunding },
      ]
    },
    {
      title: "Publications",
      icon: <BookOpen className="w-5 h-5" />,
      items: [
        { key: 'journalpublications', label: 'Journal Publications', value: faculty.journalpublications },
        { key: 'journalscoauthor', label: 'Co-Author Publications', value: faculty.journalscoauthor },
        { key: 'bookpublications', label: 'Book Publications', value: faculty.bookpublications },
        { key: 'studentpublications', label: 'Student Publications', value: faculty.studentpublications },
      ]
    },
    {
      title: "Innovation & Patents",
      icon: <Award className="w-5 h-5" />,
      items: [
        { key: 'patents', label: 'Patents Filed', value: faculty.patents },
        { key: 'onlinecertifications', label: 'Online Certifications', value: faculty.onlinecertifications },
      ]
    },
    {
      title: "Student Engagement",
      icon: <Users className="w-5 h-5" />,
      items: [
        { key: 'studentprojects', label: 'Student Projects Guided', value: faculty.studentprojects },
      ]
    },
    {
      title: "Professional Development",
      icon: <GraduationCap className="w-5 h-5" />,
      items: [
        { key: 'fdpworks', label: 'FDP Works', value: faculty.fdpworks },
        { key: 'fdpworps', label: 'FDP Worps', value: faculty.fdpworps },
      ]
    },
    {
      title: "Industry & Others",
      icon: <Building className="w-5 h-5" />,
      items: [
        { key: 'industrycollabs', label: 'Industry Collaborations', value: faculty.industrycollabs },
        { key: 'otheractivities', label: 'Other Activities', value: faculty.otheractivities },
      ]
    }
  ];

  // Calculate total achievements from numeric fields only
  const totalAchievements = [
    faculty.rdproposalssangsation || 0,
    faculty.rdproposalssubmition || 0,
    faculty.rdfunding || 0,
    faculty.journalpublications || 0,
    faculty.journalscoauthor || 0,
    faculty.bookpublications || 0,
    faculty.studentpublications || 0,
    faculty.patents || 0,
    faculty.onlinecertifications || 0,
    faculty.studentprojects || 0,
    faculty.fdpworks || 0,
    faculty.fdpworps || 0,
    faculty.industrycollabs || 0,
    faculty.otheractivities || 0
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
                      value={editedFaculty.designation}
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
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Edit className="w-4 h-4 mr-2" />
                {isEditing ? 'Cancel Edit' : 'Edit Achievements'}
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
          </div>
        </div>

        {/* Save/Cancel Buttons when editing */}
        {isEditing && (
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleCancel} className="border-2 border-purple-200 hover:border-purple-500">
              Cancel Changes
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
              Save Changes
            </Button>
          </div>
        )}

        {/* Achievement Categories */}
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
                    <div key={item.key} className="flex justify-between items-center">
                      <Label className="text-sm font-medium text-purple-700 dark:text-purple-300">{item.label}</Label>
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          value={editedFaculty[item.key]}
                          onChange={(e) => updateField(item.key, parseInt(e.target.value) || 0)}
                          className="w-20 text-right border-2 border-purple-200 focus:border-purple-500"
                        />
                      ) : (
                        <Badge variant="secondary" className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {item.value}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
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