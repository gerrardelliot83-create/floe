'use client';

import dynamic from 'next/dynamic';
import UnifiedNavigation from '@/components/ui/UnifiedNavigation';

const AdvancedTaskManager = dynamic(
  () => import('@/components/tasks/AdvancedTaskManager'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-12 h-12 mx-auto mb-4 bg-surface rounded-lg"></div>
            <p className="text-sm text-secondary">Loading task manager...</p>
          </div>
        </div>
      </div>
    )
  }
);

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      
      <div className="lg:ml-64 pt-14 lg:pt-0 pb-16 lg:pb-0">
        <div className="container-app py-6 lg:py-8">
          <div className="mb-6">
            <h1 className="heading-2 text-primary mb-1">Task Management</h1>
            <p className="text-sm text-secondary">Organize your tasks with rich content and smart organization</p>
          </div>
          
          <AdvancedTaskManager />
        </div>
      </div>
    </div>
  );
}