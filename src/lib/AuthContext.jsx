import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isAuthPending, setIsAuthPending] = useState(false);
  const [authError, setAuthError] = useState(null);
  const authPendingRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoadingAuth(false);
      if (authPendingRef.current) {
        authPendingRef.current = false;
        setIsAuthPending(false);
      }
    });

    return unsubscribe;
  }, []);

  const register = async (email, password, displayName) => {
    authPendingRef.current = true;
    setIsAuthPending(true);
    try {
      setAuthError(null);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      
      return result.user;
    } catch (error) {
      authPendingRef.current = false;
      setIsAuthPending(false);
      setAuthError(error.message);
      throw error;
    }
  };

  const login = async (email, password) => {
    authPendingRef.current = true;
    setIsAuthPending(true);
    try {
      setAuthError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      authPendingRef.current = false;
      setIsAuthPending(false);
      setAuthError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    authPendingRef.current = true;
    setIsAuthPending(true);
    try {
      setAuthError(null);
      await signOut(auth);
    } catch (error) {
      authPendingRef.current = false;
      setIsAuthPending(false);
      setAuthError(error.message);
      throw error;
    }
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
