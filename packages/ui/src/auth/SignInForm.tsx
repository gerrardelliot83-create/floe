import React, { useState } from 'react';
import { useAuth } from './AuthContext';

interface SignInFormProps {
  onSuccess?: () => void;
  onToggleMode?: () => void;
  className?: string;
}

export function SignInForm({ onSuccess, onToggleMode, className = '' }: SignInFormProps) {
  const { signIn, signInWithMagicLink, signInWithProvider } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useMagicLink, setUseMagicLink] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (useMagicLink) {
        const { error } = await signInWithMagicLink(email);
        if (error) {
          setError(error.message);
        } else {
          setMagicLinkSent(true);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          onSuccess?.();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function handleProviderSignIn(provider: 'google' | 'apple' | 'github') {
    setLoading(true);
    setError('');

    try {
      const { error } = await signInWithProvider(provider);
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (magicLinkSent) {
    return (
      <div className={`max-w-sm mx-auto ${className}`}>
        <div className="text-center">
          <h2 className="text-xl font-light text-text-primary-light dark:text-text-primary-dark mb-md">
            Check your email
          </h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-lg">
            We've sent you a sign-in link at {email}
          </p>
          <button
            onClick={() => {
              setMagicLinkSent(false);
              setUseMagicLink(false);
              setEmail('');
            }}
            className="btn-ghost"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-sm mx-auto ${className}`}>
      <div className="mb-xl">
        <h1 className="text-2xl font-light text-text-primary-light dark:text-text-primary-dark mb-sm">
          Sign in
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark">
          Welcome back to Floe
        </p>
      </div>

      {error && (
        <div className="mb-lg p-sm bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-lg">
        <div>
          <label className="block text-text-primary-light dark:text-text-primary-dark text-sm mb-xs">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-minimal w-full"
            placeholder="your@email.com"
            required
            disabled={loading}
          />
        </div>

        {!useMagicLink && (
          <div>
            <label className="block text-text-primary-light dark:text-text-primary-dark text-sm mb-xs">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-minimal w-full"
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>
        )}

        <div className="space-y-sm">
          <button
            type="submit"
            disabled={loading || !email || (!useMagicLink && !password)}
            className="btn-primary w-full"
          >
            {loading ? 'Please wait...' : useMagicLink ? 'Send magic link' : 'Sign in'}
          </button>

          <button
            type="button"
            onClick={() => setUseMagicLink(!useMagicLink)}
            className="btn-ghost w-full"
            disabled={loading}
          >
            {useMagicLink ? 'Use password instead' : 'Use magic link instead'}
          </button>
        </div>
      </form>

      <div className="mt-xl">
        <div className="relative mb-lg">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-light dark:border-border-dark"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background-light dark:bg-background-dark px-sm text-text-tertiary-light dark:text-text-tertiary-dark">
              Or continue with
            </span>
          </div>
        </div>

        <div className="space-y-sm">
          <button
            onClick={() => handleProviderSignIn('google')}
            disabled={loading}
            className="btn-secondary w-full"
          >
            Continue with Google
          </button>

          <button
            onClick={() => handleProviderSignIn('github')}
            disabled={loading}
            className="btn-secondary w-full"
          >
            Continue with GitHub
          </button>
        </div>
      </div>

      {onToggleMode && (
        <div className="mt-xl text-center">
          <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            Don't have an account?{' '}
          </span>
          <button
            onClick={onToggleMode}
            className="text-text-primary-light dark:text-text-primary-dark text-sm underline"
            disabled={loading}
          >
            Sign up
          </button>
        </div>
      )}
    </div>
  );
}