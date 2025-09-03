'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import BackgroundProvider from '@/components/ui/BackgroundProvider';

export default function MagicLinkPage() {
  useEffect(() => {
    const checkEmail = () => {
      const email = localStorage.getItem('userEmail');
      if (email) {
        document.title = `Check ${email} - Floe`;
      }
    };
    checkEmail();
  }, []);

  return (
    <BackgroundProvider>
      <div className="min-h-screen flex-center">
        <div className="glass-card w-full max-w-md fade-in text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 flex-center">
              <svg
                className="w-full h-full"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  className="text-primary"
                />
              </svg>
            </div>
            <h2 className="mb-2">Check Your Email</h2>
            <p className="text-secondary">
              We've sent you a magic link to sign in to Floe
            </p>
          </div>

          <div className="glass p-4 mb-6">
            <p className="text-sm text-secondary mb-2">
              Didn't receive the email?
            </p>
            <ul className="text-sm text-secondary text-left">
              <li>• Check your spam folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• Wait a few moments and check again</li>
            </ul>
          </div>

          <Link href="/auth/login" className="btn-secondary w-full">
            Back to Login
          </Link>
        </div>
      </div>
    </BackgroundProvider>
  );
}