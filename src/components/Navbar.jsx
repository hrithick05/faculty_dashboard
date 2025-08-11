import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Menu, 
  X, 
  Home, 
  BarChart3, 
  Users, 
  Award, 
  Info, 
  Settings, 
  LogOut, 
  User,
  Plus,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { getCookie, deleteCookie } from '../utils/cookies';
import { useTheme } from '../contexts/ThemeContext';
import { isCurrentUserHeadOfDepartment } from '../utils/roleCheck';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeadOfDepartment, setIsHeadOfDepartment] = useState(false);
  const [isLoadingRole, setIsLoadingRole] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('loggedInFaculty') || getCookie('loggedInFaculty');
  const loggedInFaculty = isLoggedIn ? 
    (localStorage.getItem('loggedInFaculty') ? 
      JSON.parse(localStorage.getItem('loggedInFaculty')) : 
      getCookie('loggedInFaculty')) : null;

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location.pathname]);

  // Check user's role from database
  useEffect(() => {
    async function checkUserRole() {
      console.log('🔍 Navbar: Checking user role...');
      console.log('  - isLoggedIn:', isLoggedIn);
      console.log('  - loggedInFaculty:', loggedInFaculty);
      
      if (isLoggedIn) {
        try {
          setIsLoadingRole(true);
          const isHead = await isCurrentUserHeadOfDepartment();
          console.log('  - Database isHeadOfDepartment result:', isHead);
          
          // If database check fails, try stored designation as fallback
          if (!isHead) {
            const storedIsHead = loggedInFaculty?.designation === 'Head of Department';
            console.log('  - Fallback isHeadOfDepartment result:', storedIsHead);
            setIsHeadOfDepartment(storedIsHead);
          } else {
            setIsHeadOfDepartment(isHead);
          }
        } catch (error) {
          console.error('❌ Error checking user role:', error);
          // Fallback to stored designation
          const storedIsHead = loggedInFaculty?.designation === 'Head of Department';
          console.log('  - Fallback after error:', storedIsHead);
          setIsHeadOfDepartment(storedIsHead);
        } finally {
          setIsLoadingRole(false);
        }
      } else {
        console.log('  - User not logged in');
        setIsHeadOfDepartment(false);
        setIsLoadingRole(false);
      }
    }

    checkUserRole();
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('loggedInFaculty');
    deleteCookie('loggedInFaculty');
    deleteCookie('loginTimestamp');
    deleteCookie('sessionInfo');
    deleteCookie('lastActivity');
    
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    
    navigate('/login');
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const navigationItems = [
    { name: 'About', href: '/about', icon: <Info className="w-4 h-4" /> },
    { name: 'Services', href: '/services', icon: <Settings className="w-4 h-4" /> },
    { name: 'Contact', href: '/contact', icon: <User className="w-4 h-4" /> },
  ];

  const dashboardItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'Top Performers', href: '/top-performer', icon: <Award className="w-4 h-4" /> },
  ];

  // Add Faculty item only for Head of Department (from database check)
  console.log('🔍 Navbar: Building dashboard items...');
  console.log('  - isHeadOfDepartment:', isHeadOfDepartment);
  console.log('  - isLoadingRole:', isLoadingRole);
  
  if (isHeadOfDepartment && !isLoadingRole) {
    console.log('✅ Adding "Add Faculty" to navigation');
    dashboardItems.push({ name: 'Add Faculty', href: '/add-faculty', icon: <Plus className="w-4 h-4" /> });
  } else {
    console.log('❌ NOT adding "Add Faculty" to navigation');
  }

  const isActive = (href) => location.pathname === href;

  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Faculty Dashboard
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Public Navigation */}
            {!isLoggedIn && (
              <>
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link to="/login">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Login
                  </Button>
                </Link>
              </>
            )}

            {/* Dashboard Navigation */}
            {isLoggedIn && (
              <>
                {dashboardItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="ml-2"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            {/* User Menu */}
            {isLoggedIn && (
              <div className="relative">
                <Button
                  variant="ghost"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:inline">
                    {loggedInFaculty?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>

                {isUserMenuOpen && (
                  <Card className="absolute right-0 mt-2 w-64 z-50 shadow-lg border-0">
                    <CardContent className="p-4">
                      <div className="px-3 py-2 text-sm text-muted-foreground border-b border-border pb-2">
                        <div className="font-medium">{loggedInFaculty?.name}</div>
                        <div className="text-xs">{loggedInFaculty?.designation}</div>
                      </div>
                      <div className="pt-2">
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
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-2">
            {/* Theme Toggle Mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            {/* Hamburger Menu */}
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden">
          <div className="px-4 pt-2 pb-6 space-y-2 bg-background/95 backdrop-blur border-t border-border">
            {/* User Info (if logged in) */}
            {isLoggedIn && (
              <div className="px-3 py-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{loggedInFaculty?.name}</div>
                    <div className="text-sm text-gray-600">{loggedInFaculty?.designation}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Public Navigation */}
            {!isLoggedIn && (
              <>
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                ))}
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    Login
                  </Button>
                </Link>
              </>
            )}

            {/* Dashboard Navigation */}
            {isLoggedIn && (
              <>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Dashboard
                </div>
                {dashboardItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                    {isActive(item.href) && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                ))}
                
                <div className="border-t border-border my-3"></div>
                
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
