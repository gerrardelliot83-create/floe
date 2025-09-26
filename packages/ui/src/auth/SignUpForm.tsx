import React, { useState } from 'react';
import { useAuth } from './AuthContext';

interface SignUpFormProps {
  onSuccess?: () => void;
  onToggleMode?: () => void;
  className?: string;
}

export function SignUpForm({ onSuccess, onToggleMode, className = '' }: SignUpFormProps) {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password, {
        full_name: fullName
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={`max-w-sm mx-auto ${className}`}>
        <div className="text-center">
          <h2 className="text-xl font-light text-text-primary-light dark:text-text-primary-dark mb-md">
            Check your email
          </h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mb-lg">
            We've sent you a confirmation link at {email}
          </p>
          <p className="text-text-tertiary-light dark:text-text-tertiary-dark text-sm">
            Click the link in your email to complete your account setup.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-sm mx-auto ${className}`}>
      <div className="mb-xl">
        <h1 className="text-2xl font-light text-text-primary-light dark:text-text-primary-dark mb-sm">
          Create account
        </h1>
        <p className="text-text-secondary-light dark:text-text-secondary-dark">
          Start organizing your knowledge
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
            Full name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-minimal w-full"
            placeholder="Your name"
            required
            disabled={loading}
          />
        </div>

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

        <div>
          <label className="block text-text-primary-light dark:text-text-primary-dark text-sm mb-xs">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-minimal w-full"
            placeholder="Create a password"
            required
            disabled={loading}
            minLength={8}
          />
          <p className="text-text-tertiary-light dark:text-text-tertiary-dark text-xs mt-xs">
            At least 8 characters
          </p>
        </div>

        <div>
          <label className="block text-text-primary-light dark:text-text-primary-dark text-sm mb-xs">
            Confirm password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-minimal w-full"
            placeholder="Confirm your password"
            required
            disabled={loading}
          />
        </div>

        <div className="space-y-sm">
          <button
            type="submit"
            disabled={loading || !email || !password || !confirmPassword || !fullName}
            className="btn-primary w-full"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </div>
      </form>

      <div className="mt-lg text-xs text-text-tertiary-light dark:text-text-tertiary-dark text-center">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
        Your data is private and never shared.
      </div>

      {onToggleMode && (
        <div className="mt-xl text-center">
          <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            Already have an account?{' '}
          </span>
          <button
            onClick={onToggleMode}
            className="text-text-primary-light dark:text-text-primary-dark text-sm underline"
            disabled={loading}
          >
            Sign in
          </button>
        </div>
      )}
    </div>
  );
}