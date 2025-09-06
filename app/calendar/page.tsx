'use client';

import dynamic from 'next/dynamic';
import UnifiedNavigation from '@/components/ui/UnifiedNavigation';

const IntegratedCalendar = dynamic(
  () => import('@/components/calendar/IntegratedCalendar'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-12 h-12 mx-auto mb-4 bg-surface rounded-lg"></div>
            <p className="text-sm text-secondary">Loading calendar...</p>
          </div>
        </div>
      </div>
    )
  }
);

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      
      <div className="lg:ml-64 pt-14 lg:pt-0 pb-16 lg:pb-0">
        <div className="container-app py-6 lg:py-8">
          <div className="mb-6">
            <h1 className="heading-2 text-primary mb-1">Calendar</h1>
            <p className="text-sm text-secondary">Schedule your tasks and sessions</p>
          </div>
          
          <IntegratedCalendar />
        </div>
      </div>
    </div>
  );
}