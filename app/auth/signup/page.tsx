'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import '../auth.css';

const testimonials = [
  {
    quote: "I've tried every productivity app under the sun. Floe is the only one that stuck. The focus sessions are addictive in the best way possible!",
    author: "Alex Thompson",
    role: "Founder & CEO",
    company: "NextGen Startups"
  },
  {
    quote: "From scattered to structured in 30 days. Floe helped me finish my novel after years of procrastination. The streak system is pure genius!",
    author: "Jessica Lee",
    role: "Author & Content Creator",
    company: "Wordsmith Publishing"
  },
  {
    quote: "My ADHD brain finally found its match. The timer, tasks, and calendar combo keeps me on track without feeling overwhelming. Game changer!",
    author: "Ryan Foster",
    role: "UX Designer",
    company: "Digital Dreams Studio"
  },
  {
    quote: "Doubled my billable hours without burning out. Floe's deep work sessions are like a superpower for consultants. My clients are amazed!",
    author: "Priya Sharma",
    role: "Management Consultant",
    company: "Elite Advisory Group"
  }
];

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: name,
          }
        },
      });

      if (error) throw error;

      setMessage('Welcome aboard! Check your email to get started 🚀');
      
      // Store name temporarily for onboarding
      localStorage.setItem('pendingUserName', name);
      
      setTimeout(() => {
        router.push('/auth/magic-link');
      }, 2000);
    } catch (error) {
      setMessage((error as Error).message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="auth-container">
      <div className="auth-split-layout">
        {/* Left Form Section */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            {/* Tabs */}
            <div className="auth-tabs">
              <Link href="/auth/login" className="auth-tab">
                ✉️ Login
              </Link>
              <button className="auth-tab active">
                🚀 Sign Up
              </button>
            </div>

            {/* Welcome Text */}
            <h1 className="auth-title">Join the Focus Revolution!</h1>
            <p className="auth-subtitle">
              Where procrastinators become productivity ninjas. No cape required.
            </p>

            {/* Form */}
            <form onSubmit={handleSignup} className="auth-form">
              <div className="auth-input-group">
                <label htmlFor="name" className="auth-label">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="auth-input"
                  placeholder="Tony Stark"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="auth-input-group">
                <label htmlFor="email" className="auth-label">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  className="auth-input"
                  placeholder="you@awesome.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? '🚀 Launching...' : 'Start Your Free Journey'}
              </button>

              {message && (
                <p className={`text-center ${
                  message.includes('error') ? 'text-error' : 'text-success'
                }`}>
                  {message}
                </p>
              )}

              <div className="auth-divider">OR</div>

              <div className="auth-social-buttons">
                <button type="button" className="auth-social-btn" disabled>
                  <svg className="auth-social-icon" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </button>
                <button type="button" className="auth-social-btn" disabled>
                  <svg className="auth-social-icon" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.493-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33V21.88C18.343 21.128 22 16.991 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  Sign up with Apple
                </button>
              </div>

              <p className="auth-footer-text">
                Already crushing it?{' '}
                <Link href="/auth/login">
                  Log in here
                </Link>
              </p>

              <p className="text-xs text-center text-tertiary mt-4">
                By signing up, you agree to be awesome and maintain your focus streaks 🔥
              </p>
            </form>
          </div>
        </div>

        {/* Right Testimonial Section */}
        <div className="auth-testimonial-section">
          <div className="testimonial-carousel">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/backgrounds/bg-2.jpg" 
              alt="Background"
              className="testimonial-bg-image"
            />
            <div className="testimonial-overlay" />
            
            <div className="testimonial-content">
              <p className="testimonial-quote">
                &quot;{testimonials[currentTestimonial].quote}&quot;
              </p>
              <div>
                <p className="testimonial-author">
                  {testimonials[currentTestimonial].author}
                </p>
                <p className="testimonial-role">
                  {testimonials[currentTestimonial].role}
                </p>
                <p className="testimonial-company">
                  {testimonials[currentTestimonial].company}
                </p>
              </div>
            </div>

            <div className="testimonial-nav">
              <button 
                onClick={prevTestimonial}
                className="testimonial-nav-btn"
                type="button"
              >
                ←
              </button>
              <button 
                onClick={nextTestimonial}
                className="testimonial-nav-btn"
                type="button"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}