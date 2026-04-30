import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

const STORAGE_KEY = 'stratego-guest-user';

function createGuestUser() {
  const randomId = Math.random().toString(36).slice(2, 10);
  return {
    id: `guest-${randomId}`,
    name: `Guest ${randomId.toUpperCase()}`,
    email: `guest+${randomId}@stratego.local`,
  };
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to read guest user from storage', error);
    }
    const guestUser = createGuestUser();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser));
    return guestUser;
  });

  const [isAuthenticated] = useState(true);
  const [isLoadingAuth] = useState(false);
  const [isAuthPending] = useState(false);
  const [authError] = useState(null);

  const login = async () => {
    return user;
  };

  const register = async () => {
    return user;
  };

  const logout = async () => {
    window.localStorage.removeItem(STORAGE_KEY);
    const guestUser = createGuestUser();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
    return guestUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isAuthPending,
        authError,
        register,
        login,
        logout,
      }}
    >
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
