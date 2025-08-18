import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCookie, setCookie, deleteCookie } from "@/utils/cookies";

const AuthDebug = () => {
  const [authState, setAuthState] = useState({});
  const [localStorageData, setLocalStorageData] = useState({});
  const [cookieData, setCookieData] = useState({});

  const refreshAuthState = () => {
    // Check localStorage
    const loggedInFaculty = localStorage.getItem('loggedInFaculty');
    const sessionInfo = localStorage.getItem('sessionInfo');
    
    // Check cookies
    const cookieFaculty = getCookie('loggedInFaculty');
    const cookieSessionInfo = getCookie('sessionInfo');
    
    setLocalStorageData({
      loggedInFaculty: loggedInFaculty ? JSON.parse(loggedInFaculty) : null,
      sessionInfo: sessionInfo ? JSON.parse(sessionInfo) : null
    });
    
    setCookieData({
      loggedInFaculty: cookieFaculty,
      sessionInfo: cookieSessionInfo
    });
    
    setAuthState({
      hasLocalStorage: !!loggedInFaculty,
      hasCookie: !!cookieFaculty,
      isAuthenticated: !!(loggedInFaculty || cookieFaculty),
      facultyId: (loggedInFaculty ? JSON.parse(loggedInFaculty) : cookieFaculty)?.id || null,
      facultyName: (loggedInFaculty ? JSON.parse(loggedInFaculty) : cookieFaculty)?.name || null,
      designation: (loggedInFaculty ? JSON.parse(loggedInFaculty) : cookieFaculty)?.designation || null
    });
  };

  useEffect(() => {
    refreshAuthState();
  }, []);

  const clearAllAuth = () => {
    localStorage.removeItem('loggedInFaculty');
    localStorage.removeItem('sessionInfo');
    deleteCookie('loggedInFaculty');
    deleteCookie('sessionInfo');
    deleteCookie('loginTimestamp');
    deleteCookie('lastActivity');
    refreshAuthState();
  };

  const testHODRole = () => {
    const faculty = localStorage.getItem('loggedInFaculty') ? 
      JSON.parse(localStorage.getItem('loggedInFaculty')) : 
      getCookie('loggedInFaculty');
    
    if (!faculty) {
      alert('No faculty data found');
      return;
    }
    
    const designation = faculty.designation?.toLowerCase() || '';
    const isHOD = designation.includes('hod') || 
                   designation.includes('head') || 
                   designation.includes('chair') ||
                   designation.includes('professor') ||
                   designation.includes('director');
    
    alert(`Faculty: ${faculty.name}\nDesignation: ${faculty.designation}\nIs HOD: ${isHOD ? 'Yes' : 'No'}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Authentication Debug Panel
            <Badge variant={authState.isAuthenticated ? "default" : "destructive"}>
              {authState.isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Authentication Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Authentication Status</h4>
              <div className="text-sm space-y-1">
                <div>Has localStorage: <Badge variant={authState.hasLocalStorage ? "default" : "secondary"}>{authState.hasLocalStorage ? "Yes" : "No"}</Badge></div>
                <div>Has Cookie: <Badge variant={authState.hasCookie ? "default" : "secondary"}>{authState.hasCookie ? "Yes" : "No"}</Badge></div>
                <div>Faculty ID: <span className="font-mono">{authState.facultyId || "None"}</span></div>
                <div>Faculty Name: <span className="font-mono">{authState.facultyName || "None"}</span></div>
                <div>Designation: <span className="font-mono">{authState.designation || "None"}</span></div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Actions</h4>
              <div className="space-y-2">
                <Button onClick={refreshAuthState} variant="outline" size="sm">
                  🔄 Refresh State
                </Button>
                <Button onClick={testHODRole} variant="outline" size="sm">
                  🧪 Test HOD Role
                </Button>
                <Button onClick={clearAllAuth} variant="destructive" size="sm">
                  🗑️ Clear All Auth
                </Button>
              </div>
            </div>
          </div>

          {/* localStorage Data */}
          <div className="space-y-2">
            <h4 className="font-medium">localStorage Data</h4>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              <pre>{JSON.stringify(localStorageData, null, 2)}</pre>
            </div>
          </div>

          {/* Cookie Data */}
          <div className="space-y-2">
            <h4 className="font-medium">Cookie Data</h4>
            <div className="bg-gray-100 p-3 rounded text-sm font-mono">
              <pre>{JSON.stringify(cookieData, null, 2)}</pre>
            </div>
          </div>

          {/* Environment Info */}
          <div className="space-y-2">
            <h4 className="font-medium">Environment Info</h4>
            <div className="text-sm space-y-1">
              <div>Mode: <Badge variant="outline">{import.meta.env.MODE}</Badge></div>
              <div>API URL: <span className="font-mono">{import.meta.env.VITE_API_URL || "Not set"}</span></div>
              <div>Supabase URL: <span className="font-mono">{import.meta.env.VITE_SUPABASE_URL || "Not set"}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthDebug;
