import React from 'react';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireOnboarding?: boolean;
}

export function ProtectedRoute({
  children,
  fallback,
  requireOnboarding = false
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
          Loading...
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return fallback || (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-light text-text-primary-light dark:text-text-primary-dark mb-md">
            Sign in required
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-lg">
            Please sign in to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (requireOnboarding && !profile.onboarding_completed) {
    return fallback || (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-light text-text-primary-light dark:text-text-primary-dark mb-md">
            Complete setup
          </h1>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-lg">
            Please complete your profile setup to continue.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}