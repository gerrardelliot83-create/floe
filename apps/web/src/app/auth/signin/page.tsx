'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignInForm } from '@floe/ui/auth/SignInForm';
import { SignUpForm } from '@floe/ui/auth/SignUpForm';

export default function SignInPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/app');
  };

  const toggleMode = () => {
    setMode(prev => prev === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container-minimal py-xxxl">
        <div className="max-w-md mx-auto">
          {mode === 'signin' ? (
            <SignInForm
              onSuccess={handleSuccess}
              onToggleMode={toggleMode}
            />
          ) : (
            <SignUpForm
              onSuccess={handleSuccess}
              onToggleMode={toggleMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}