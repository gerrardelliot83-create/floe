'use client';

import { useState, useEffect } from 'react';
import BackgroundProvider from '@/components/ui/BackgroundProvider';
import Navigation from '@/components/ui/Navigation';
import Link from 'next/link';
import { useStreaks } from '@/lib/hooks/useStreaks';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { streak, getStreakStatus, calculateLevel } = useStreaks();
  const [todaySessions, setTodaySessions] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [userName, setUserName] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Get user preferences
    const preferences = localStorage.getItem('userPreferences');
    if (preferences) {
      const data = JSON.parse(preferences);
      setUserName(data.name || '');
    }

    // Calculate today's sessions
    const sessions = JSON.parse(localStorage.getItem('todaySessions') || '[]');
    const today = new Date().toDateString();
    const todaySessionCount = sessions.filter((s: any) => 
      new Date(s.date).toDateString() === today
    ).length;
    setTodaySessions(todaySessionCount);

    // Count completed tasks
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const completed = tasks.filter((t: any) => t.completed).length;
    setTasksCompleted(completed);

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const streakStatus = getStreakStatus();
  const level = calculateLevel();

  return (
    <BackgroundProvider>
      <div className="min-h-screen p-4">
        <Navigation />
        
        <div className="container">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card text-center mb-8"
          >
            <h1 className="mb-4">
              {greeting}{userName ? `, ${userName}` : ''}!
            </h1>
            <p className="text-secondary mb-2">
              {streakStatus.message}
            </p>
            <div className="flex-center gap-4 mt-4">
              <div className="text-sm">
                <span className="text-tertiary">Level </span>
                <span className="text-primary font-bold">{level.level}</span>
                <span className="text-tertiary"> • {level.title}</span>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <Link href="/timer" className="glass-card glass-hover text-center">
              <div className="text-6xl mb-4">⏱️</div>
              <h3 className="mb-2">Pomodoro Timer</h3>
              <p className="text-secondary">Start a focused work session</p>
            </Link>

            <Link href="/tasks" className="glass-card glass-hover text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="mb-2">Task Manager</h3>
              <p className="text-secondary">Organize and track your tasks</p>
            </Link>

            <Link href="/calendar" className="glass-card glass-hover text-center">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="mb-2">Calendar</h3>
              <p className="text-secondary">Schedule your deep work sessions</p>
            </Link>
          </div>

          <div className="glass-card mt-8">
            <h3 className="mb-4">Today's Progress</h3>
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="glass p-4 text-center"
              >
                <div className="text-3xl font-bold text-primary mb-2">
                  {todaySessions}
                </div>
                <p className="text-secondary text-sm">Sessions Today</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="glass p-4 text-center"
              >
                <div className="text-3xl font-bold text-accent mb-2">
                  {tasksCompleted}
                </div>
                <p className="text-secondary text-sm">Tasks Completed</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="glass p-4 text-center"
              >
                <div className="text-3xl font-bold text-warning mb-2">
                  {streak.current_streak}🔥
                </div>
                <p className="text-secondary text-sm">Day Streak</p>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="glass p-4 text-center"
              >
                <div className="text-3xl font-bold text-success mb-2">
                  {Math.floor(streak.total_focus_minutes / 60)}h
                </div>
                <p className="text-secondary text-sm">Total Focus Time</p>
              </motion.div>
            </div>
          </div>

          <div className="grid gap-6 mt-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <div className="glass-card">
              <h4 className="mb-3">Quick Actions</h4>
              <div className="flex-col gap-3">
                <Link href="/timer" className="glass-button w-full text-left">
                  🚀 Start Quick Session
                </Link>
                <Link href="/tasks" className="glass-button w-full text-left">
                  ➕ Add New Task
                </Link>
                <Link href="/calendar" className="glass-button w-full text-left">
                  📅 Schedule Session
                </Link>
              </div>
            </div>

            <div className="glass-card">
              <h4 className="mb-3">Recent Activity</h4>
              <div className="text-sm text-secondary">
                <p className="mb-2">• No recent activity</p>
                <p className="text-xs text-tertiary mt-3">
                  Start a focus session to see your activity here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundProvider>
  );
}