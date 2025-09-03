'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import './onboarding.css';

interface OnboardingData {
  name: string;
  country: string;
  language: string;
  workStyle: '45/15' | '25/5' | 'custom';
  dailyGoal: number;
  primaryFocus: string;
  preferredTime: string;
  firstTask: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState<OnboardingData>({
    name: '',
    country: 'USA',
    language: 'English',
    workStyle: '25/5',
    dailyGoal: 4,
    primaryFocus: '',
    preferredTime: '',
    firstTask: '',
  });

  useEffect(() => {
    // Get name from localStorage if coming from signup
    const pendingName = localStorage.getItem('pendingUserName');
    if (pendingName) {
      setUserData(prev => ({ ...prev, name: pendingName }));
      localStorage.removeItem('pendingUserName');
    }
  }, []);

  const totalSteps = 5;

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const previousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    // Save user preferences
    localStorage.setItem('userPreferences', JSON.stringify(userData));
    
    // Set onboarding cookie for middleware
    document.cookie = 'onboarded=true; path=/; max-age=31536000'; // 1 year
    
    // Save first task if provided
    if (userData.firstTask) {
      const task = {
        id: Date.now().toString(),
        user_id: 'current-user',
        title: userData.firstTask,
        completed: false,
        priority: 'high' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      localStorage.setItem('tasks', JSON.stringify([...existingTasks, task]));
    }

    // Redirect to dashboard
    router.push('/dashboard');
  };

  const skipOnboarding = () => {
    document.cookie = 'onboarded=true; path=/; max-age=31536000';
    router.push('/dashboard');
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        {/* Progress Header */}
        <div className="onboarding-header">
          {currentStep > 1 && (
            <button onClick={previousStep} className="onboarding-back-btn">
              ←
            </button>
          )}
          <div className="onboarding-progress">
            {[...Array(totalSteps)].map((_, index) => (
              <div
                key={index}
                className={`progress-step ${
                  index < currentStep ? 'completed' : ''
                } ${index === currentStep - 1 ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="onboarding-content">
          {/* Left Side - Form */}
          <div className="onboarding-left">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="step-badge">Step 1 of {totalSteps}</div>
                  <h1 className="onboarding-title">
                    👋 Hi{userData.name ? `, ${userData.name.split(' ')[0]}` : ''}! What&apos;s your origin story?
                  </h1>
                  <p className="onboarding-subtitle">
                    Let&apos;s personalize your Floe experience. Don&apos;t worry, this only takes 2 minutes (we timed it).
                  </p>

                  <div className="onboarding-form">
                    {!userData.name && (
                      <div className="onboarding-input-group">
                        <label className="onboarding-label">What should we call you?</label>
                        <input
                          type="text"
                          className="onboarding-input"
                          placeholder="Your name"
                          value={userData.name}
                          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                          autoFocus
                        />
                      </div>
                    )}

                    <div className="onboarding-input-group">
                      <label className="onboarding-label">Which country do you live in?</label>
                      <select 
                        className="onboarding-select"
                        value={userData.country}
                        onChange={(e) => setUserData({ ...userData, country: e.target.value })}
                      >
                        <option value="USA">🇺🇸 United States</option>
                        <option value="UK">🇬🇧 United Kingdom</option>
                        <option value="Canada">🇨🇦 Canada</option>
                        <option value="Australia">🇦🇺 Australia</option>
                        <option value="Germany">🇩🇪 Germany</option>
                        <option value="France">🇫🇷 France</option>
                        <option value="Japan">🇯🇵 Japan</option>
                        <option value="India">🇮🇳 India</option>
                        <option value="Other">🌍 Other</option>
                      </select>
                    </div>

                    <div className="onboarding-input-group">
                      <label className="onboarding-label">What language(s) do you speak?</label>
                      <select 
                        className="onboarding-select"
                        value={userData.language}
                        onChange={(e) => setUserData({ ...userData, language: e.target.value })}
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Español</option>
                        <option value="French">Français</option>
                        <option value="German">Deutsch</option>
                        <option value="Japanese">日本語</option>
                        <option value="Chinese">中文</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <button onClick={nextStep} className="onboarding-continue-btn">
                      Continue →
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="step-badge">Step 2 of {totalSteps}</div>
                  <h1 className="onboarding-title">
                    🎯 What brings you to Floe?
                  </h1>
                  <p className="onboarding-subtitle">
                    Help us understand your productivity journey. What&apos;s your main focus area?
                  </p>

                  <div className="onboarding-form">
                    <div className="onboarding-input-group">
                      <input
                        type="text"
                        className="onboarding-input"
                        placeholder="e.g., Software Development, Writing, Design, Study..."
                        value={userData.primaryFocus}
                        onChange={(e) => setUserData({ ...userData, primaryFocus: e.target.value })}
                        autoFocus
                      />
                    </div>

                    <div className="choice-cards">
                      <div className="choice-card-title" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                        Popular Focus Areas:
                      </div>
                      {[
                        '💻 Programming & Development',
                        '✍️ Writing & Content Creation',
                        '🎨 Design & Creative Work',
                        '📚 Study & Research',
                        '💼 Business & Management',
                        '🎯 Personal Projects'
                      ].map((area) => (
                        <button
                          key={area}
                          className={`choice-card ${userData.primaryFocus === area.slice(2) ? 'selected' : ''}`}
                          onClick={() => setUserData({ ...userData, primaryFocus: area.slice(2) })}
                        >
                          <div className="choice-card-title">{area}</div>
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={nextStep} 
                      className="onboarding-continue-btn"
                      disabled={!userData.primaryFocus}
                    >
                      Continue →
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="step-badge">Step 3 of {totalSteps}</div>
                  <h1 className="onboarding-title">
                    ⏰ When do you do your best work?
                  </h1>
                  <p className="onboarding-subtitle">
                    We&apos;ll optimize your experience based on your peak productivity hours.
                  </p>

                  <div className="onboarding-form">
                    <div className="time-pills">
                      {[
                        '🌅 Early Bird (5-8 AM)',
                        '☀️ Morning (8-12 PM)',
                        '🌤️ Afternoon (12-5 PM)',
                        '🌆 Evening (5-9 PM)',
                        '🦉 Night Owl (9 PM-2 AM)',
                        '🎲 It varies'
                      ].map((time) => (
                        <button
                          key={time}
                          className={`time-pill ${userData.preferredTime === time ? 'selected' : ''}`}
                          onClick={() => setUserData({ ...userData, preferredTime: time })}
                        >
                          {time}
                        </button>
                      ))}
                    </div>

                    <button 
                      onClick={nextStep} 
                      className="onboarding-continue-btn"
                      disabled={!userData.preferredTime}
                      style={{ marginTop: '2rem' }}
                    >
                      Continue →
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="step-badge">Step 4 of {totalSteps}</div>
                  <h1 className="onboarding-title">
                    🚀 Choose your work rhythm
                  </h1>
                  <p className="onboarding-subtitle">
                    Different tasks need different focus styles. Which one resonates with you?
                  </p>

                  <div className="onboarding-form">
                    <div className="choice-cards">
                      <button
                        className={`choice-card ${userData.workStyle === '25/5' ? 'selected' : ''}`}
                        onClick={() => setUserData({ ...userData, workStyle: '25/5' })}
                      >
                        <div className="choice-card-title">🍅 Classic Pomodoro</div>
                        <div className="choice-card-description">
                          25 min focus, 5 min break • Perfect for maintaining momentum
                        </div>
                      </button>
                      
                      <button
                        className={`choice-card ${userData.workStyle === '45/15' ? 'selected' : ''}`}
                        onClick={() => setUserData({ ...userData, workStyle: '45/15' })}
                      >
                        <div className="choice-card-title">🧠 Deep Work</div>
                        <div className="choice-card-description">
                          45 min focus, 15 min break • Ideal for complex tasks
                        </div>
                      </button>
                      
                      <button
                        className={`choice-card ${userData.workStyle === 'custom' ? 'selected' : ''}`}
                        onClick={() => setUserData({ ...userData, workStyle: 'custom' })}
                      >
                        <div className="choice-card-title">⚙️ Flexible</div>
                        <div className="choice-card-description">
                          Customize per session • Adapt to your daily needs
                        </div>
                      </button>
                    </div>

                    <div className="onboarding-input-group" style={{ marginTop: '2rem' }}>
                      <label className="onboarding-label">
                        How many focus sessions do you want to complete daily?
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="12"
                        className="onboarding-input"
                        value={userData.dailyGoal}
                        onChange={(e) => setUserData({ ...userData, dailyGoal: parseInt(e.target.value) })}
                      />
                      <p className="text-xs text-tertiary mt-2">
                        Most users start with 4-6 sessions per day
                      </p>
                    </div>

                    <button onClick={nextStep} className="onboarding-continue-btn">
                      Continue →
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="step-badge">Last step!</div>
                  <h1 className="onboarding-title">
                    ✨ Let&apos;s start with your first win
                  </h1>
                  <p className="onboarding-subtitle">
                    What&apos;s one thing you want to accomplish today? We&apos;ll help you crush it!
                  </p>

                  <div className="onboarding-form">
                    <div className="onboarding-input-group">
                      <input
                        type="text"
                        className="onboarding-input"
                        placeholder="e.g., Finish project proposal, Write 500 words, Complete Chapter 3..."
                        value={userData.firstTask}
                        onChange={(e) => setUserData({ ...userData, firstTask: e.target.value })}
                        autoFocus
                      />
                    </div>

                    <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem' }}>
                      <p className="text-sm" style={{ color: '#0369a1' }}>
                        💡 <strong>Pro tip:</strong> Start with something you can complete in 1-2 focus sessions. 
                        Small wins build unstoppable momentum!
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                      <button 
                        onClick={completeOnboarding} 
                        className="onboarding-continue-btn"
                        style={{ flex: 1 }}
                      >
                        {userData.firstTask ? '🎯 Start Focusing!' : 'Skip & Explore'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side - Community Showcase */}
          <div className="onboarding-right">
            <div className="community-showcase">
              <div className="showcase-header">
                <span>🌍</span>
                <h3 className="showcase-title">Join 69,273+ members</h3>
              </div>
              
              <div className="showcase-members">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={i}
                    src={`https://i.pravatar.cc/96?img=${i + 10}`}
                    alt={`Member ${i}`}
                    className="member-avatar"
                  />
                ))}
              </div>

              <p className="text-sm text-secondary mb-3">
                Thousands of people from around the world have already joined the Floe community.
              </p>

              <div className="showcase-stats">
                <div className="stat-item">
                  <span className="stat-label">Total focus time</span>
                  <span className="stat-value">2.3M hours</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Tasks completed</span>
                  <span className="stat-value">847K+</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Average streak</span>
                  <span className="stat-value">12 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skip button */}
        {currentStep === 1 && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button onClick={skipOnboarding} className="onboarding-skip-btn">
              Skip onboarding →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}