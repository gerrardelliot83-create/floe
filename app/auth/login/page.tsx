'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import BackgroundProvider from '@/components/ui/BackgroundProvider';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      setMessage('Check your email for the login link!');
      setTimeout(() => {
        router.push('/auth/magic-link');
      }, 2000);
    } catch (error) {
      setMessage((error as Error).message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundProvider>
      <div className="min-h-screen flex-center">
        <div className="glass-card w-full max-w-md fade-in">
          <div className="text-center mb-8">
            <h1 className="mb-2">Welcome to Floe</h1>
            <p className="text-secondary">Transform your productivity</p>
          </div>

          <form onSubmit={handleMagicLinkLogin} className="flex-col gap-4">
            <div className="flex-col gap-2">
              <label htmlFor="email" className="text-secondary">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="glass-input w-full"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full mt-6"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Continue with Magic Link'}
            </button>

            {message && (
              <p className={`text-center mt-4 ${
                message.includes('error') ? 'text-error' : 'text-success'
              }`}>
                {message}
              </p>
            )}

            <div className="text-center mt-6">
              <p className="text-secondary">
                Don&apos;t have an account?{' '}
                <Link href="/auth/signup" className="text-primary">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </BackgroundProvider>
  );
}