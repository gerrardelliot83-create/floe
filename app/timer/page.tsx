'use client';

import dynamic from 'next/dynamic';
import Navigation from '@/components/ui/Navigation';
import { useStreaks } from '@/lib/hooks/useStreaks';
import { TrophyIcon, LightBulbIcon } from '@heroicons/react/24/outline';

const EnhancedPomodoroTimer = dynamic(
  () => import('@/components/timer/EnhancedPomodoroTimer'),
  { 
    ssr: false,
    loading: () => (
      <div className="text-center py-12">
        <p className="text-secondary">Loading timer...</p>
      </div>
    )
  }
);

export default function TimerPage() {
  const { getAchievements } = useStreaks();
  const achievements = getAchievements();

  return (
    <div className="min-h-screen bg-dark">
      <Navigation />
      
      <div className="container max-w-4xl mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Focus Timer</h1>
          <p className="text-secondary">Deep work sessions with Pomodoro technique</p>
        </div>

        <div className="card">
          <EnhancedPomodoroTimer />
        </div>

        <div className="card mt-6">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2">
              <TrophyIcon className="w-5 h-5 text-sunglow" />
              Achievements
            </h2>
          </div>
          <div className="card-content">
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
              {achievements.map(achievement => (
                <div 
                  key={achievement.id}
                  className={`card p-3 text-center transition-all ${
                    achievement.unlocked 
                      ? 'border-sunglow bg-sunglow/5' 
                      : 'opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <p className="text-sm font-medium text-primary">{achievement.title}</p>
                  {!achievement.unlocked && (
                    <p className="text-xs text-secondary mt-1">{achievement.requirement}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card mt-6">
          <div className="card-header">
            <h2 className="card-title flex items-center gap-2">
              <LightBulbIcon className="w-5 h-5 text-sunglow" />
              Tips for Deep Work
            </h2>
          </div>
          <div className="card-content">
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-sunglow mt-1">•</span>
                <span className="text-secondary">Turn off all notifications and put your phone in another room</span>
              </li>
              <li className="flex gap-3">
                <span className="text-sunglow mt-1">•</span>
                <span className="text-secondary">Have a clear goal for each focus session</span>
              </li>
              <li className="flex gap-3">
                <span className="text-sunglow mt-1">•</span>
                <span className="text-secondary">Take breaks seriously - step away from your workspace</span>
              </li>
              <li className="flex gap-3">
                <span className="text-sunglow mt-1">•</span>
                <span className="text-secondary">Stay hydrated and keep healthy snacks nearby</span>
              </li>
              <li className="flex gap-3">
                <span className="text-sunglow mt-1">•</span>
                <span className="text-secondary">Use the 2-minute rule: if something takes less than 2 minutes, do it now</span>
              </li>
              <li className="flex gap-3">
                <span className="text-sunglow mt-1">•</span>
                <span className="text-secondary">Track your progress and celebrate small wins</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}