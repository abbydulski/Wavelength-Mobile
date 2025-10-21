import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as authUtils from '../lib/authUtils';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const profile = await authUtils.getCurrentUser(session.user.id);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const profile = await authUtils.getCurrentUser(session.user.id);
          setUserProfile(profile);
        } else {
          setUser(null);
          setUserProfile(null);
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const signup = async (email, password, displayName) => {
    try {
      const newUser = await authUtils.signup(email, password, displayName);
      setUser(newUser);
      const profile = await authUtils.getCurrentUser(newUser.id);
      setUserProfile(profile);
      return newUser;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const loggedInUser = await authUtils.login(email, password);
      setUser(loggedInUser);
      const profile = await authUtils.getCurrentUser(loggedInUser.id);
      setUserProfile(profile);
      return loggedInUser;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authUtils.logout();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
