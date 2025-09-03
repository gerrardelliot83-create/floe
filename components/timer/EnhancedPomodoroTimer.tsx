'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreaks } from '@/lib/hooks/useStreaks';
import { Task } from '@/lib/types/database';

interface TimerSession {
  type: '45/15' | '25/5' | 'custom';
  focusMinutes: number;
  breakMinutes: number;
  totalSessions: number;
  linkedTask?: Task;
}

const inspirationalQuotes = [
  { text: 'The secret to getting ahead is getting started.', author: 'Mark Twain' },
  { text: "Focus is a matter of deciding what things you're not going to do.", author: 'John Carmack' },
  { text: 'Deep work is the ability to focus without distraction on a cognitively demanding task.', author: 'Cal Newport' },
  { text: 'You are never too old to set another goal or to dream a new dream.', author: 'C.S. Lewis' },
  { text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney' }
];

export default function EnhancedPomodoroTimer() {
  const [selectedSession, setSelectedSession] = useState<TimerSession>({
    type: '25/5',
    focusMinutes: 25,
    breakMinutes: 5,
    totalSessions: 4,
  });

  const [customFocus, setCustomFocus] = useState(45);
  const [customBreak, setCustomBreak] = useState(15);
  const [currentSessionNum, setCurrentSessionNum] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(selectedSession.focusMinutes * 60);
  const [sessionNotes, setSessionNotes] = useState('');
  const [currentQuote, setCurrentQuote] = useState(inspirationalQuotes[0]);
  const [showSessionComplete, setShowSessionComplete] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { streak, updateStreak, calculateLevel } = useStreaks();

  const sessions = [
    { type: '45/15' as const, focusMinutes: 45, breakMinutes: 15, totalSessions: 3, name: 'Deep Work' },
    { type: '25/5' as const, focusMinutes: 25, breakMinutes: 5, totalSessions: 4, name: 'Pomodoro' },
    { type: 'custom' as const, focusMinutes: customFocus, breakMinutes: customBreak, totalSessions: 3, name: 'Custom' },
  ];

  useEffect(() => {
    // Load saved tasks from localStorage
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      // Tasks are available for selection
    }

    // Rotate quotes
    const quoteInterval = setInterval(() => {
      const randomQuote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)];
      setCurrentQuote(randomQuote);
    }, 30000); // Change every 30 seconds

    return () => clearInterval(quoteInterval);
  }, []);

  useEffect(() => {
    if (!isActive) {
      setSecondsLeft(selectedSession.focusMinutes * 60);
    }
  }, [selectedSession, isActive]);

  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((seconds) => {
          if (seconds <= 1) {
            handleSessionComplete();
            return 0;
          }
          return seconds - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, isBreak, currentSessionNum]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSessionComplete = () => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.play().catch(() => {});

    if (!isBreak) {
      // Complete focus session
      updateStreak(selectedSession.focusMinutes);
      setShowSessionComplete(true);
      setTimeout(() => setShowSessionComplete(false), 3000);
    }

    if (isBreak) {
      if (currentSessionNum >= selectedSession.totalSessions) {
        // All sessions complete
        setIsActive(false);
        setCurrentSessionNum(1);
        setIsBreak(false);
        setSecondsLeft(selectedSession.focusMinutes * 60);
        
        // Show completion modal
        alert('🎉 All sessions complete! Great work!');
      } else {
        // Start next focus session
        setIsBreak(false);
        setCurrentSessionNum(currentSessionNum + 1);
        setSecondsLeft(selectedSession.focusMinutes * 60);
      }
    } else {
      // Start break
      setIsBreak(true);
      setSecondsLeft(selectedSession.breakMinutes * 60);
    }
  };

  const startTimer = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const pauseTimer = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setIsBreak(false);
    setCurrentSessionNum(1);
    setSecondsLeft(selectedSession.focusMinutes * 60);
    setSessionNotes('');
  };

  const skipBreak = () => {
    if (isBreak) {
      setIsBreak(false);
      if (currentSessionNum >= selectedSession.totalSessions) {
        resetTimer();
      } else {
        setCurrentSessionNum(currentSessionNum + 1);
        setSecondsLeft(selectedSession.focusMinutes * 60);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalSeconds = isBreak 
    ? selectedSession.breakMinutes * 60 
    : selectedSession.focusMinutes * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const level = calculateLevel();

  return (
    <div className="flex-col gap-6 fade-in">
      {/* Quote Display */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentQuote.text}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="text-center mb-6"
        >
          <p className="text-secondary italic">&quot;{currentQuote.text}&quot;</p>
          <p className="text-sm text-tertiary mt-2">— {currentQuote.author}</p>
        </motion.div>
      </AnimatePresence>

      {/* Timer Circle */}
      <div className="flex-center mb-8">
        <div className="timer-circle relative">
          <svg className="timer-svg absolute inset-0" width="280" height="280">
            <circle
              cx="140"
              cy="140"
              r="120"
              className="timer-circle-bg"
            />
            <circle
              cx="140"
              cy="140"
              r="120"
              className="timer-circle-progress"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex-center flex-col">
            <p className="text-sm text-secondary mb-2">
              {isBreak ? 'BREAK' : 'FOCUS'}
            </p>
            <h1 className="text-5xl font-bold">{formatTime(secondsLeft)}</h1>
            <p className="text-sm text-secondary mt-2">
              Session {currentSessionNum} of {selectedSession.totalSessions}
            </p>
            {selectedSession.linkedTask && (
              <p className="text-xs text-primary mt-1">
                {selectedSession.linkedTask.title}
              </p>
            )}
          </div>

          {/* Session complete animation */}
          <AnimatePresence>
            {showSessionComplete && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex-center"
                style={{ pointerEvents: 'none' }}
              >
                <div className="text-6xl">✨</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="flex-center gap-4 mb-6">
        {!isActive ? (
          <button onClick={startTimer} className="btn-primary">
            Start Session
          </button>
        ) : (
          <>
            <button onClick={pauseTimer} className="glass-button">
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            {isBreak && (
              <button onClick={skipBreak} className="glass-button">
                Skip Break
              </button>
            )}
            <button onClick={resetTimer} className="btn-secondary">
              Reset
            </button>
          </>
        )}
      </div>

      {/* Streak & Stats */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        <div className="glass p-3 text-center">
          <div className="text-2xl mb-1">{streak.current_streak}🔥</div>
          <p className="text-xs text-secondary">Current Streak</p>
        </div>
        <div className="glass p-3 text-center">
          <div className="text-2xl mb-1">{level.title}</div>
          <p className="text-xs text-secondary">Level {level.level}</p>
        </div>
        <div className="glass p-3 text-center">
          <div className="text-2xl mb-1">{streak.total_sessions}</div>
          <p className="text-xs text-secondary">Total Sessions</p>
        </div>
        <div className="glass p-3 text-center">
          <div className="text-2xl mb-1">{Math.floor(streak.total_focus_minutes / 60)}h</div>
          <p className="text-xs text-secondary">Total Focus</p>
        </div>
      </div>

      {/* Session Configuration */}
      {!isActive && (
        <div className="glass-card">
          <h3 className="mb-4">Session Configuration</h3>
          
          {/* Session Type Selection */}
          <div className="flex-col gap-3 mb-4">
            {sessions.map((session) => (
              <button
                key={session.type}
                onClick={() => setSelectedSession({
                  ...session,
                  linkedTask: selectedSession.linkedTask
                })}
                className={`glass p-4 text-left transition-all ${
                  selectedSession.type === session.type 
                    ? 'border-primary bg-primary/10' 
                    : ''
                }`}
              >
                <div className="flex-between">
                  <div>
                    <p className="font-semibold">{session.name}</p>
                    <p className="text-sm text-secondary">
                      {session.focusMinutes} min focus, {session.breakMinutes} min break
                    </p>
                  </div>
                  {selectedSession.type === session.type && (
                    <span className="text-primary">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {selectedSession.type === 'custom' && (
            <div className="p-4 glass mb-4">
              <h4 className="mb-3">Custom Settings</h4>
              <div className="flex gap-4 mobile-flex-col">
                <div className="flex-1">
                  <label className="text-sm text-secondary">Focus (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={customFocus}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setCustomFocus(value);
                      setSelectedSession({
                        ...selectedSession,
                        focusMinutes: value,
                      });
                    }}
                    className="glass-input w-full mt-1"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-secondary">Break (min)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={customBreak}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setCustomBreak(value);
                      setSelectedSession({
                        ...selectedSession,
                        breakMinutes: value,
                      });
                    }}
                    className="glass-input w-full mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Session Notes */}
          <div className="mb-4">
            <label className="text-sm text-secondary">Session Notes (optional)</label>
            <textarea
              placeholder="What will you focus on during this session?"
              className="glass-input w-full mt-1"
              rows={3}
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Active Session Notes */}
      {isActive && sessionNotes && (
        <div className="glass p-4">
          <h4 className="mb-2">Session Focus:</h4>
          <p className="text-secondary">{sessionNotes}</p>
        </div>
      )}
    </div>
  );
}