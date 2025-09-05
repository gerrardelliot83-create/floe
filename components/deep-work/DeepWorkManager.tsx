'use client';

import { useState, useEffect } from 'react';
import useStore from '@/lib/store';
import SessionPlanning from './SessionPlanning';
import EnhancedFocusMode from './EnhancedFocusMode';
import SessionReview from './SessionReview';
import { DeepWorkSession } from '@/lib/types/session.types';
import { 
  PlayIcon, 
  ClockIcon, 
  ChartBarIcon, 
  SparklesIcon,
  CalendarIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

export default function DeepWorkManager() {
  const { sessions, startSession, endSession, user } = useStore();
  const [showPlanning, setShowPlanning] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [sessionNotes, setSessionNotes] = useState('');

  // Calculate stats
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  
  const todaySessions = sessions.history.filter(s => 
    s.startTime && new Date(s.startTime).toDateString() === today.toDateString()
  );
  
  const weekSessions = sessions.history.filter(s =>
    s.startTime && isWithinInterval(new Date(s.startTime), { start: weekStart, end: weekEnd })
  );

  const totalMinutesToday = todaySessions.reduce((total, s) => total + (s.duration || 0), 0);
  const totalMinutesWeek = weekSessions.reduce((total, s) => total + (s.duration || 0), 0);
  const averageCompletionRate = sessions.history.length > 0
    ? sessions.history.reduce((sum, s) => sum + (s.stats?.completionRate || 0), 0) / sessions.history.length
    : 0;

  const handleStartSession = (config: any) => {
    const newSession: DeepWorkSession = {
      id: Date.now().toString(),
      userId: user?.id || '',
      startTime: new Date().toISOString(),
      duration: config.duration,
      breakDuration: config.breakDuration,
      taskIds: config.taskIds,
      focusType: config.focusType,
      goal: config.sessionGoal,
      status: 'active',
    };
    
    startSession(newSession);
    setShowPlanning(false);
  };

  const handleEndSession = () => {
    if (sessions.active) {
      setShowReview(true);
    }
  };

  const handleReviewComplete = () => {
    if (sessions.active) {
      endSession(sessions.active.id);
    }
    setShowReview(false);
    setCompletedTasks([]);
    setSessionNotes('');
  };

  // Quick start templates
  const quickStartTemplates = [
    {
      name: 'Quick Focus',
      duration: 25,
      icon: ClockIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      name: 'Deep Work',
      duration: 90,
      icon: SparklesIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      name: 'Power Hour',
      duration: 60,
      icon: TrophyIcon,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  if (sessions.active && !showReview) {
    return (
      <EnhancedFocusMode
        session={sessions.active}
        onEndSession={handleEndSession}
        onMinimize={() => {}}
      />
    );
  }

  if (showReview && sessions.active) {
    return (
      <SessionReview
        session={sessions.active}
        completedTasks={completedTasks}
        notes={sessionNotes}
        onClose={handleReviewComplete}
      />
    );
  }

  if (showPlanning) {
    return (
      <SessionPlanning
        onStartSession={handleStartSession}
        onClose={() => setShowPlanning(false)}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Deep Work</h1>
        <p className="text-secondary">Focus deeply, work meaningfully</p>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <ClockIcon className="w-5 h-5 text-sunglow" />
            <span className="text-xs text-secondary">Today</span>
          </div>
          <div className="text-2xl font-bold text-primary">{totalMinutesToday} min</div>
          <div className="text-sm text-secondary">{todaySessions.length} sessions</div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <CalendarIcon className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-secondary">This Week</span>
          </div>
          <div className="text-2xl font-bold text-primary">{Math.round(totalMinutesWeek / 60)}h</div>
          <div className="text-sm text-secondary">{weekSessions.length} sessions</div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <ChartBarIcon className="w-5 h-5 text-green-500" />
            <span className="text-xs text-secondary">Avg Completion</span>
          </div>
          <div className="text-2xl font-bold text-primary">{Math.round(averageCompletionRate)}%</div>
          <div className="text-sm text-secondary">Task success rate</div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <TrophyIcon className="w-5 h-5 text-amber-500" />
            <span className="text-xs text-secondary">Current Streak</span>
          </div>
          <div className="text-2xl font-bold text-primary">{sessions.streak || 0}</div>
          <div className="text-sm text-secondary">Consecutive days</div>
        </div>
      </div>

      {/* Quick Start */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-primary mb-4">Quick Start</h2>
        <div className="grid grid-cols-3 gap-4">
          {quickStartTemplates.map(template => (
            <button
              key={template.name}
              onClick={() => {
                handleStartSession({
                  duration: template.duration,
                  breakDuration: 5,
                  taskIds: [],
                  focusType: 'deep',
                });
              }}
              className="p-6 card hover:border-sunglow transition-all group"
            >
              <template.icon className={`w-8 h-8 ${template.color} mb-3`} />
              <h3 className="font-medium text-primary mb-1">{template.name}</h3>
              <p className="text-sm text-secondary">{template.duration} minutes</p>
              <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-sunglow">Start Now →</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Plan Custom Session */}
      <div className="text-center">
        <button
          onClick={() => setShowPlanning(true)}
          className="btn btn-primary btn-lg inline-flex items-center gap-2"
        >
          <PlayIcon className="w-5 h-5" />
          Plan Custom Session
        </button>
        <p className="text-sm text-secondary mt-2">
          Select tasks, set duration, and customize your focus session
        </p>
      </div>

      {/* Recent Sessions */}
      {sessions.history.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-primary mb-4">Recent Sessions</h2>
          <div className="space-y-3">
            {sessions.history.slice(0, 5).map(session => (
              <div key={session.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium text-primary">
                    {session.goal || `${session.focusType} Session`}
                  </p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-secondary">
                    <span>{format(new Date(session.startTime), 'MMM d, h:mm a')}</span>
                    <span>{session.duration} min</span>
                    {session.completedTaskIds && (
                      <span>{session.completedTaskIds.length} tasks completed</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.stats?.focusScore && (
                    <div className="text-right">
                      <div className="text-xl font-semibold text-primary">
                        {session.stats.focusScore}
                      </div>
                      <div className="text-xs text-secondary">Focus Score</div>
                    </div>
                  )}
                  {session.review?.rating && (
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < session.review.rating ? 'text-sunglow' : 'text-gray-300'}>
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}