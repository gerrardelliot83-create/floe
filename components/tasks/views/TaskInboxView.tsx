'use client';

import { ExtendedTask } from '@/lib/types/task.types';
import TaskItem from '../TaskItem';
import { InboxIcon, SparklesIcon, CalendarIcon, BoltIcon } from '@heroicons/react/24/outline';

interface TaskInboxViewProps {
  tasks: ExtendedTask[];
  onTaskSelect: (id: string) => void;
}

export default function TaskInboxView({ tasks, onTaskSelect }: TaskInboxViewProps) {
  // AI suggestions for task organization
  const getSuggestions = () => {
    const suggestions = [];
    
    // Check for tasks without due dates
    const noDueDate = tasks.filter(t => !t.due_date);
    if (noDueDate.length > 0) {
      suggestions.push({
        type: 'schedule',
        message: `${noDueDate.length} tasks need scheduling`,
        action: 'Schedule tasks',
      });
    }
    
    // Check for tasks without priority
    const noPriority = tasks.filter(t => !t.priority || t.priority === 'medium');
    if (noPriority.length > 0) {
      suggestions.push({
        type: 'prioritize',
        message: `${noPriority.length} tasks need priority assessment`,
        action: 'Set priorities',
      });
    }
    
    // Check for tasks that could be grouped
    const tagCounts = tasks.reduce((acc, task) => {
      task.tags?.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(tagCounts).forEach(([tag, count]) => {
      if (count >= 3) {
        suggestions.push({
          type: 'group',
          message: `${count} tasks with #${tag} could be a project`,
          action: 'Create project',
        });
      }
    });
    
    return suggestions;
  };

  const suggestions = getSuggestions();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Inbox Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <InboxIcon className="w-6 h-6 text-sunglow" />
          <div>
            <h2 className="text-xl font-semibold text-primary">Inbox</h2>
            <p className="text-sm text-secondary">
              {tasks.length} unprocessed {tasks.length === 1 ? 'task' : 'tasks'}
            </p>
          </div>
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="card bg-sunglow/5 border-sunglow/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <SparklesIcon className="w-5 h-5 text-sunglow" />
              <h3 className="font-medium text-primary">Smart Suggestions</h3>
            </div>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 rounded bg-surface"
                >
                  <span className="text-sm text-secondary">{suggestion.message}</span>
                  <button className="text-sunglow text-sm hover:underline">
                    {suggestion.action}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 mb-4">
          <button className="btn btn-secondary btn-sm">
            Process All
          </button>
          <button className="btn btn-ghost btn-sm">
            Sort by Date
          </button>
          <button className="btn btn-ghost btn-sm">
            Sort by Priority
          </button>
          <button className="btn btn-ghost btn-sm">
            Batch Edit
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className="flex gap-2">
            <TaskItem 
              task={task} 
              onSelect={() => onTaskSelect(task.id)}
            />
            <div className="flex flex-col gap-1">
              <button 
                className="p-2 text-secondary hover:text-primary hover:bg-surface rounded transition-colors"
                title="Schedule"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
              <button 
                className="p-2 text-secondary hover:text-primary hover:bg-surface rounded transition-colors"
                title="Set Priority"
              >
                <BoltIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-12">
          <InboxIcon className="w-12 h-12 text-secondary mx-auto mb-3 opacity-50" />
          <p className="text-secondary mb-2">Inbox is empty!</p>
          <p className="text-sm text-muted">
            All tasks have been processed and organized.
          </p>
        </div>
      )}
    </div>
  );
}