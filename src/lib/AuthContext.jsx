import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ full_name: 'Anonymous User', email: 'anonymous@localhost' });
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Always authenticated locally
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // No auth check needed for local app
    setIsLoadingAuth(false);
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoadingAuth,
    authError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};