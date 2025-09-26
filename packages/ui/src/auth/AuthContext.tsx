'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase } from '@floe/supabase';
import type { Profile } from '@floe/shared';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: AuthError }>;
  signIn: (email: string, password: string) => Promise<{ error?: AuthError }>;
  signInWithProvider: (provider: 'google' | 'apple' | 'github') => Promise<{ error?: AuthError }>;
  signInWithMagicLink: (email: string) => Promise<{ error?: AuthError }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: any }>;
  resetPassword: (email: string) => Promise<{ error?: AuthError }>;
  updatePassword: (password: string) => Promise<{ error?: AuthError }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

// Protected Route Component
export function ProtectedRoute({
  children,
  requireOnboarding = false
}: {
  children: ReactNode;
  requireOnboarding?: boolean;
}) {
  const { user, loading, profile } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to sign in if not authenticated
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/signin';
      }
    }

    if (!loading && user && requireOnboarding && profile && !profile.onboarding_completed) {
      // Redirect to onboarding if required and not completed
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/onboarding';
      }
    }
  }, [user, loading, profile, requireOnboarding]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }

      // Handle specific auth events
      if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, this is handled by the database trigger
        console.log('Profile will be created by database trigger');
        return;
      }

      if (error) {
        console.error('Error loading profile:', error);
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, metadata = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (data?.user && !error) {
      // User was created successfully
      setUser(data.user);
      if (data.session) {
        setSession(data.session);
      }
    }

    return { error: error || undefined };
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data?.user && !error) {
      setUser(data.user);
      if (data.session) {
        setSession(data.session);
      }
    }

    return { error: error || undefined };
  }

  async function signInWithProvider(provider: 'google' | 'apple' | 'github') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    return { error: error || undefined };
  }

  async function signInWithMagicLink(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    return { error: error || undefined };
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    if (!user) return { error: 'No user logged in' };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (!error && data) {
      setProfile(data);
    }

    return { error: error || undefined };
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    });

    return { error: error || undefined };
  }

  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({
      password
    });

    return { error: error || undefined };
  }

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signInWithProvider,
    signInWithMagicLink,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}