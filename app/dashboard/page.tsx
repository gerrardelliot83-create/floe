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
import styles from './Dashboard.module.css';

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
    <div className={styles.container}>
      <UnifiedNavigation />
      
      <div className={styles.pageWrapper}>
        <div className={styles.pageContent}>
          {/* Header Section */}
          <div className={styles.header}>
            <h1 className={styles.greeting}>
              {greeting}{userName ? `, ${userName}` : ''}
            </h1>
            <p className={styles.dateTime}>
              {getDayOfWeek()} • {currentTime.toLocaleDateString()} • {formatTime(currentTime)}
            </p>
          </div>

          {/* Main Grid Layout */}
          <div className={styles.mainGrid}>
            
            {/* Left Column - Focus Area */}
            <div className={styles.leftColumn}>
              
              {/* Current Focus Session / Quick Start */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <ClockIcon className={styles.cardIcon} />
                  <h2 className={styles.cardTitle}>Current Focus Session</h2>
                </div>
                <div className={styles.cardContent}>
                  {activeTimer ? (
                    <div className={styles.focusSession}>
                      <div className={styles.timerDisplay}>25:00</div>
                      <p className={styles.sessionStatus}>Focus Session in Progress</p>
                      <Link href="/timer" className={styles.startButton}>
                        View Timer
                      </Link>
                    </div>
                  ) : (
                    <div className={styles.focusSession}>
                      <p className={styles.sessionStatus}>No active session</p>
                      <Link href="/timer" className={styles.startButton}>
                        <PlayIcon />
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
                className={styles.card}
              >
                <h2 className={styles.cardTitle}>Today&apos;s Priority</h2>
                <div className={styles.cardContent}>
                  {priorityTask ? (
                    <div className={styles.priorityTask}>
                      <button className={styles.taskCheckbox} />
                      <div className={styles.taskDetails}>
                        <h3 className={styles.taskTitle}>{priorityTask.title}</h3>
                        {priorityTask.description && (
                          <p className={styles.taskDescription}>{priorityTask.description}</p>
                        )}
                        <div className={styles.taskActions}>
                          <Link href="/timer" className={styles.taskAction}>
                            Start Timer
                          </Link>
                          <Link href="/tasks" className={styles.taskAction}>
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <p className={styles.emptyStateText}>No priority task set</p>
                      <Link href="/tasks" className={styles.emptyStateAction}>
                        <PlusIcon />
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
                className={styles.card}
              >
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Task Queue</h2>
                  <Link href="/tasks" className={styles.viewAllLink}>
                    View All
                  </Link>
                </div>
                <div className={styles.cardContent}>
                  {todayTasks.length > 0 ? (
                    <div className={styles.taskQueue}>
                      {todayTasks.map((task, index) => (
                        <div key={index} className={styles.taskItem}>
                          <button className={styles.taskItemCheckbox} />
                          <span className={styles.taskItemTitle}>{task.title}</span>
                          <span className={`${styles.taskPriority} ${
                            task.priority === 'high' ? styles.priorityHigh :
                            task.priority === 'medium' ? styles.priorityMedium :
                            styles.priorityLow
                          }`}>
                            {task.priority || 'low'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <p className={styles.emptyStateText}>No tasks in queue</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Right Column - Stats & Quick Actions */}
            <div className={styles.rightColumn}>
              
              {/* Daily Progress */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`${styles.card} ${styles.cardCompact}`}
              >
                <div className={styles.cardHeader}>
                  <ChartBarIcon className={styles.cardIcon} />
                  <h2 className={styles.cardTitle}>Daily Progress</h2>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.statsList}>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Sessions</span>
                      <span className={styles.statValue}>{todaySessions}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Tasks Done</span>
                      <span className={`${styles.statValue} ${styles.success}`}>{tasksCompleted}</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statLabel}>Focus Time</span>
                      <span className={`${styles.statValue} ${styles.warning}`}>
                        {Math.floor(todaySessions * 25 / 60)}h {(todaySessions * 25) % 60}m
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Streak Counter */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className={`${styles.card} ${styles.cardCompact}`}
              >
                <div className={styles.cardHeader}>
                  <FireIcon className={styles.cardIcon} style={{ color: '#FF6B35' }} />
                  <h2 className={styles.cardTitle}>Streak</h2>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.streakDisplay}>
                    <div className={styles.streakNumber}>
                      {streak.current_streak}
                    </div>
                    <p className={styles.streakLabel}>Day Streak</p>
                    <div className={styles.streakDivider}>
                      <p className={styles.levelInfo}>Level {level.level}</p>
                      <p className={styles.levelTitle}>{level.title}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`${styles.card} ${styles.cardCompact}`}
              >
                <h2 className={styles.cardTitle}>Quick Actions</h2>
                <div className={styles.cardContent}>
                  <div className={styles.quickActionsList}>
                    <Link href="/timer" className={styles.quickAction}>
                      <PlayIcon />
                      Start Timer
                    </Link>
                    <Link href="/tasks" className={styles.quickAction}>
                      <PlusIcon />
                      Add Task
                    </Link>
                    <Link href="/calendar" className={styles.quickAction}>
                      <CalendarIcon />
                      Schedule Session
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Weekly Overview Mini */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`${styles.card} ${styles.cardCompact}`}
              >
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>This Week</h2>
                  <Link href="/calendar" className={styles.viewAllLink}>
                    View Calendar
                  </Link>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.weekGrid}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                      <div key={i} className={styles.weekDayLabel}>{day}</div>
                    ))}
                  </div>
                  <div className={styles.weekGrid}>
                    {Array.from({ length: 7 }, (_, i) => {
                      const isToday = i === currentTime.getDay();
                      return (
                        <div 
                          key={i} 
                          className={`${styles.weekDay} ${isToday ? styles.today : ''}`}
                        >
                          {isToday && <CheckCircleIcon />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom Navigation Cards */}
          <div className={styles.bottomCards}>
            <Link href="/deep-work" className={styles.actionCard}>
              <div className={styles.actionCardContent}>
                <div className={styles.actionCardInfo}>
                  <div className={`${styles.actionCardIcon} ${styles.sunglow}`}>
                    <BoltIcon />
                  </div>
                  <div className={styles.actionCardText}>
                    <h3 className={styles.actionCardTitle}>Deep Work</h3>
                    <p className={styles.actionCardDescription}>Start focus mode</p>
                  </div>
                </div>
                <ArrowRightIcon className={styles.actionCardArrow} />
              </div>
            </Link>

            <Link href="/tasks" className={styles.actionCard}>
              <div className={styles.actionCardContent}>
                <div className={styles.actionCardInfo}>
                  <div className={`${styles.actionCardIcon} ${styles.success}`}>
                    <CheckCircleIcon />
                  </div>
                  <div className={styles.actionCardText}>
                    <h3 className={styles.actionCardTitle}>Tasks</h3>
                    <p className={styles.actionCardDescription}>Manage todos</p>
                  </div>
                </div>
                <ArrowRightIcon className={styles.actionCardArrow} />
              </div>
            </Link>

            <Link href="/analytics" className={styles.actionCard}>
              <div className={styles.actionCardContent}>
                <div className={styles.actionCardInfo}>
                  <div className={`${styles.actionCardIcon} ${styles.info}`}>
                    <TrophyIcon />
                  </div>
                  <div className={styles.actionCardText}>
                    <h3 className={styles.actionCardTitle}>Analytics</h3>
                    <p className={styles.actionCardDescription}>Track progress</p>
                  </div>
                </div>
                <ArrowRightIcon className={styles.actionCardArrow} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}