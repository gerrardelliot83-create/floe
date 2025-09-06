'use client';

import dynamic from 'next/dynamic';
import UnifiedNavigation from '@/components/ui/UnifiedNavigation';
import { useStreaks } from '@/lib/hooks/useStreaks';
import { TrophyIcon, LightBulbIcon } from '@heroicons/react/24/outline';

const EnhancedPomodoroTimer = dynamic(
  () => import('@/components/timer/EnhancedPomodoroTimer'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-12 h-12 mx-auto mb-4 bg-surface rounded-lg"></div>
            <p className="text-sm text-secondary">Loading timer...</p>
          </div>
        </div>
      </div>
    )
  }
);

export default function TimerPage() {
  const { getAchievements } = useStreaks();
  const achievements = getAchievements();

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      
      <div className="lg:ml-64 pt-14 lg:pt-0 pb-16 lg:pb-0">
        <div className="container-app py-6 lg:py-8">
          <div className="mb-6">
            <h1 className="heading-2 text-primary mb-1">Focus Timer</h1>
            <p className="text-sm text-secondary">Deep work sessions with Pomodoro technique</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="card">
              <EnhancedPomodoroTimer />
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <TrophyIcon className="w-5 h-5 text-sunglow" />
                <h2 className="heading-4">Achievements</h2>
              </div>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {achievements.map(achievement => (
                  <div 
                    key={achievement.id}
                    className={`card card-compact text-center transition-all ${
                      achievement.unlocked 
                        ? 'border-sunglow bg-sunglow/5' 
                        : 'opacity-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{achievement.icon}</div>
                    <p className="text-xs font-medium text-primary">{achievement.title}</p>
                    {!achievement.unlocked && (
                      <p className="text-2xs text-secondary mt-1">{achievement.requirement}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <LightBulbIcon className="w-5 h-5 text-sunglow" />
                <h2 className="heading-4">Tips for Deep Work</h2>
              </div>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-sunglow mt-0.5 text-sm">•</span>
                  <span className="text-sm text-secondary">Turn off all notifications and put your phone in another room</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sunglow mt-0.5 text-sm">•</span>
                  <span className="text-sm text-secondary">Have a clear goal for each focus session</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sunglow mt-0.5 text-sm">•</span>
                  <span className="text-sm text-secondary">Take breaks seriously - step away from your workspace</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sunglow mt-0.5 text-sm">•</span>
                  <span className="text-sm text-secondary">Stay hydrated and keep healthy snacks nearby</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sunglow mt-0.5 text-sm">•</span>
                  <span className="text-sm text-secondary">Use the 2-minute rule: if something takes less than 2 minutes, do it now</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-sunglow mt-0.5 text-sm">•</span>
                  <span className="text-sm text-secondary">Track your progress and celebrate small wins</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}