'use client';

import { useState } from 'react';
import { 
  ClockIcon, 
  CheckCircleIcon,
  XMarkIcon,
  PlayIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import useStore from '@/lib/store';
// import { ExtendedTask } from '@/lib/types/task.types';

interface SessionPlanningProps {
  onStartSession: (config: SessionConfig) => void;
  onClose: () => void;
}

interface SessionConfig {
  duration: number;
  breakDuration: number;
  taskIds: string[];
  focusType: 'deep' | 'shallow' | 'creative' | 'meeting';
  sessionGoal?: string;
}

export default function SessionPlanning({ onStartSession, onClose }: SessionPlanningProps) {
  const { tasks } = useStore();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [duration, setDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [focusType, setFocusType] = useState<SessionConfig['focusType']>('deep');
  const [sessionGoal, setSessionGoal] = useState('');
  const [activeTab, setActiveTab] = useState<'tasks' | 'templates'>('tasks');

  // Filter today's tasks and high priority tasks
  const suggestedTasks = tasks.items.filter(task => {
    if (task.completed) return false;
    const isToday = task.due_date && new Date(task.due_date).toDateString() === new Date().toDateString();
    const isHighPriority = task.priority === 'high';
    return isToday || isHighPriority;
  });

  const otherTasks = tasks.items.filter(task => 
    !task.completed && !suggestedTasks.includes(task)
  );

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const getTotalEstimatedTime = () => {
    return selectedTasks.reduce((total, taskId) => {
      const task = tasks.items.find(t => t.id === taskId);
      return total + 30; // Default 30 minutes per task
    }, 0);
  };

  const templates = [
    { name: 'Quick Focus', duration: 25, break: 5, type: 'deep' as const, description: 'Classic Pomodoro session' },
    { name: 'Deep Dive', duration: 90, break: 15, type: 'deep' as const, description: 'Extended focus for complex work' },
    { name: 'Creative Sprint', duration: 45, break: 10, type: 'creative' as const, description: 'Ideal for design and ideation' },
    { name: 'Meeting Block', duration: 30, break: 5, type: 'meeting' as const, description: 'Structured meeting time' },
  ];

  const applyTemplate = (template: typeof templates[0]) => {
    setDuration(template.duration);
    setBreakDuration(template.break);
    setFocusType(template.type);
  };

  const handleStart = () => {
    onStartSession({
      duration,
      breakDuration,
      taskIds: selectedTasks,
      focusType,
      sessionGoal: sessionGoal || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-border-dark p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary">Plan Your Focus Session</h2>
              <p className="text-secondary mt-1">Select tasks and configure your work session</p>
            </div>
            <button onClick={onClose} className="text-secondary hover:text-primary">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Tasks */}
          <div className="flex-1 overflow-y-auto p-6 border-r border-border-dark">
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'tasks'
                    ? 'bg-sunglow text-white'
                    : 'bg-surface text-secondary hover:text-primary'
                }`}
              >
                Select Tasks
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'templates'
                    ? 'bg-sunglow text-white'
                    : 'bg-surface text-secondary hover:text-primary'
                }`}
              >
                Templates
              </button>
            </div>

            {activeTab === 'tasks' ? (
              <div className="space-y-4">
                {/* Suggested Tasks */}
                {suggestedTasks.length > 0 && (
                  <div>
                    <h3 className="font-medium text-primary mb-2 flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4 text-sunglow" />
                      Suggested for Today
                    </h3>
                    <div className="space-y-2">
                      {suggestedTasks.map(task => (
                        <div
                          key={task.id}
                          onClick={() => toggleTaskSelection(task.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedTasks.includes(task.id)
                              ? 'border-sunglow bg-sunglow/10'
                              : 'border-border-dark hover:border-secondary'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center ${
                              selectedTasks.includes(task.id)
                                ? 'bg-sunglow border-sunglow'
                                : 'border-gray-400'
                            }`}>
                              {selectedTasks.includes(task.id) && (
                                <CheckCircleIcon className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-primary">{task.title}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-secondary">
                                {task.priority && (
                                  <span className={`px-2 py-0.5 rounded ${
                                    task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                    task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                    'bg-green-500/10 text-green-500'
                                  }`}>
                                    {task.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Tasks */}
                {otherTasks.length > 0 && (
                  <div>
                    <h3 className="font-medium text-primary mb-2">All Tasks</h3>
                    <div className="space-y-2">
                      {otherTasks.map(task => (
                        <div
                          key={task.id}
                          onClick={() => toggleTaskSelection(task.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedTasks.includes(task.id)
                              ? 'border-sunglow bg-sunglow/10'
                              : 'border-border-dark hover:border-secondary'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center ${
                              selectedTasks.includes(task.id)
                                ? 'bg-sunglow border-sunglow'
                                : 'border-gray-400'
                            }`}>
                              {selectedTasks.includes(task.id) && (
                                <CheckCircleIcon className="w-3 h-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-primary">{task.title}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map(template => (
                  <div
                    key={template.name}
                    onClick={() => applyTemplate(template)}
                    className="p-4 rounded-lg border border-border-dark hover:border-sunglow cursor-pointer transition-all"
                  >
                    <h4 className="font-medium text-primary">{template.name}</h4>
                    <p className="text-sm text-secondary mt-1">{template.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-secondary">
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {template.duration} min
                      </span>
                      <span>Break: {template.break} min</span>
                      <span className="px-2 py-0.5 bg-surface rounded">
                        {template.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Configuration */}
          <div className="w-80 p-6 space-y-6">
            {/* Session Goal */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Session Goal (Optional)
              </label>
              <textarea
                value={sessionGoal}
                onChange={(e) => setSessionGoal(e.target.value)}
                placeholder="What do you want to accomplish?"
                className="w-full px-3 py-2 bg-surface border border-border-dark rounded-lg focus:border-sunglow focus:outline-none text-primary placeholder-muted resize-none"
                rows={3}
              />
            </div>

            {/* Duration Settings */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Session Duration
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-primary font-medium w-16 text-right">
                  {duration} min
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Break Duration
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="5"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-primary font-medium w-16 text-right">
                  {breakDuration} min
                </span>
              </div>
            </div>

            {/* Focus Type */}
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Focus Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['deep', 'shallow', 'creative', 'meeting'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setFocusType(type)}
                    className={`px-3 py-2 rounded-lg capitalize transition-colors ${
                      focusType === type
                        ? 'bg-sunglow text-white'
                        : 'bg-surface text-secondary hover:text-primary'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-surface rounded-lg">
              <h4 className="font-medium text-primary mb-3">Session Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">Selected Tasks</span>
                  <span className="text-primary font-medium">{selectedTasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Total Est. Time</span>
                  <span className="text-primary font-medium">{getTotalEstimatedTime()} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Session Length</span>
                  <span className="text-primary font-medium">{duration} min</span>
                </div>
                {getTotalEstimatedTime() > duration && (
                  <p className="text-xs text-amber-500 mt-2">
                    Tasks may take longer than session duration
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border-dark rounded-lg text-secondary hover:text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStart}
                className="flex-1 px-4 py-2 bg-sunglow text-white rounded-lg hover:bg-sunglow/90 transition-colors flex items-center justify-center gap-2"
              >
                <PlayIcon className="w-4 h-4" />
                Start Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}