'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BackgroundProvider from '@/components/ui/BackgroundProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/lib/types/database';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState({
    name: '',
    workStyle: '25/5' as '45/15' | '25/5' | 'custom',
    dailyGoal: 4,
    primaryFocus: '',
    firstTask: '',
    preferredTime: 'morning'
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    // Save user preferences and create first task
    // In real app, this would save to Supabase
    localStorage.setItem('onboarded', 'true');
    localStorage.setItem('userPreferences', JSON.stringify(userData));
    
    if (userData.firstTask) {
      const task: Task = {
        id: Date.now().toString(),
        user_id: 'current-user',
        title: userData.firstTask,
        completed: false,
        priority: 'high',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      localStorage.setItem('tasks', JSON.stringify([...existingTasks, task]));
    }

    router.push('/dashboard');
  };

  const startQuickSession = () => {
    localStorage.setItem('onboarded', 'true');
    localStorage.setItem('quickStart', 'true');
    router.push('/timer');
  };

  const steps: OnboardingStep[] = [
    {
      id: 0,
      title: 'Welcome to Floe',
      subtitle: 'Your personal productivity companion',
      content: (
        <div className="text-center">
          <div className="mb-8">
            <div className="text-8xl mb-4">🚀</div>
            <p className="text-secondary mb-4">
              Floe helps you achieve deep focus through intelligent time management, 
              task organization, and mindful productivity practices.
            </p>
          </div>
          
          <div className="grid gap-4 mb-8">
            <div className="glass p-4 text-left">
              <h4 className="mb-2">⏱️ Pomodoro Timer</h4>
              <p className="text-sm text-secondary">
                Customizable focus sessions with smart breaks
              </p>
            </div>
            <div className="glass p-4 text-left">
              <h4 className="mb-2">📝 Smart Tasks</h4>
              <p className="text-sm text-secondary">
                Rich text editor with tags and priorities
              </p>
            </div>
            <div className="glass p-4 text-left">
              <h4 className="mb-2">📅 Deep Work Calendar</h4>
              <p className="text-sm text-secondary">
                Schedule and track your focus sessions
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={nextStep} className="btn-primary flex-1">
              Get Started
            </button>
            <button onClick={startQuickSession} className="glass-button flex-1">
              Quick Start
            </button>
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: 'Personalize Your Experience',
      subtitle: 'Tell us about yourself',
      content: (
        <div>
          <div className="mb-6">
            <label className="text-secondary text-sm mb-2 block">
              What should we call you?
            </label>
            <input
              type="text"
              placeholder="Enter your name..."
              className="glass-input w-full"
              value={userData.name}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label className="text-secondary text-sm mb-2 block">
              What&apos;s your primary focus area?
            </label>
            <input
              type="text"
              placeholder="e.g., Software Development, Writing, Studying..."
              className="glass-input w-full"
              value={userData.primaryFocus}
              onChange={(e) => setUserData({ ...userData, primaryFocus: e.target.value })}
            />
          </div>

          <div className="mb-6">
            <label className="text-secondary text-sm mb-2 block">
              When are you most productive?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['morning', 'afternoon', 'evening'].map((time) => (
                <button
                  key={time}
                  onClick={() => setUserData({ ...userData, preferredTime: time })}
                  className={`glass-button capitalize ${
                    userData.preferredTime === time ? 'border-primary bg-primary/10' : ''
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={previousStep} className="glass-button flex-1">
              Back
            </button>
            <button 
              onClick={nextStep} 
              className="btn-primary flex-1"
              disabled={!userData.name}
            >
              Continue
            </button>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: 'Choose Your Work Style',
      subtitle: 'Select your preferred focus session type',
      content: (
        <div>
          <div className="mb-6">
            <div className="flex-col gap-3">
              <button
                onClick={() => setUserData({ ...userData, workStyle: '25/5' })}
                className={`glass p-4 text-left transition-all ${
                  userData.workStyle === '25/5' ? 'border-primary bg-primary/10' : ''
                }`}
              >
                <div className="flex-between">
                  <div>
                    <h4>🎯 Classic Pomodoro</h4>
                    <p className="text-secondary text-sm mt-1">
                      25 minutes focus, 5 minutes break
                    </p>
                    <p className="text-xs text-tertiary mt-2">
                      Best for: Quick tasks, maintaining momentum
                    </p>
                  </div>
                  {userData.workStyle === '25/5' && (
                    <span className="text-primary text-2xl">✓</span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setUserData({ ...userData, workStyle: '45/15' })}
                className={`glass p-4 text-left transition-all ${
                  userData.workStyle === '45/15' ? 'border-primary bg-primary/10' : ''
                }`}
              >
                <div className="flex-between">
                  <div>
                    <h4>🧠 Deep Work</h4>
                    <p className="text-secondary text-sm mt-1">
                      45 minutes focus, 15 minutes break
                    </p>
                    <p className="text-xs text-tertiary mt-2">
                      Best for: Complex tasks, creative work
                    </p>
                  </div>
                  {userData.workStyle === '45/15' && (
                    <span className="text-primary text-2xl">✓</span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setUserData({ ...userData, workStyle: 'custom' })}
                className={`glass p-4 text-left transition-all ${
                  userData.workStyle === 'custom' ? 'border-primary bg-primary/10' : ''
                }`}
              >
                <div className="flex-between">
                  <div>
                    <h4>⚙️ Custom</h4>
                    <p className="text-secondary text-sm mt-1">
                      Set your own focus and break times
                    </p>
                    <p className="text-xs text-tertiary mt-2">
                      Best for: Personalized workflow
                    </p>
                  </div>
                  {userData.workStyle === 'custom' && (
                    <span className="text-primary text-2xl">✓</span>
                  )}
                </div>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-secondary text-sm mb-2 block">
              Daily session goal
            </label>
            <input
              type="number"
              min="1"
              max="12"
              className="glass-input w-full"
              value={userData.dailyGoal}
              onChange={(e) => setUserData({ ...userData, dailyGoal: parseInt(e.target.value) })}
            />
            <p className="text-xs text-tertiary mt-2">
              Aim for {userData.dailyGoal} focused work sessions per day
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={previousStep} className="glass-button flex-1">
              Back
            </button>
            <button onClick={nextStep} className="btn-primary flex-1">
              Continue
            </button>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: 'Create Your First Task',
      subtitle: 'What would you like to focus on today?',
      content: (
        <div>
          <div className="mb-6">
            <label className="text-secondary text-sm mb-2 block">
              What&apos;s your most important task today?
            </label>
            <input
              type="text"
              placeholder="e.g., Complete project proposal, Study for exam..."
              className="glass-input w-full"
              value={userData.firstTask}
              onChange={(e) => setUserData({ ...userData, firstTask: e.target.value })}
              autoFocus
            />
          </div>

          <div className="glass p-4 mb-6">
            <h4 className="mb-3">💡 Tips for effective tasks:</h4>
            <ul className="text-sm text-secondary space-y-2">
              <li>• Be specific and actionable</li>
              <li>• Break large projects into smaller tasks</li>
              <li>• Set clear outcomes you can measure</li>
              <li>• Focus on one task at a time</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button onClick={previousStep} className="glass-button flex-1">
              Back
            </button>
            <button 
              onClick={nextStep} 
              className="btn-primary flex-1"
            >
              {userData.firstTask ? 'Continue' : 'Skip for now'}
            </button>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "You're All Set!",
      subtitle: `Welcome aboard, ${userData.name || 'there'}!`,
      content: (
        <div className="text-center">
          <div className="text-8xl mb-6">🎉</div>
          
          <div className="mb-8">
            <p className="text-secondary mb-4">
              Your personalized workspace is ready. Here&apos;s what we&apos;ve set up for you:
            </p>
          </div>

          <div className="glass p-4 mb-6 text-left">
            <h4 className="mb-3">Your Configuration:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex-between">
                <span className="text-secondary">Work Style:</span>
                <span>{userData.workStyle === 'custom' ? 'Custom' : userData.workStyle}</span>
              </div>
              <div className="flex-between">
                <span className="text-secondary">Daily Goal:</span>
                <span>{userData.dailyGoal} sessions</span>
              </div>
              <div className="flex-between">
                <span className="text-secondary">Peak Time:</span>
                <span className="capitalize">{userData.preferredTime}</span>
              </div>
              {userData.firstTask && (
                <div className="flex-between">
                  <span className="text-secondary">First Task:</span>
                  <span className="text-primary">Ready to start!</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => {
                completeOnboarding();
                router.push('/timer');
              }}
              className="btn-primary flex-1"
            >
              🚀 Start First Session
            </button>
            <button 
              onClick={completeOnboarding}
              className="glass-button flex-1"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <BackgroundProvider>
      <div className="min-h-screen flex-center p-4">
        <div className="glass-card w-full max-w-2xl">
          <div className="mb-8">
            <div className="flex gap-2 justify-center mb-6">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    index <= currentStep ? 'bg-primary' : 'bg-glass-border'
                  }`}
                />
              ))}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-center mb-2">{steps[currentStep].title}</h2>
                <p className="text-center text-secondary">{steps[currentStep].subtitle}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {steps[currentStep].content}
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 text-center">
            <button 
              onClick={() => router.push('/dashboard')}
              className="text-sm text-tertiary hover:text-secondary transition-colors"
            >
              Skip onboarding →
            </button>
          </div>
        </div>
      </div>
    </BackgroundProvider>
  );
}