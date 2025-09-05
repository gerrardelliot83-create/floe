'use client';

import { useState } from 'react';
import { XMarkIcon, ClockIcon, CalendarIcon, TagIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import useStore from '@/lib/store';
import dynamic from 'next/dynamic';
import { format } from 'date-fns';

const TaskEditor = dynamic(() => import('./TaskEditor'), { ssr: false });

interface TaskDetailPanelProps {
  taskId: string;
  onClose: () => void;
}

export default function TaskDetailPanel({ taskId, onClose }: TaskDetailPanelProps) {
  const { tasks, updateTask } = useStore();
  const task = tasks.items.find(t => t.id === taskId);
  
  const [title, setTitle] = useState(task?.title || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.due_date || '');
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [estimatedMinutes, setEstimatedMinutes] = useState(task?.estimatedMinutes || 30);
  const [energy, setEnergy] = useState(task?.energy || 'medium');
  const [content, setContent] = useState(task?.content || {});

  if (!task) return null;

  const handleSave = () => {
    updateTask(taskId, {
      title,
      priority,
      due_date: dueDate,
      tags,
      estimatedMinutes,
      energy,
      content,
      updated_at: new Date().toISOString(),
    });
  };

  const handleStartTimer = () => {
    // Link to timer with this task
    console.log('Start timer for task:', taskId);
  };

  return (
    <div className="w-96 border-l border-border-dark bg-surface h-full overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-surface border-b border-border-dark p-4 flex items-center justify-between">
        <h3 className="font-semibold text-primary">Task Details</h3>
        <button onClick={onClose} className="text-secondary hover:text-primary">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-border-dark">
        <div className="flex gap-2">
          <button 
            onClick={handleStartTimer}
            className="flex-1 btn btn-primary btn-sm flex items-center justify-center gap-2"
          >
            <ClockIcon className="w-4 h-4" />
            Start Timer
          </button>
          <button className="flex-1 btn btn-secondary btn-sm">
            Mark Complete
          </button>
        </div>
      </div>

      {/* Task Details */}
      <div className="p-4 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            className="input w-full"
          />
        </div>

        {/* Priority & Energy */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value as 'critical' | 'high' | 'medium' | 'low');
                handleSave();
              }}
              className="input w-full"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Energy</label>
            <select
              value={energy}
              onChange={(e) => {
                setEnergy(e.target.value as 'high' | 'medium' | 'low');
                handleSave();
              }}
              className="input w-full"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Due Date & Time Estimate */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Due Date</label>
            <input
              type="datetime-local"
              value={dueDate ? format(new Date(dueDate), "yyyy-MM-dd'T'HH:mm") : ''}
              onChange={(e) => {
                setDueDate(e.target.value);
                handleSave();
              }}
              className="input w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-secondary mb-1">Est. Time</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => {
                  setEstimatedMinutes(parseInt(e.target.value));
                  handleSave();
                }}
                className="input w-full"
                min="5"
                step="5"
              />
              <span className="text-secondary">min</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-surface rounded text-sm text-secondary border border-border-dark"
              >
                #{tag}
                <button
                  onClick={() => {
                    setTags(tags.filter(t => t !== tag));
                    handleSave();
                  }}
                  className="ml-1 text-red-500 hover:text-red-400"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add tag and press Enter"
            className="input w-full"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                setTags([...tags, e.currentTarget.value]);
                e.currentTarget.value = '';
                handleSave();
              }
            }}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1">Description</label>
          <div className="border border-border-dark rounded-lg p-2 min-h-[200px]">
            <TaskEditor
              content={content}
              onChange={(newContent) => {
                setContent(newContent);
                handleSave();
              }}
            />
          </div>
        </div>

        {/* Subtasks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-secondary">Subtasks</label>
            <button className="text-sunglow text-sm hover:underline">
              + Add Subtask
            </button>
          </div>
          <div className="space-y-2">
            {/* Subtasks would go here */}
            <p className="text-sm text-secondary text-center py-4">No subtasks yet</p>
          </div>
        </div>

        {/* Activity Log */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">Activity</label>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 text-secondary">
              <ChatBubbleLeftIcon className="w-4 h-4 mt-0.5" />
              <div>
                <p>Task created</p>
                <p className="text-xs opacity-75">{task.created_at && format(new Date(task.created_at), 'MMM d, h:mm a')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}