'use client';

import dynamic from 'next/dynamic';
import BackgroundProvider from '@/components/ui/BackgroundProvider';
import Navigation from '@/components/ui/Navigation';
import { useStreaks } from '@/lib/hooks/useStreaks';

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
    <BackgroundProvider>
      <div className="min-h-screen p-4">
        <Navigation />
        
        <div className="container max-w-4xl mx-auto">
          <div className="glass-card">
            <EnhancedPomodoroTimer />
          </div>

          <div className="glass-card mt-6">
            <h4 className="mb-4">Achievements</h4>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
              {achievements.map(achievement => (
                <div 
                  key={achievement.id}
                  className={`glass p-3 text-center transition-all ${
                    achievement.unlocked ? '' : 'opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <p className="text-sm font-medium">{achievement.title}</p>
                  {!achievement.unlocked && (
                    <p className="text-xs text-tertiary mt-1">{achievement.requirement}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card mt-6">
            <h4 className="mb-4">Tips for Deep Work</h4>
            <ul className="flex-col gap-3">
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span className="text-secondary">Turn off all notifications and put your phone in another room</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span className="text-secondary">Have a clear goal for each focus session</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span className="text-secondary">Take breaks seriously - step away from your workspace</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">•</span>
                <span className="text-secondary">Stay hydrated and keep healthy snacks nearby</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </BackgroundProvider>
  );
}