'use client';

import dynamic from 'next/dynamic';
import BackgroundProvider from '@/components/ui/BackgroundProvider';
import Navigation from '@/components/ui/Navigation';

const AdvancedTaskManager = dynamic(
  () => import('@/components/tasks/AdvancedTaskManager'),
  { 
    ssr: false,
    loading: () => (
      <div className="text-center py-12">
        <p className="text-secondary">Loading task manager...</p>
      </div>
    )
  }
);

export default function TasksPage() {
  return (
    <BackgroundProvider>
      <div className="min-h-screen p-4">
        <Navigation />
        
        <div className="container" style={{ maxWidth: '1600px' }}>
          <div className="mb-6">
            <h2>Task Management</h2>
            <p className="text-secondary">Organize your tasks with rich content and smart organization</p>
          </div>
          
          <AdvancedTaskManager />
        </div>
      </div>
    </BackgroundProvider>
  );
}