'use client';

import { ExtendedTask, MatrixQuadrant } from '@/lib/types/task.types';
import TaskItem from '../TaskItem';
import { FireIcon, StarIcon, ClockIcon, ArchiveBoxIcon } from '@heroicons/react/24/outline';

interface TaskMatrixViewProps {
  tasks: ExtendedTask[];
  onTaskSelect: (id: string) => void;
}

export default function TaskMatrixView({ tasks, onTaskSelect }: TaskMatrixViewProps) {
  // Categorize tasks into Eisenhower Matrix quadrants
  const categorizeTask = (task: ExtendedTask): string => {
    const isUrgent = task.priority === 'high' ||
      (task.due_date && new Date(task.due_date) <= new Date(Date.now() + 24 * 60 * 60 * 1000));
    const isImportant = task.priority === 'high';

    if (isUrgent && isImportant) return 'urgent-important';
    if (!isUrgent && isImportant) return 'not-urgent-important';
    if (isUrgent && !isImportant) return 'urgent-not-important';
    return 'not-urgent-not-important';
  };

  const quadrants: MatrixQuadrant[] = [
    {
      id: 'urgent-important',
      title: 'Do First',
      description: 'Critical tasks that need immediate attention',
      tasks: tasks.filter(t => categorizeTask(t) === 'urgent-important'),
      color: 'bg-red-500/10 border-red-500',
    },
    {
      id: 'not-urgent-important',
      title: 'Schedule',
      description: 'Important tasks to plan and schedule',
      tasks: tasks.filter(t => categorizeTask(t) === 'not-urgent-important'),
      color: 'bg-blue-500/10 border-blue-500',
    },
    {
      id: 'urgent-not-important',
      title: 'Delegate',
      description: 'Urgent but less important tasks',
      tasks: tasks.filter(t => categorizeTask(t) === 'urgent-not-important'),
      color: 'bg-yellow-500/10 border-yellow-500',
    },
    {
      id: 'not-urgent-not-important',
      title: 'Eliminate',
      description: 'Tasks to reconsider or remove',
      tasks: tasks.filter(t => categorizeTask(t) === 'not-urgent-not-important'),
      color: 'bg-gray-500/10 border-gray-500',
    },
  ];

  const getIcon = (id: string) => {
    switch(id) {
      case 'urgent-important': return FireIcon;
      case 'not-urgent-important': return StarIcon;
      case 'urgent-not-important': return ClockIcon;
      case 'not-urgent-not-important': return ArchiveBoxIcon;
      default: return FireIcon;
    }
  };

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
        {quadrants.map((quadrant) => {
          const Icon = getIcon(quadrant.id);
          return (
            <div
              key={quadrant.id}
              className={`card border-2 ${quadrant.color} flex flex-col`}
            >
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-5 h-5" />
                  <h3 className="font-bold text-lg text-primary">{quadrant.title}</h3>
                  <span className="text-sm text-secondary ml-auto">
                    {quadrant.tasks.length}
                  </span>
                </div>
                <p className="text-sm text-secondary">{quadrant.description}</p>
              </div>

              <div className="flex-1 overflow-auto">
                <div className="space-y-2">
                  {quadrant.tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onSelect={() => onTaskSelect(task.id)}
                      compact
                    />
                  ))}
                </div>

                {quadrant.tasks.length === 0 && (
                  <div className="text-center py-8 text-secondary text-sm">
                    No tasks in this quadrant
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}