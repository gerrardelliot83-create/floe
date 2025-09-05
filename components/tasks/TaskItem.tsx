'use client';

import { ExtendedTask } from '@/lib/types/task.types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  TagIcon,
  CalendarIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface TaskItemProps {
  task: ExtendedTask;
  onSelect: () => void;
  compact?: boolean;
  isDragging?: boolean;
}

export default function TaskItem({ task, onSelect, compact = false, isDragging }: TaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getEnergyIcon = (energy?: string) => {
    switch (energy) {
      case 'high': return '⚡⚡⚡';
      case 'medium': return '⚡⚡';
      case 'low': return '⚡';
      default: return '';
    }
  };

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={onSelect}
        className={`p-3 card hover:border-sunglow cursor-pointer transition-all ${
          isDragging ? 'opacity-50' : ''
        } ${task.completed ? 'opacity-60' : ''}`}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Toggle complete
            }}
            className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${
              task.completed
                ? 'bg-sunglow border-sunglow'
                : 'border-gray-400 hover:border-sunglow'
            }`}
          >
            {task.completed && <CheckCircleIcon className="w-3 h-3 text-white" />}
          </button>
          
          <span className={`flex-1 text-sm ${task.completed ? 'line-through' : ''}`}>
            {task.title}
          </span>
          
          {task.due_date && (
            <span className="text-xs text-secondary">
              {format(new Date(task.due_date), 'MMM d')}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      className={`card hover:border-sunglow cursor-pointer transition-all ${
        isDragging ? 'opacity-50 shadow-2xl' : ''
      } ${task.completed ? 'opacity-60' : ''}`}
    >
      <div className="flex gap-3">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Toggle complete
          }}
          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 ${
            task.completed
              ? 'bg-sunglow border-sunglow'
              : 'border-gray-400 hover:border-sunglow'
          }`}
        >
          {task.completed && <CheckCircleIcon className="w-4 h-4 text-white" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={`font-medium text-primary ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </h4>
            
            <div className="flex items-center gap-1">
              {task.estimatedMinutes && (
                <span className="text-xs text-secondary flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />
                  {task.estimatedMinutes}m
                </span>
              )}
              
              {task.energy && (
                <span className="text-xs" title={`${task.energy} energy`}>
                  {getEnergyIcon(task.energy)}
                </span>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="flex items-center gap-3 text-xs">
            {task.priority && (
              <span className={`px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            )}
            
            {task.due_date && (
              <span className="text-secondary flex items-center gap-1">
                <CalendarIcon className="w-3 h-3" />
                {format(new Date(task.due_date), 'MMM d, h:mm a')}
              </span>
            )}
            
            {task.project && (
              <span className="text-secondary flex items-center gap-1">
                <FolderIcon className="w-3 h-3" />
                {task.project.name}
              </span>
            )}
            
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1">
                <TagIcon className="w-3 h-3 text-secondary" />
                {task.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-secondary">
                    {tag}
                  </span>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-secondary">+{task.tags.length - 2}</span>
                )}
              </div>
            )}
          </div>

          {/* Subtasks indicator */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="mt-2 text-xs text-secondary">
              {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks complete
            </div>
          )}
        </div>
      </div>
    </div>
  );
}