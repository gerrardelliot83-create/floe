import { useState, useEffect } from 'react';
import { Streak } from '@/lib/types/database';

export function useStreaks(userId: string = 'current-user') {
  const [streak, setStreak] = useState<Streak>({
    id: '1',
    user_id: userId,
    current_streak: 0,
    longest_streak: 0,
    last_session_date: undefined,
    total_sessions: 0,
    total_focus_minutes: 0,
    updated_at: new Date().toISOString()
  });

  useEffect(() => {
    // Load streak from localStorage (in production, this would be from Supabase)
    const savedStreak = localStorage.getItem('userStreak');
    if (savedStreak) {
      setStreak(JSON.parse(savedStreak));
    }
  }, []);

  const updateStreak = (sessionMinutes: number) => {
    const today = new Date().toDateString();
    const lastSession = streak.last_session_date ? new Date(streak.last_session_date).toDateString() : null;
    
    let newCurrentStreak = streak.current_streak;
    
    if (!lastSession) {
      // First session ever
      newCurrentStreak = 1;
    } else if (lastSession === today) {
      // Already had a session today, just update totals
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastSession === yesterday.toDateString()) {
        // Continuing streak from yesterday
        newCurrentStreak = streak.current_streak + 1;
      } else {
        // Streak broken, start new one
        newCurrentStreak = 1;
      }
    }

    const newStreak: Streak = {
      ...streak,
      current_streak: newCurrentStreak,
      longest_streak: Math.max(newCurrentStreak, streak.longest_streak),
      last_session_date: today,
      total_sessions: streak.total_sessions + 1,
      total_focus_minutes: streak.total_focus_minutes + sessionMinutes,
      updated_at: new Date().toISOString()
    };

    setStreak(newStreak);
    localStorage.setItem('userStreak', JSON.stringify(newStreak));
    
    return newStreak;
  };

  const getStreakStatus = () => {
    if (!streak.last_session_date) {
      return { isActive: false, message: 'Start your first session!' };
    }

    const today = new Date().toDateString();
    const lastSession = new Date(streak.last_session_date).toDateString();

    if (lastSession === today) {
      return { 
        isActive: true, 
        message: `${streak.current_streak} day streak! Keep it going!` 
      };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastSession === yesterday.toDateString()) {
      return { 
        isActive: true, 
        message: `Complete today's session to continue your ${streak.current_streak} day streak!` 
      };
    }

    return { 
      isActive: false, 
      message: 'Streak broken. Start a new one today!' 
    };
  };

  const calculateLevel = () => {
    const sessions = streak.total_sessions;
    if (sessions < 5) return { level: 1, title: 'Beginner', nextAt: 5 };
    if (sessions < 20) return { level: 2, title: 'Focused', nextAt: 20 };
    if (sessions < 50) return { level: 3, title: 'Dedicated', nextAt: 50 };
    if (sessions < 100) return { level: 4, title: 'Master', nextAt: 100 };
    if (sessions < 200) return { level: 5, title: 'Expert', nextAt: 200 };
    return { level: 6, title: 'Legend', nextAt: Infinity };
  };

  const getAchievements = () => {
    const achievements = [];
    
    if (streak.total_sessions >= 1) {
      achievements.push({ id: 'first', title: 'First Step', icon: '🎯', unlocked: true });
    }
    
    if (streak.current_streak >= 7) {
      achievements.push({ id: 'week', title: 'Week Warrior', icon: '🔥', unlocked: true });
    }
    
    if (streak.current_streak >= 30) {
      achievements.push({ id: 'month', title: 'Monthly Master', icon: '🏆', unlocked: true });
    }
    
    if (streak.total_focus_minutes >= 1500) {
      achievements.push({ id: '25hours', title: '25 Hour Club', icon: '⏰', unlocked: true });
    }
    
    if (streak.longest_streak >= 100) {
      achievements.push({ id: 'century', title: 'Century', icon: '💯', unlocked: true });
    }

    // Add locked achievements to show progress
    const allPossible = [
      { id: 'first', title: 'First Step', icon: '🎯', requirement: '1 session' },
      { id: 'week', title: 'Week Warrior', icon: '🔥', requirement: '7 day streak' },
      { id: 'month', title: 'Monthly Master', icon: '🏆', requirement: '30 day streak' },
      { id: '25hours', title: '25 Hour Club', icon: '⏰', requirement: '25 hours focus' },
      { id: 'century', title: 'Century', icon: '💯', requirement: '100 day streak' },
    ];

    return allPossible.map(possible => {
      const unlocked = achievements.find(a => a.id === possible.id);
      return {
        ...possible,
        unlocked: !!unlocked
      };
    });
  };

  return {
    streak,
    updateStreak,
    getStreakStatus,
    calculateLevel,
    getAchievements
  };
}