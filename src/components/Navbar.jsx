import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Menu, 
  X, 
  User, 
  LogOut,
  Bell,
  Filter,
  Edit3,
  Award
} from "lucide-react";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [loggedInFaculty, setLoggedInFaculty] = useState(null);
  const [isChangeFacultyIdOpen, setIsChangeFacultyIdOpen] = useState(false);
  const [newFacultyId, setNewFacultyId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const faculty = JSON.parse(localStorage.getItem('loggedInFaculty'));
    if (faculty) {
      setLoggedInFaculty(faculty);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInFaculty');
    window.location.href = '/login';
  };

  const handleChangeFacultyId = async () => {
    if (!newFacultyId.trim()) {
      alert('Please enter a new Faculty ID');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/faculty/change-faculty-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldFacultyId: loggedInFaculty.id,
          newFacultyId: newFacultyId.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local storage with new faculty ID
        const updatedFaculty = { ...loggedInFaculty, id: newFacultyId.trim() };
        localStorage.setItem('loggedInFaculty', JSON.stringify(updatedFaculty));
        setLoggedInFaculty(updatedFaculty);
        
        alert('Faculty ID updated successfully!');
        setIsChangeFacultyIdOpen(false);
        setNewFacultyId('');
      } else {
        alert(data.message || 'Failed to update Faculty ID');
      }
    } catch (error) {
      console.error('Error updating faculty ID:', error);
      alert('Error updating Faculty ID. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold text-gray-900">Faculty Dashboard</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* HOD Review Button - Only show for HODs */}
            {loggedInFaculty?.designation === 'Head of Department' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => window.location.href = '/hod-review'}
                className="bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300"
              >
                <Award className="w-4 h-4 mr-2" />
                HOD Review
              </Button>
            )}

            {/* User Menu */}
            <div className="relative">
              <Button
                variant="ghost"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2"
              >
                <User className="w-5 h-5" />
                <span className="hidden lg:block">{loggedInFaculty?.name || 'User'}</span>
              </Button>
              
              {isUserMenuOpen && (
                <Card className="absolute right-0 mt-2 w-64 z-50 shadow-lg border-0">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 pb-3 border-b border-gray-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{loggedInFaculty?.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{loggedInFaculty?.designation || 'Faculty'}</p>
                      </div>
                    </div>
                    <div className="pt-2 space-y-2">
                      <Button
                        variant="ghost"
                        onClick={() => setIsChangeFacultyIdOpen(true)}
                        className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Change Faculty ID
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-6 space-y-4">
            {/* HOD Review Button - Only show for HODs */}
            {loggedInFaculty?.designation === 'Head of Department' && (
              <Button 
                variant="ghost" 
                className="w-full justify-start py-4 rounded-xl"
                onClick={() => window.location.href = '/hod-review'}
              >
                <div className="p-2 rounded-lg bg-orange-50">
                  <Award className="w-4 h-4" />
                </div>
                <span className="ml-3">HOD Review</span>
              </Button>
            )}

            {/* User Info */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3 pb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{loggedInFaculty?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{loggedInFaculty?.designation || 'Faculty'}</p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                onClick={() => setIsChangeFacultyIdOpen(true)}
                className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-4 rounded-xl mb-2"
              >
                <div className="p-2 rounded-lg bg-blue-50">
                  <Edit3 className="w-4 h-4" />
                </div>
                <span className="ml-3">Change Faculty ID</span>
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 py-4 rounded-xl"
              >
                <div className="p-2 rounded-lg bg-red-50">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="ml-3">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Change Faculty ID Modal */}
      {isChangeFacultyIdOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Change Faculty ID</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsChangeFacultyIdOpen(false);
                  setNewFacultyId('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentFacultyId" className="text-sm font-medium text-gray-700">
                  Current Faculty ID
                </Label>
                <Input
                  id="currentFacultyId"
                  value={loggedInFaculty?.id || ''}
                  disabled
                  className="mt-1 bg-gray-50"
                />
              </div>
              
              <div>
                <Label htmlFor="newFacultyId" className="text-sm font-medium text-gray-700">
                  New Faculty ID
                </Label>
                <Input
                  id="newFacultyId"
                  type="text"
                  value={newFacultyId}
                  onChange={(e) => setNewFacultyId(e.target.value)}
                  placeholder="Enter new Faculty ID"
                  className="mt-1"
                />
              </div>
              
              <div className="flex space-x-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsChangeFacultyIdOpen(false);
                    setNewFacultyId('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleChangeFacultyId}
                  disabled={isLoading || !newFacultyId.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? 'Updating...' : 'Update Faculty ID'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
