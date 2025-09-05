'use client';

import { ExtendedTask } from '@/lib/types/task.types';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskItem from '../TaskItem';
import { ClockIcon, BoltIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface TaskListViewProps {
  tasks: ExtendedTask[];
  onTaskSelect: (id: string) => void;
}

export default function TaskListView({ tasks, onTaskSelect }: TaskListViewProps) {
  // Group tasks by time of day
  const groupTasksByTime = () => {
    const now = new Date();
    const currentHour = now.getHours();
    
    const morning = tasks.filter(t => {
      if (!t.due_date) return false;
      const hour = new Date(t.due_date).getHours();
      return hour >= 6 && hour < 12;
    });
    
    const afternoon = tasks.filter(t => {
      if (!t.due_date) return false;
      const hour = new Date(t.due_date).getHours();
      return hour >= 12 && hour < 17;
    });
    
    const evening = tasks.filter(t => {
      if (!t.due_date) return false;
      const hour = new Date(t.due_date).getHours();
      return hour >= 17 && hour < 22;
    });
    
    const unscheduled = tasks.filter(t => !t.due_date);
    
    return { morning, afternoon, evening, unscheduled };
  };

  const { morning, afternoon, evening, unscheduled } = groupTasksByTime();
  const taskIds = tasks.map(t => t.id);

  const TimeBlock = ({ 
    title, 
    tasks, 
    icon: Icon, 
    color 
  }: { 
    title: string; 
    tasks: ExtendedTask[]; 
    icon: any; 
    color: string;
  }) => {
    if (tasks.length === 0) return null;
    
    return (
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Icon className={`w-5 h-5 ${color}`} />
          <h3 className="font-semibold text-primary">{title}</h3>
          <span className="text-sm text-secondary">({tasks.length})</span>
        </div>
        
        <div className="space-y-2">
          {tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onSelect={() => onTaskSelect(task.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        {/* Priority/Overdue Tasks */}
        {tasks.filter(t => t.priority === 'critical' || t.priority === 'high').length > 0 && (
          <div className="mb-6 p-4 border-l-4 border-sunglow bg-sunglow/5 rounded-r-lg">
            <h3 className="font-semibold text-sunglow mb-3 flex items-center gap-2">
              <BoltIcon className="w-5 h-5" />
              High Priority
            </h3>
            <div className="space-y-2">
              {tasks
                .filter(t => t.priority === 'critical' || t.priority === 'high')
                .map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    onSelect={() => onTaskSelect(task.id)}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Time-based sections */}
        <TimeBlock 
          title="Morning" 
          tasks={morning} 
          icon={ClockIcon} 
          color="text-blue-500" 
        />
        
        <TimeBlock 
          title="Afternoon" 
          tasks={afternoon} 
          icon={ClockIcon} 
          color="text-yellow-500" 
        />
        
        <TimeBlock 
          title="Evening" 
          tasks={evening} 
          icon={ClockIcon} 
          color="text-purple-500" 
        />
        
        <TimeBlock 
          title="Unscheduled" 
          tasks={unscheduled} 
          icon={CalendarIcon} 
          color="text-gray-500" 
        />

        {tasks.length === 0 && (
          <div className="text-center py-12">
            <CalendarIcon className="w-12 h-12 text-secondary mx-auto mb-3 opacity-50" />
            <p className="text-secondary mb-2">No tasks for today</p>
            <p className="text-sm text-muted">
              Add a task or check your other views
            </p>
          </div>
        )}
      </SortableContext>
    </div>
  );
}