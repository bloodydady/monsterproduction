import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../App';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '../types/database';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data: { session: Session | null; user: User | null } | null;
  }>;
  signUp: (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ) => Promise<{
    error: Error | null;
    data: { session: Session | null; user: User | null } | null;
  }>;
  signOut: () => Promise<{ error: Error | null }>;
  loading: boolean;
  isAdmin: boolean;
  isMentor: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMentor, setIsMentor] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsMentor(false);
          setLoading(false);
        }
      }
    );

    // Cleanup subscription
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      setIsAdmin(data.role === 'admin');
      setIsMentor(data.role === 'mentor');
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };

  const value = {
    session,
    user,
    profile,
    signIn,
    signUp,
    signOut,
    loading,
    isAdmin,
    isMentor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};