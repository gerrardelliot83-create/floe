'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/ui/Navigation';
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
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const { streak, getStreakStatus, calculateLevel } = useStreaks();
  const [todaySessions, setTodaySessions] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [userName, setUserName] = useState('');
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTimer, setActiveTimer] = useState(null);
  const [todayTasks, setTodayTasks] = useState<any[]>([]);
  const [priorityTask, setPriorityTask] = useState<any>(null);

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
    const activeTasks = tasks.filter((t: any) => !t.completed);
    const completedToday = tasks.filter((t: any) => {
      if (!t.completed) return false;
      const completedDate = new Date(t.completedAt);
      return completedDate.toDateString() === today;
    }).length;
    
    setTasksCompleted(completedToday);
    setTodayTasks(activeTasks.slice(0, 5));
    
    // Set priority task (highest priority or first task)
    const priority = activeTasks.find((t: any) => t.priority === 'high') || activeTasks[0];
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

  const streakStatus = getStreakStatus();
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
    <div className="min-h-screen bg-dark">
      <Navigation />
      
      <div className="container py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            {greeting}{userName ? `, ${userName}` : ''}
          </h1>
          <p className="text-secondary">
            {getDayOfWeek()} • {currentTime.toLocaleDateString()} • {formatTime(currentTime)}
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Focus Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Current Focus Session / Quick Start */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="card-title flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-sunglow" />
                  Current Focus Session
                </h2>
              </div>
              <div className="card-content">
                {activeTimer ? (
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold text-primary mb-2">25:00</div>
                    <p className="text-secondary mb-4">Focus Session in Progress</p>
                    <Link href="/timer" className="btn btn-primary">
                      View Timer
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-secondary mb-4">No active session</p>
                    <Link href="/timer" className="btn btn-primary btn-lg">
                      <PlayIcon className="w-5 h-5" />
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
              <div className="card-header">
                <h2 className="card-title">Today's Priority</h2>
              </div>
              <div className="card-content">
                {priorityTask ? (
                  <div>
                    <div className="flex items-start gap-3">
                      <button className="mt-1 w-6 h-6 rounded border-2 border-sunglow hover:bg-sunglow transition-colors" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-primary">{priorityTask.title}</h3>
                        {priorityTask.description && (
                          <p className="text-secondary text-sm mt-1">{priorityTask.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3">
                          <Link href="/timer" className="text-sunglow text-sm font-medium hover:underline">
                            Start Timer
                          </Link>
                          <Link href="/tasks" className="text-sunglow text-sm font-medium hover:underline">
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-secondary mb-3">No priority task set</p>
                    <Link href="/tasks" className="btn btn-secondary">
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
              <div className="card-header flex-between">
                <h2 className="card-title">Task Queue</h2>
                <Link href="/tasks" className="text-sunglow text-sm font-medium hover:underline">
                  View All
                </Link>
              </div>
              <div className="card-content">
                {todayTasks.length > 0 ? (
                  <div className="space-y-3">
                    {todayTasks.map((task, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-surface transition-colors">
                        <button className="w-5 h-5 rounded border-2 border-border-dark hover:border-sunglow transition-colors" />
                        <span className="flex-1 text-primary">{task.title}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          task.priority === 'high' ? 'bg-error/20 text-error' :
                          task.priority === 'medium' ? 'bg-warning/20 text-warning' :
                          'bg-success/20 text-success'
                        }`}>
                          {task.priority || 'low'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-secondary">No tasks in queue</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Stats & Quick Actions */}
          <div className="space-y-6">
            
            {/* Daily Progress */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="card-title flex items-center gap-2">
                  <ChartBarIcon className="w-5 h-5 text-sunglow" />
                  Daily Progress
                </h2>
              </div>
              <div className="card-content space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Sessions</span>
                  <span className="text-xl font-bold text-primary">{todaySessions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Tasks Done</span>
                  <span className="text-xl font-bold text-success">{tasksCompleted}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Focus Time</span>
                  <span className="text-xl font-bold text-warning">
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
              className="card"
            >
              <div className="card-header">
                <h2 className="card-title flex items-center gap-2">
                  <FireIcon className="w-5 h-5 text-orange-500" />
                  Streak Counter
                </h2>
              </div>
              <div className="card-content text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">
                  {streak.current_streak}
                </div>
                <p className="text-secondary text-sm mb-3">Day Streak</p>
                <div className="pt-3 border-t border-border-dark">
                  <p className="text-xs text-secondary mb-1">Level {level.level}</p>
                  <p className="font-medium text-primary">{level.title}</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card"
            >
              <div className="card-header">
                <h2 className="card-title">Quick Actions</h2>
              </div>
              <div className="card-content space-y-2">
                <Link href="/timer" className="btn btn-ghost w-full justify-start">
                  <PlayIcon className="w-4 h-4" />
                  Start Timer
                </Link>
                <Link href="/tasks" className="btn btn-ghost w-full justify-start">
                  <PlusIcon className="w-4 h-4" />
                  Add Task
                </Link>
                <Link href="/calendar" className="btn btn-ghost w-full justify-start">
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
              className="card"
            >
              <div className="card-header flex-between">
                <h2 className="card-title">This Week</h2>
                <Link href="/calendar" className="text-sunglow text-sm font-medium hover:underline">
                  View Calendar
                </Link>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-xs text-secondary">{day}</div>
                  ))}
                  {Array.from({ length: 7 }, (_, i) => {
                    const isToday = i === currentTime.getDay();
                    return (
                      <div 
                        key={i} 
                        className={`aspect-square rounded flex-center text-xs ${
                          isToday ? 'bg-sunglow text-white' : 'bg-surface'
                        }`}
                      >
                        {isToday && <CheckCircleIcon className="w-4 h-4" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Link href="/timer" className="card hover:border-sunglow transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary mb-1">Pomodoro Timer</h3>
                <p className="text-secondary text-sm">Start focused work</p>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-sunglow" />
            </div>
          </Link>

          <Link href="/tasks" className="card hover:border-sunglow transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary mb-1">Task Manager</h3>
                <p className="text-secondary text-sm">Organize your work</p>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-sunglow" />
            </div>
          </Link>

          <Link href="/calendar" className="card hover:border-sunglow transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-primary mb-1">Calendar</h3>
                <p className="text-secondary text-sm">Schedule sessions</p>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-sunglow" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}