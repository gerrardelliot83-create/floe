'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignUpForm } from '@floe/ui/auth/SignUpForm';
import { SignInForm } from '@floe/ui/auth/SignInForm';

export default function SignUpPage() {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/app');
  };

  const toggleMode = () => {
    setMode(prev => prev === 'signup' ? 'signin' : 'signup');
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="container-minimal py-xxxl">
        <div className="max-w-md mx-auto">
          {mode === 'signup' ? (
            <SignUpForm
              onSuccess={handleSuccess}
              onToggleMode={toggleMode}
            />
          ) : (
            <SignInForm
              onSuccess={handleSuccess}
              onToggleMode={toggleMode}
            />
          )}
        </div>
      </div>
    </div>
  );
}