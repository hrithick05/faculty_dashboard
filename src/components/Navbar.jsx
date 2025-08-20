import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getCookie, setCookie } from "@/utils/cookies";
import { useNavigate } from 'react-router-dom';
import { useTheme } from "@/contexts/ThemeContext";
import { 
  Menu, 
  X, 
  User, 
  LogOut,
  Filter,
  Edit3,
  Award,
  Sun,
  Moon,
  RefreshCw
} from "lucide-react";


const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [loggedInFaculty, setLoggedInFaculty] = useState(null);
  const [isChangeFacultyIdOpen, setIsChangeFacultyIdOpen] = useState(false);
  const [newFacultyId, setNewFacultyId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isRefreshingCount, setIsRefreshingCount] = useState(false);
  const [hasNewSubmissions, setHasNewSubmissions] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const faculty = JSON.parse(localStorage.getItem('loggedInFaculty'));
    if (faculty) {
      setLoggedInFaculty(faculty);
    }
  }, []);

  // Fetch pending submissions count
  const fetchPendingCount = async () => {
    if (loggedInFaculty?.designation !== 'Head of Department') return;
    
    try {
      setIsRefreshingCount(true);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/achievements/pending-count`);
      if (response.ok) {
        const data = await response.json();
        const previousCount = pendingCount;
        setPendingCount(data.count || 0);
        
        // Show toast notification if count changed
        if (data.count !== previousCount) {
          if (data.count > previousCount) {
            setHasNewSubmissions(true);
            toast({
              title: "New submissions detected!",
              description: `${data.count - previousCount} new PDF(s) awaiting your review.`,
            });
            // Remove new submissions indicator after 5 seconds
            setTimeout(() => setHasNewSubmissions(false), 5000);
          } else if (data.count < previousCount) {
            setHasNewSubmissions(false);
            toast({
              title: "Submissions updated",
              description: `Pending count updated: ${data.count} submission(s) remaining.`,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching pending count:', error);
      toast({
        title: "Error refreshing count",
        description: "Failed to fetch pending submissions count.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshingCount(false);
    }
  };

  // Fetch count on mount and set up interval
  useEffect(() => {
    if (loggedInFaculty?.designation === 'Head of Department') {
      fetchPendingCount();
      
      // Refresh count every 30 seconds
      const interval = setInterval(fetchPendingCount, 30000);
      
      // Refresh count when user returns to the tab
      const handleFocus = () => fetchPendingCount();
      window.addEventListener('focus', handleFocus);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('focus', handleFocus);
      };
    }
  }, [loggedInFaculty?.designation]);

  // Refresh count when navigating back to the navbar
  useEffect(() => {
    const handlePopState = () => {
      if (loggedInFaculty?.designation === 'Head of Department') {
        // Small delay to ensure the page has loaded
        setTimeout(fetchPendingCount, 100);
      }
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [loggedInFaculty?.designation]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInFaculty');
    navigate('/login');
  };

  const handleChangeFacultyId = async () => {
    if (!newFacultyId.trim()) {
      alert('Please enter a new Faculty ID');
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/faculty/change-faculty-id`, {
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
    <nav className={`${theme === 'dark' ? 'bg-gray-900 shadow-lg border-b border-gray-700' : 'bg-white shadow-sm border-b border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Faculty Dashboard</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* HOD Review Button - Only show for HODs */}
            {loggedInFaculty?.designation === 'Head of Department' && (
              <div className="relative group">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    fetchPendingCount(); // Refresh count before navigating
                    navigate('/hod-review');
                  }}
                  className="bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300"
                >
                  <Award className="w-4 h-4 mr-2" />
                  HOD Review
                  {pendingCount > 0 && (
                    <span 
                      className={`ml-2 px-2 py-1 text-white text-xs rounded-full ${
                        hasNewSubmissions 
                          ? 'bg-red-600 animate-pulse' 
                          : pendingCount > 5 
                            ? 'bg-orange-500' 
                            : 'bg-red-500'
                      }`}
                      aria-label={`${pendingCount} pending submission${pendingCount > 1 ? 's' : ''} awaiting review`}
                    >
                      {pendingCount}
                    </span>
                  )}
                </Button>
                {/* Refresh button that appears on hover */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchPendingCount();
                  }}
                  className="absolute -top-1 -right-1 w-6 h-6 p-0 bg-blue-500 hover:bg-blue-600 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  title="Refresh pending count"
                  disabled={isRefreshingCount}
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingCount ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            )}



            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className={`${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>

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
        <div className={`md:hidden ${theme === 'dark' ? 'bg-gray-900 border-t border-gray-700' : 'bg-white border-t border-gray-200'}`}>
          <div className="px-4 py-6 space-y-4">
            {/* HOD Review Button - Only show for HODs */}
            {loggedInFaculty?.designation === 'Head of Department' && (
              <div className="flex items-center justify-between w-full">
                <Button 
                  variant="ghost" 
                  className="flex-1 justify-start py-4 rounded-xl"
                  onClick={() => {
                    fetchPendingCount(); // Refresh count before navigating
                    navigate('/hod-review');
                  }}
                >
                  <div className="p-2 rounded-lg bg-orange-50">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="ml-3">HOD Review</span>
                  {pendingCount > 0 && (
                    <span 
                      className={`ml-2 px-2 py-1 text-white text-xs rounded-full ${
                        hasNewSubmissions 
                          ? 'bg-red-600 animate-pulse' 
                          : pendingCount > 5 
                            ? 'bg-orange-500' 
                            : 'bg-red-500'
                      }`}
                      aria-label={`${pendingCount} pending submission${pendingCount > 1 ? 's' : ''} awaiting review`}
                    >
                      {pendingCount}
                    </span>
                  )}
                </Button>
                {/* Mobile refresh button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchPendingCount}
                  className="ml-2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  title="Refresh pending count"
                  disabled={isRefreshingCount}
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshingCount ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            )}



            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              className={`w-full justify-start py-4 rounded-xl ${theme === 'dark' ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
              onClick={toggleTheme}
            >
              <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                {theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </div>
              <span className="ml-3">
                Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
              </span>
            </Button>

            {/* User Info */}
            <div className={`pt-4 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center space-x-3 pb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{loggedInFaculty?.name || 'User'}</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{loggedInFaculty?.designation || 'Faculty'}</p>
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
          <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 w-full max-w-md mx-4`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Change Faculty ID</h2>
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
                <Label htmlFor="currentFacultyId" className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Current Faculty ID
                </Label>
                <Input
                  id="currentFacultyId"
                  value={loggedInFaculty?.id || ''}
                  disabled
                  className={`mt-1 ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-gray-50'}`}
                />
              </div>
              
              <div>
                <Label htmlFor="newFacultyId" className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  New Faculty ID
                </Label>
                <Input
                  id="newFacultyId"
                  type="text"
                  value={newFacultyId}
                  onChange={(e) => setNewFacultyId(e.target.value)}
                  placeholder="Enter new Faculty ID"
                  className={`mt-1 ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : ''}`}
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
