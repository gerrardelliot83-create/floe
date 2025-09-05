'use client';

import dynamic from 'next/dynamic';
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
    <div className="min-h-screen bg-dark">
      <Navigation />
      
      <div className="container py-8" style={{ maxWidth: '1600px' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Task Management</h1>
          <p className="text-secondary">Organize your tasks with rich content and smart organization</p>
        </div>
        
        <AdvancedTaskManager />
      </div>
    </div>
  );
}