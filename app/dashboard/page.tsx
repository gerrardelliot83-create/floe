'use client';

import { useState, useEffect } from 'react';
import UnifiedNavigation from '@/components/ui/UnifiedNavigation';
import Link from 'next/link';
import { useStreaks } from '@/lib/hooks/useStreaks';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  PlusIcon, 
  CalendarIcon, 
  ClockIcon,
  CheckCircleIcon,
  FireIcon,
  ChartBarIcon,
  ArrowRightIcon,
  BoltIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { streak, calculateLevel } = useStreaks();
  const [todaySessions, setTodaySessions] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [userName, setUserName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTimer] = useState(null);
  const [todayTasks, setTodayTasks] = useState<{ id: string; title: string; completed: boolean; priority: string; completedAt?: string }[]>([]);
  const [priorityTask, setPriorityTask] = useState<{ id: string; title: string; completed: boolean; priority: string; description?: string } | null>(null);

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
    const todaySessionCount = sessions.filter((s: { date: string }) => 
      new Date(s.date).toDateString() === today
    ).length;
    setTodaySessions(todaySessionCount);

    // Get tasks
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const activeTasks = tasks.filter((t: { completed: boolean }) => !t.completed);
    const completedToday = tasks.filter((t: { completed: boolean; completedAt?: string }) => {
      if (!t.completed || !t.completedAt) return false;
      const completedDate = new Date(t.completedAt);
      return completedDate.toDateString() === today;
    }).length;
    
    setTasksCompleted(completedToday);
    setTodayTasks(activeTasks.slice(0, 5));
    
    // Set priority task (highest priority or first task)
    const priority = activeTasks.find((t: { priority: string }) => t.priority === 'high') || activeTasks[0];
    setPriorityTask(priority);

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // const streakStatus = getStreakStatus();
  const level = calculateLevel();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getDayOfWeek = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[currentTime.getDay()];
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      
      <div className="lg:ml-64 pt-14 lg:pt-0 pb-16 lg:pb-0">
        <div className="container-app py-6 lg:py-8">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="heading-2 text-primary mb-1">
              {greeting}{userName ? `, ${userName}` : ''}
            </h1>
            <p className="text-sm text-secondary">
              {getDayOfWeek()} • {currentTime.toLocaleDateString()} • {formatTime(currentTime)}
            </p>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            
            {/* Left Column - Focus Area */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Current Focus Session / Quick Start */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
              >
                <div className="flex items-center gap-2 mb-4">
                  <ClockIcon className="w-5 h-5 text-sunglow" />
                  <h2 className="heading-4">Current Focus Session</h2>
                </div>
                <div>
                  {activeTimer ? (
                    <div className="text-center py-6">
                      <div className="text-3xl font-bold text-primary mb-2">25:00</div>
                      <p className="text-sm text-secondary mb-4">Focus Session in Progress</p>
                      <Link href="/timer" className="btn btn-primary btn-sm">
                        View Timer
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-secondary mb-4">No active session</p>
                      <Link href="/timer" className="btn btn-primary">
                        <PlayIcon className="w-4 h-4" />
                        Start Focus Session
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Today's Priority */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card"
              >
                <h2 className="heading-4 mb-4">Today&apos;s Priority</h2>
                <div>
                  {priorityTask ? (
                    <div>
                      <div className="flex items-start gap-3">
                        <button className="mt-0.5 w-5 h-5 rounded border-2 border-sunglow hover:bg-sunglow transition-colors flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-medium text-primary">{priorityTask.title}</h3>
                          {priorityTask.description && (
                            <p className="text-sm text-secondary mt-1">{priorityTask.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-3">
                            <Link href="/timer" className="text-sunglow text-xs font-medium hover:underline">
                              Start Timer
                            </Link>
                            <Link href="/tasks" className="text-sunglow text-xs font-medium hover:underline">
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-secondary mb-3">No priority task set</p>
                      <Link href="/tasks" className="btn btn-secondary btn-sm">
                        <PlusIcon className="w-4 h-4" />
                        Add Task
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Task Queue */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="heading-4">Task Queue</h2>
                  <Link href="/tasks" className="text-sunglow text-xs font-medium hover:underline">
                    View All
                  </Link>
                </div>
                <div>
                  {todayTasks.length > 0 ? (
                    <div className="space-y-2">
                      {todayTasks.map((task, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-light transition-colors">
                          <button className="w-4 h-4 rounded border-2 border-border hover:border-sunglow transition-colors flex-shrink-0" />
                          <span className="flex-1 text-sm text-primary">{task.title}</span>
                          <span className={`badge ${
                            task.priority === 'high' ? 'badge-error' :
                            task.priority === 'medium' ? 'badge-warning' :
                            'badge-success'
                          }`}>
                            {task.priority || 'low'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-secondary">No tasks in queue</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Stats & Quick Actions */}
            <div className="space-y-4">
              
              {/* Daily Progress */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card card-compact"
              >
                <div className="flex items-center gap-2 mb-3">
                  <ChartBarIcon className="w-5 h-5 text-sunglow" />
                  <h2 className="heading-4">Daily Progress</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary">Sessions</span>
                    <span className="text-lg font-semibold text-primary">{todaySessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary">Tasks Done</span>
                    <span className="text-lg font-semibold text-success">{tasksCompleted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-secondary">Focus Time</span>
                    <span className="text-lg font-semibold text-warning">
                      {Math.floor(todaySessions * 25 / 60)}h {(todaySessions * 25) % 60}m
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Streak Counter */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card card-compact"
              >
                <div className="flex items-center gap-2 mb-3">
                  <FireIcon className="w-5 h-5 text-orange-500" />
                  <h2 className="heading-4">Streak</h2>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-1">
                    {streak.current_streak}
                  </div>
                  <p className="text-xs text-secondary mb-2">Day Streak</p>
                  <div className="pt-2 border-t border-border">
                    <p className="text-2xs text-secondary mb-0.5">Level {level.level}</p>
                    <p className="text-sm font-medium text-primary">{level.title}</p>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card card-compact"
              >
                <h2 className="heading-4 mb-3">Quick Actions</h2>
                <div className="space-y-2">
                  <Link href="/timer" className="btn btn-ghost btn-sm w-full justify-start">
                    <PlayIcon className="w-4 h-4" />
                    Start Timer
                  </Link>
                  <Link href="/tasks" className="btn btn-ghost btn-sm w-full justify-start">
                    <PlusIcon className="w-4 h-4" />
                    Add Task
                  </Link>
                  <Link href="/calendar" className="btn btn-ghost btn-sm w-full justify-start">
                    <CalendarIcon className="w-4 h-4" />
                    Schedule Session
                  </Link>
                </div>
              </motion.div>

              {/* Weekly Overview Mini */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="card card-compact"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="heading-4">This Week</h2>
                  <Link href="/calendar" className="text-sunglow text-xs font-medium hover:underline">
                    View Calendar
                  </Link>
                </div>
                <div>
                  <div className="grid grid-cols-7 gap-1 text-center mb-2">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className="text-2xs text-secondary">{day}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 7 }, (_, i) => {
                      const isToday = i === currentTime.getDay();
                      return (
                        <div 
                          key={i} 
                          className={`aspect-square rounded-md flex items-center justify-center ${
                            isToday ? 'bg-sunglow text-white' : 'bg-surface-light'
                          }`}
                        >
                          {isToday && <CheckCircleIcon className="w-3 h-3" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Link href="/deep-work" className="card card-compact card-hover group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sunglow/10 flex items-center justify-center">
                    <BoltIcon className="w-5 h-5 text-sunglow" />
                  </div>
                  <div>
                    <h3 className="font-medium text-primary text-sm">Deep Work</h3>
                    <p className="text-xs text-secondary">Start focus mode</p>
                  </div>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-sunglow opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            <Link href="/tasks" className="card card-compact card-hover group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircleIcon className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h3 className="font-medium text-primary text-sm">Tasks</h3>
                    <p className="text-xs text-secondary">Manage todos</p>
                  </div>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-sunglow opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>

            <Link href="/analytics" className="card card-compact card-hover group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                    <TrophyIcon className="w-5 h-5 text-info" />
                  </div>
                  <div>
                    <h3 className="font-medium text-primary text-sm">Analytics</h3>
                    <p className="text-xs text-secondary">Track progress</p>
                  </div>
                </div>
                <ArrowRightIcon className="w-4 h-4 text-sunglow opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}