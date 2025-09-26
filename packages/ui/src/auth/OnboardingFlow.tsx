'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthContext';

interface OnboardingFlowProps {
  onComplete?: () => void;
  className?: string;
}

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Floe',
    description: 'Your privacy-focused knowledge management system'
  },
  {
    id: 'profile',
    title: 'Set up your profile',
    description: 'Tell us a bit about yourself'
  },
  {
    id: 'preferences',
    title: 'Customize your experience',
    description: 'Configure your preferences'
  },
  {
    id: 'complete',
    title: 'You\'re all set!',
    description: 'Start organizing your knowledge'
  }
];

export function OnboardingFlow({ onComplete, className = '' }: OnboardingFlowProps) {
  const { profile, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    preferences: {
      theme: 'system' as 'light' | 'dark' | 'system',
      language: 'en',
      emailNotifications: true,
      aiProcessing: true,
      searchHistory: true
    }
  });

  const step = ONBOARDING_STEPS[currentStep];

  async function handleNext() {
    if (currentStep === ONBOARDING_STEPS.length - 1) {
      // Complete onboarding
      setLoading(true);
      try {
        await updateProfile({
          username: formData.username,
          preferences: formData.preferences,
          onboarding_completed: true
        });
        onComplete?.();
      } catch (error) {
        console.error('Error completing onboarding:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    setCurrentStep(prev => prev + 1);
  }

  function handleBack() {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }

  function updateFormData(updates: Partial<typeof formData>) {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  }

  function updatePreferences(updates: Partial<typeof formData.preferences>) {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...updates
      }
    }));
  }

  const renderStepContent = () => {
    switch (step.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-lg">
            <div className="text-6xl font-light text-text-primary-light dark:text-text-primary-dark">
              Floe
            </div>
            <div className="space-y-md max-w-md">
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                Floe automatically organizes your knowledge using AI, without manual
                tagging or folders. Your privacy is protected - your data stays yours.
              </p>
              <div className="space-y-xs text-text-tertiary-light dark:text-text-tertiary-dark text-sm">
                <div>✓ AI-powered organization</div>
                <div>✓ Privacy-first design</div>
                <div>✓ Ultra-minimalist interface</div>
                <div>✓ Cross-platform sync</div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-lg max-w-sm">
            <div>
              <label className="block text-text-primary-light dark:text-text-primary-dark text-sm mb-xs">
                Username (optional)
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => updateFormData({ username: e.target.value })}
                className="input-minimal w-full"
                placeholder="Choose a username"
              />
              <p className="text-text-tertiary-light dark:text-text-tertiary-dark text-xs mt-xs">
                This will be your unique identifier. You can leave it empty.
              </p>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-lg max-w-sm">
            <div>
              <label className="block text-text-primary-light dark:text-text-primary-dark text-sm mb-sm">
                Theme
              </label>
              <div className="space-y-xs">
                {[
                  { value: 'system', label: 'System' },
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' }
                ].map(({ value, label }) => (
                  <label key={value} className="flex items-center space-x-sm">
                    <input
                      type="radio"
                      name="theme"
                      value={value}
                      checked={formData.preferences.theme === value}
                      onChange={(e) => updatePreferences({ theme: e.target.value as any })}
                      className="text-text-primary-light dark:text-text-primary-dark"
                    />
                    <span className="text-text-primary-light dark:text-text-primary-dark text-sm">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-sm">
              <label className="flex items-center space-x-sm">
                <input
                  type="checkbox"
                  checked={formData.preferences.aiProcessing}
                  onChange={(e) => updatePreferences({ aiProcessing: e.target.checked })}
                />
                <span className="text-text-primary-light dark:text-text-primary-dark text-sm">
                  Enable AI processing
                </span>
              </label>
              <p className="text-text-tertiary-light dark:text-text-tertiary-dark text-xs ml-6">
                Automatically analyze and organize your content
              </p>

              <label className="flex items-center space-x-sm">
                <input
                  type="checkbox"
                  checked={formData.preferences.searchHistory}
                  onChange={(e) => updatePreferences({ searchHistory: e.target.checked })}
                />
                <span className="text-text-primary-light dark:text-text-primary-dark text-sm">
                  Keep search history
                </span>
              </label>

              <label className="flex items-center space-x-sm">
                <input
                  type="checkbox"
                  checked={formData.preferences.emailNotifications}
                  onChange={(e) => updatePreferences({ emailNotifications: e.target.checked })}
                />
                <span className="text-text-primary-light dark:text-text-primary-dark text-sm">
                  Email notifications
                </span>
              </label>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-lg">
            <div className="text-4xl">✓</div>
            <div className="space-y-md">
              <p className="text-text-primary-light dark:text-text-primary-dark">
                Welcome to Floe, {profile?.full_name?.split(' ')[0] || 'there'}!
              </p>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
                You're ready to start capturing and organizing your knowledge.
                Try adding your first note or article.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-background-light dark:bg-background-dark ${className}`}>
      <div className="container-minimal py-xxxl">
        <div className="max-w-2xl mx-auto">
          {/* Progress indicator */}
          <div className="mb-xxxl">
            <div className="flex justify-between items-center mb-sm">
              {ONBOARDING_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index <= currentStep
                      ? 'bg-text-primary-light dark:bg-text-primary-dark'
                      : 'bg-border-light dark:bg-border-dark'
                  }`}
                />
              ))}
            </div>
            <div className="text-text-tertiary-light dark:text-text-tertiary-dark text-xs text-center">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </div>
          </div>

          {/* Step content */}
          <div className="text-center mb-xxxl">
            <h1 className="text-2xl font-light text-text-primary-light dark:text-text-primary-dark mb-sm">
              {step.title}
            </h1>
            <p className="text-text-secondary-light dark:text-text-secondary-dark mb-xl">
              {step.description}
            </p>

            <div className="flex justify-center">
              {renderStepContent()}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`btn-ghost ${currentStep === 0 ? 'opacity-30' : ''}`}
            >
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Setting up...' : currentStep === ONBOARDING_STEPS.length - 1 ? 'Get started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}