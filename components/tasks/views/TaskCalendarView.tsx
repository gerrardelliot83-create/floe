'use client';

import { useState } from 'react';
import { ExtendedTask } from '@/lib/types/task.types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import TaskItem from '../TaskItem';

interface TaskCalendarViewProps {
  tasks: ExtendedTask[];
  onTaskSelect: (id: string) => void;
}

export default function TaskCalendarView({ tasks, onTaskSelect }: TaskCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(new Date(task.due_date), day);
    });
  };

  return (
    <div>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-primary">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="btn btn-ghost btn-sm"
          >
            Previous
          </button>
          <button 
            onClick={() => setCurrentDate(new Date())}
            className="btn btn-secondary btn-sm"
          >
            Today
          </button>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="btn btn-ghost btn-sm"
          >
            Next
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium text-secondary text-sm py-2">
            {day}
          </div>
        ))}
        
        {/* Calendar Days */}
        {days.map(day => {
          const dayTasks = getTasksForDay(day);
          const isCurrentDay = isToday(day);
          
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[100px] p-2 border rounded-lg ${
                isCurrentDay 
                  ? 'border-sunglow bg-sunglow/5' 
                  : 'border-border-dark hover:border-secondary'
              }`}
            >
              <div className="text-sm font-medium text-primary mb-1">
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    onClick={() => onTaskSelect(task.id)}
                    className="text-xs p-1 rounded bg-surface hover:bg-sunglow/10 cursor-pointer truncate"
                  >
                    <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                      task.priority === 'critical' ? 'bg-red-500' :
                      task.priority === 'high' ? 'bg-orange-500' :
                      task.priority === 'medium' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    {task.title}
                  </div>
                ))}
                
                {dayTasks.length > 3 && (
                  <div className="text-xs text-secondary text-center">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Tasks */}
      <div className="mt-6">
        <h4 className="font-semibold text-primary mb-3">
          Tasks for {format(currentDate, 'MMMM d, yyyy')}
        </h4>
        <div className="space-y-2">
          {getTasksForDay(currentDate).map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onSelect={() => onTaskSelect(task.id)}
            />
          ))}
          
          {getTasksForDay(currentDate).length === 0 && (
            <p className="text-secondary text-center py-4">
              No tasks scheduled for this day
            </p>
          )}
        </div>
      </div>
    </div>
  );
}