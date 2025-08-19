import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import AddFaculty from "./pages/AddFaculty";
import FacultyDetailView from "./components/FacultyDetailView";
import FacultyDetails from "./pages/FacultyDetails";
import LoginForm from "./components/LoginForm";
import TopPerformer from "./TopPerformer/TopPerformer";
import FacultyStats from "./TopPerformer/FacultyStats";
import HODReviewPanel from "./components/HODReviewPanel";
import Notifications from "./pages/Notifications";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { getCookie, setCookie, deleteCookie } from "./utils/cookies";
import { isCurrentUserHeadOfDepartment } from "./utils/roleCheck";

function ProtectedRoute({ children }) {
  // Check both localStorage and cookies for authentication
  const localStorageFaculty = localStorage.getItem("loggedInFaculty");
  const cookieFaculty = getCookie("loggedInFaculty");
  const sessionInfo = getCookie("sessionInfo");
  
  // Check if session has expired based on remember me preference
  if (sessionInfo && sessionInfo.loginTime) {
    const loginTime = new Date(sessionInfo.loginTime);
    const now = new Date();
    const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);
    
    // If session expired based on remember me preference
    if (daysDiff > (sessionInfo.rememberMe ? 30 : 1)) {
      // Clear expired session
      localStorage.removeItem("loggedInFaculty");
      deleteCookie("loggedInFaculty");
      deleteCookie("loginTimestamp");
      deleteCookie("sessionInfo");
      deleteCookie("lastActivity");
      return <Navigate to="/login" replace />;
    }
  }
  
  // If we have cookie data but not localStorage, restore to localStorage
  if (cookieFaculty && !localStorageFaculty) {
    localStorage.setItem("loggedInFaculty", JSON.stringify(cookieFaculty));
  }
  
  const isAuthenticated = localStorageFaculty || cookieFaculty;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function HeadOfDepartmentRoute({ children }) {
  const [isHeadOfDepartment, setIsHeadOfDepartment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check both localStorage and cookies for authentication
  const localStorageFaculty = localStorage.getItem("loggedInFaculty");
  const cookieFaculty = getCookie("loggedInFaculty");
  const sessionInfo = getCookie("sessionInfo");
  
  // Check if session has expired based on remember me preference
  if (sessionInfo && sessionInfo.loginTime) {
    const loginTime = new Date(sessionInfo.loginTime);
    const now = new Date();
    const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);
    
    // If session expired based on remember me preference
    if (daysDiff > (sessionInfo.rememberMe ? 30 : 1)) {
      // Clear expired session
      localStorage.removeItem("loggedInFaculty");
      deleteCookie("loggedInFaculty");
      deleteCookie("loginTimestamp");
      deleteCookie("sessionInfo");
      deleteCookie("lastActivity");
      return <Navigate to="/login" replace />;
    }
  }
  
  // If we have cookie data but not localStorage, restore to localStorage
  if (cookieFaculty && !localStorageFaculty) {
    localStorage.setItem("loggedInFaculty", JSON.stringify(cookieFaculty));
  }
  
  const isAuthenticated = localStorageFaculty || cookieFaculty;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check user's role from database
  useEffect(() => {
    async function checkUserRole() {
      try {
        setIsLoading(true);
        const isHead = await isCurrentUserHeadOfDepartment();
        setIsHeadOfDepartment(isHead);
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsHeadOfDepartment(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkUserRole();
  }, []);

  // Show loading while checking role
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }
  
  return isHeadOfDepartment ? children : <Navigate to="/dashboard" replace />;
}

const queryClient = new QueryClient();

// Component to conditionally render navbar and footer
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col">
      {!isLoginPage && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

const AppContent = () => {
  const { theme, toggleTheme } = useTheme();

  // Restore session from cookies on app load
  useEffect(() => {
    const cookieFaculty = getCookie("loggedInFaculty");
    const localStorageFaculty = localStorage.getItem("loggedInFaculty");
    const sessionInfo = getCookie("sessionInfo");
    
    // Check session validity
    if (sessionInfo && sessionInfo.loginTime) {
      const loginTime = new Date(sessionInfo.loginTime);
      const now = new Date();
      const daysDiff = (now - loginTime) / (1000 * 60 * 60 * 24);
      
      // If session expired, clear everything
      if (daysDiff > (sessionInfo.rememberMe ? 30 : 1)) {
        localStorage.removeItem("loggedInFaculty");
        deleteCookie("loggedInFaculty");
        deleteCookie("loginTimestamp");
        deleteCookie("sessionInfo");
        deleteCookie("lastActivity");
        return;
      }
    }
    
    // If we have valid cookie data but not localStorage, restore it
    if (cookieFaculty && !localStorageFaculty) {
      localStorage.setItem("loggedInFaculty", JSON.stringify(cookieFaculty));
    }
    
    // Update last activity timestamp if user is logged in
    if (cookieFaculty) {
      const expiryDays = sessionInfo?.rememberMe ? 30 : 1;
      setCookie("lastActivity", new Date().toISOString(), expiryDays);
    }
  }, []);

  return (
    <div className={theme}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <LayoutWrapper>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<LoginForm />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-faculty"
                  element={
                    <HeadOfDepartmentRoute>
                      <AddFaculty />
                    </HeadOfDepartmentRoute>
                  }
                />
                <Route
                  path="/details"
                  element={
                    <ProtectedRoute>
                      <FacultyDetailView />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faculty-details/:id"
                  element={
                    <ProtectedRoute>
                      <FacultyDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/top-performer"
                  element={
                    <ProtectedRoute>
                      <TopPerformer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/faculty-stats/:id"
                  element={
                    <ProtectedRoute>
                      <FacultyStats />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hod-review"
                  element={
                    <HeadOfDepartmentRoute>
                      <HODReviewPanel />
                    </HeadOfDepartmentRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </LayoutWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
};

export default App;