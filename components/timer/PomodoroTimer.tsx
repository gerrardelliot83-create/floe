'use client';

import { useState, useEffect, useRef } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';

interface TimerSession {
  type: '45/15' | '25/5' | 'custom';
  focusMinutes: number;
  breakMinutes: number;
  totalSessions: number;
}

export default function PomodoroTimer() {
  const [selectedSession, setSelectedSession] = useState<TimerSession>({
    type: '25/5',
    focusMinutes: 25,
    breakMinutes: 5,
    totalSessions: 4,
  });

  const [customFocus, setCustomFocus] = useState(45);
  const [customBreak, setCustomBreak] = useState(15);
  const [currentSession, setCurrentSession] = useState(1);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(selectedSession.focusMinutes * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sessions = [
    { type: '45/15' as const, focusMinutes: 45, breakMinutes: 15, totalSessions: 3 },
    { type: '25/5' as const, focusMinutes: 25, breakMinutes: 5, totalSessions: 4 },
    { type: 'custom' as const, focusMinutes: customFocus, breakMinutes: customBreak, totalSessions: 3 },
  ];

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
  }, [isActive, isPaused, isBreak, currentSession]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSessionComplete = () => {
    const audio = new Audio('/sounds/notification.mp3');
    audio.play().catch(() => {});

    if (isBreak) {
      if (currentSession >= selectedSession.totalSessions) {
        setIsActive(false);
        setCurrentSession(1);
        setIsBreak(false);
        setSecondsLeft(selectedSession.focusMinutes * 60);
        alert('All sessions complete! Great work!');
      } else {
        setIsBreak(false);
        setCurrentSession(currentSession + 1);
        setSecondsLeft(selectedSession.focusMinutes * 60);
      }
    } else {
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
    setCurrentSession(1);
    setSecondsLeft(selectedSession.focusMinutes * 60);
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

  return (
    <div className="flex-col gap-6 fade-in">
      <div className="flex-center mb-8">
        <div className="timer-circle">
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
              Session {currentSession} of {selectedSession.totalSessions}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-center gap-4 mb-8">
        {!isActive ? (
          <button onClick={startTimer} className="btn-primary">
            Start Session
          </button>
        ) : (
          <>
            <button onClick={pauseTimer} className="btn btn-ghost">
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button onClick={resetTimer} className="btn-secondary">
              Reset
            </button>
          </>
        )}
      </div>

      {!isActive && (
        <div className="card">
          <h3 className="mb-4">Session Type</h3>
          <div className="flex-col gap-3">
            {sessions.map((session) => (
              <button
                key={session.type}
                onClick={() => setSelectedSession(session)}
                className={`card p-4 text-left transition-all ${
                  selectedSession.type === session.type 
                    ? 'border-sunglow bg-surface' 
                    : ''
                }`}
              >
                <div className="flex-between">
                  <div>
                    <p className="font-semibold">
                      {session.type === 'custom' ? 'Custom' : session.type}
                    </p>
                    <p className="text-sm text-secondary">
                      {session.focusMinutes} min focus, {session.breakMinutes} min break
                    </p>
                  </div>
                  {selectedSession.type === session.type && (
                    <CheckIcon className="w-4 h-4 text-sunglow" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {selectedSession.type === 'custom' && (
            <div className="mt-4 p-4 card">
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
                    className="input w-full mt-1"
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
                    className="input w-full mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}