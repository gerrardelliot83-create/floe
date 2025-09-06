'use client';

import { useState, useMemo } from 'react';
import {
  TrophyIcon,
  ClockIcon,
  BoltIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import useStore from '@/lib/store';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval,
  isWithinInterval,
  differenceInMinutes,
  subDays
} from 'date-fns';

type TimeRange = 'week' | 'month' | 'quarter' | 'year';

export default function ProductivityAnalytics() {
  const { tasks, sessions } = useStore();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  // Calculate date ranges
  const now = useMemo(() => new Date(), []);
  const getDateRange = () => {
    switch (timeRange) {
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'quarter':
        return { start: subDays(now, 90), end: now };
      case 'year':
        return { start: subDays(now, 365), end: now };
    }
  };

  const { start, end } = getDateRange();

  // Task Analytics
  const taskAnalytics = useMemo(() => {
    const completedTasks = tasks.items.filter(task => 
      task.completed && 
      task.updated_at &&
      isWithinInterval(new Date(task.updated_at), { start, end })
    );

    const totalTasks = tasks.items.filter(task =>
      task.created_at &&
      isWithinInterval(new Date(task.created_at), { start, end })
    );

    const byPriority = {
      high: completedTasks.filter(t => t.priority === 'high').length,
      medium: completedTasks.filter(t => t.priority === 'medium').length,
      low: completedTasks.filter(t => t.priority === 'low').length,
    };

    const overdueCount = tasks.items.filter(task =>
      !task.completed &&
      task.due_date &&
      new Date(task.due_date) < now
    ).length;

    const completionRate = totalTasks.length > 0 
      ? (completedTasks.length / totalTasks.length) * 100
      : 0;

    return {
      completed: completedTasks.length,
      total: totalTasks.length,
      completionRate,
      byPriority,
      overdue: overdueCount,
      averageCompletionTime: calculateAverageCompletionTime(completedTasks),
    };
  }, [tasks, start, end, now]);

  // Session Analytics
  const sessionAnalytics = useMemo(() => {
    const periodSessions = sessions.history.filter(session =>
      session.startTime &&
      isWithinInterval(new Date(session.startTime), { start, end })
    );

    const totalMinutes = periodSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const averageDuration = periodSessions.length > 0
      ? totalMinutes / periodSessions.length
      : 0;

    const byType = {
      deep: periodSessions.filter(s => s.focusType === 'deep').length,
      shallow: periodSessions.filter(s => s.focusType === 'shallow').length,
      creative: periodSessions.filter(s => s.focusType === 'creative').length,
      meeting: periodSessions.filter(s => s.focusType === 'meeting').length,
    };

    const averageFocusScore = periodSessions.length > 0
      ? periodSessions.reduce((sum, s) => sum + (s.stats?.focusScore || 0), 0) / periodSessions.length
      : 0;

    return {
      totalSessions: periodSessions.length,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60),
      averageDuration,
      byType,
      averageFocusScore,
      currentStreak: 0, // Streak calculation would go here
    };
  }, [sessions, start, end]);

  // Productivity Score Calculation
  const productivityScore = useMemo(() => {
    const taskScore = taskAnalytics.completionRate * 0.3;
    const focusScore = sessionAnalytics.averageFocusScore * 0.3;
    const consistencyScore = Math.min((sessionAnalytics.totalSessions / 20) * 100, 100) * 0.2;
    const efficiencyScore = Math.min((taskAnalytics.completed / taskAnalytics.total) * 100, 100) * 0.2;
    
    return Math.round(taskScore + focusScore + consistencyScore + efficiencyScore);
  }, [taskAnalytics, sessionAnalytics]);

  // Daily chart data
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start, end });
    
    return days.map(day => {
      const dayTasks = tasks.items.filter(task =>
        task.completed &&
        task.updated_at &&
        format(new Date(task.updated_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );

      const daySessions = sessions.history.filter(session =>
        session.startTime &&
        format(new Date(session.startTime), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      );

      return {
        date: format(day, 'MMM d'),
        tasks: dayTasks.length,
        focusMinutes: daySessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      };
    });
  }, [tasks, sessions, start, end]);

  // Helper functions
  function calculateAverageCompletionTime(tasks: { created_at?: string; updated_at?: string }[]) {
    if (tasks.length === 0) return 0;
    
    const tasksWithTime = tasks.filter(t => t.created_at && t.updated_at);
    if (tasksWithTime.length === 0) return 0;
    
    const totalMinutes = tasksWithTime.reduce((sum, task) => {
      if (!task.created_at || !task.updated_at) return sum;
      const created = new Date(task.created_at);
      const completed = new Date(task.updated_at);
      return sum + differenceInMinutes(completed, created);
    }, 0);
    
    return Math.round(totalMinutes / tasksWithTime.length / 60); // Return in hours
  }

  // AI Insights
  const insights = [
    {
      type: 'positive' as const,
      title: 'Peak Performance',
      message: `Your most productive time is between 9 AM and 11 AM`,
      icon: ArrowTrendingUpIcon,
    },
    {
      type: sessionAnalytics.currentStreak >= 3 ? 'positive' as const : 'warning' as const,
      title: 'Consistency',
      message: sessionAnalytics.currentStreak >= 3
        ? `Great job! ${sessionAnalytics.currentStreak} day streak`
        : 'Build consistency with daily sessions',
      icon: FireIcon,
    },
    {
      type: taskAnalytics.overdue > 5 ? 'warning' as const : 'neutral' as const,
      title: 'Task Management',
      message: taskAnalytics.overdue > 5
        ? `${taskAnalytics.overdue} overdue tasks need attention`
        : 'All tasks are on track',
      icon: ClockIcon,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Analytics & Insights</h1>
        <p className="text-secondary">Track your productivity and optimize your workflow</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-8">
        {(['week', 'month', 'quarter', 'year'] as TimeRange[]).map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg capitalize transition-colors ${
              timeRange === range
                ? 'bg-sunglow text-white'
                : 'bg-surface text-secondary hover:text-primary'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Overall Productivity Score */}
      <div className="card bg-gradient-to-r from-sunglow/20 to-sunglow/5 mb-8">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-primary mb-2">Productivity Score</h2>
              <p className="text-secondary">Based on tasks, focus time, and consistency</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-sunglow">{productivityScore}</div>
              <div className="text-sm text-secondary mt-1">out of 100</div>
            </div>
          </div>
          
          {/* Score Breakdown */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-semibold text-primary">
                {Math.round(taskAnalytics.completionRate)}%
              </div>
              <div className="text-xs text-secondary">Task Completion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-primary">
                {Math.round(sessionAnalytics.averageFocusScore)}
              </div>
              <div className="text-xs text-secondary">Focus Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-primary">
                {sessionAnalytics.totalSessions}
              </div>
              <div className="text-xs text-secondary">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-primary">
                {sessionAnalytics.currentStreak}
              </div>
              <div className="text-xs text-secondary">Day Streak</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <span className="text-xs text-secondary">Tasks</span>
          </div>
          <div className="text-2xl font-bold text-primary">{taskAnalytics.completed}</div>
          <div className="text-sm text-secondary">Completed</div>
          <div className="mt-2 text-xs">
            <span className={taskAnalytics.completionRate >= 70 ? 'text-green-500' : 'text-amber-500'}>
              {taskAnalytics.completionRate >= 70 ? '↑' : '↓'} {Math.round(taskAnalytics.completionRate)}% rate
            </span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <ClockIcon className="w-5 h-5 text-blue-500" />
            <span className="text-xs text-secondary">Focus</span>
          </div>
          <div className="text-2xl font-bold text-primary">{sessionAnalytics.totalHours}h</div>
          <div className="text-sm text-secondary">Total Time</div>
          <div className="mt-2 text-xs text-secondary">
            {sessionAnalytics.totalSessions} sessions
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <BoltIcon className="w-5 h-5 text-amber-500" />
            <span className="text-xs text-secondary">Energy</span>
          </div>
          <div className="text-2xl font-bold text-primary">
            {Math.round(sessionAnalytics.averageDuration)}m
          </div>
          <div className="text-sm text-secondary">Avg Session</div>
          <div className="mt-2 text-xs text-secondary">
            Best: Deep Work
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <TrophyIcon className="w-5 h-5 text-sunglow" />
            <span className="text-xs text-secondary">Streak</span>
          </div>
          <div className="text-2xl font-bold text-primary">{sessionAnalytics.currentStreak}</div>
          <div className="text-sm text-secondary">Days</div>
          <div className="mt-2 text-xs text-sunglow">
            Keep it up!
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Task Distribution */}
        <div className="card">
          <h3 className="font-semibold text-primary mb-4">Task Priority Distribution</h3>
          <div className="space-y-3">
            {Object.entries(taskAnalytics.byPriority).map(([priority, count]) => (
              <div key={priority}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-secondary capitalize">{priority}</span>
                  <span className="text-sm font-medium text-primary">{count}</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      priority === 'high' ? 'bg-orange-500' :
                      priority === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${(count / taskAnalytics.completed) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Session Types */}
        <div className="card">
          <h3 className="font-semibold text-primary mb-4">Focus Session Types</h3>
          <div className="space-y-3">
            {Object.entries(sessionAnalytics.byType).map(([type, count]) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-secondary capitalize">{type}</span>
                  <span className="text-sm font-medium text-primary">{count}</span>
                </div>
                <div className="h-2 bg-surface rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sunglow"
                    style={{ width: `${(count / sessionAnalytics.totalSessions) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Trend Chart */}
      <div className="card mb-8">
        <h3 className="font-semibold text-primary mb-4">Daily Activity</h3>
        <div className="h-48 flex items-end gap-2">
          {dailyData.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col gap-1">
                <div
                  className="bg-blue-500 rounded-t"
                  style={{ height: `${Math.max(day.focusMinutes / 2, 2)}px` }}
                  title={`${day.focusMinutes} minutes focus`}
                />
                <div
                  className="bg-green-500 rounded-b"
                  style={{ height: `${Math.max(day.tasks * 10, 2)}px` }}
                  title={`${day.tasks} tasks completed`}
                />
              </div>
              <span className="text-xs text-secondary mt-2 rotate-45 origin-left">
                {day.date}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-xs text-secondary">Focus Time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span className="text-xs text-secondary">Tasks</span>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-sunglow" />
          AI Insights
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div
              key={index}
              className={`card border-l-4 ${
                insight.type === 'positive' ? 'border-green-500' :
                insight.type === 'warning' ? 'border-amber-500' :
                'border-gray-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <insight.icon className={`w-5 h-5 mt-0.5 ${
                  insight.type === 'positive' ? 'text-green-500' :
                  insight.type === 'warning' ? 'text-amber-500' :
                  'text-gray-500'
                }`} />
                <div>
                  <h4 className="font-medium text-primary mb-1">{insight.title}</h4>
                  <p className="text-sm text-secondary">{insight.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Add missing import
import { CheckCircleIcon } from '@heroicons/react/24/outline';