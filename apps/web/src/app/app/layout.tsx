'use client';

import { AuthProvider, ProtectedRoute } from '@floe/ui/auth/AuthContext';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute requireOnboarding={true}>
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
          {children}
        </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}