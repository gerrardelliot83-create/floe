'use client';

import { useState, useEffect } from 'react';
import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  ArrowPathIcon,
  XMarkIcon,
  CheckCircleIcon,
  ForwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import useStore from '@/lib/store';
import { DeepWorkSession } from '@/lib/types/session.types';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedFocusModeProps {
  session: DeepWorkSession;
  onEndSession: () => void;
  onMinimize?: () => void;
}

export default function EnhancedFocusMode({ session, onEndSession, onMinimize }: EnhancedFocusModeProps) {
  const { tasks, updateTask } = useStore();
  const [timeLeft, setTimeLeft] = useState(session.duration * 60);
  const [isBreak, setIsBreak] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [notes, setNotes] = useState('');

  const currentTask = session.taskIds && session.taskIds.length > 0
    ? tasks.items.find(t => t.id === session.taskIds[currentTaskIndex])
    : null;

  // Timer logic
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (soundEnabled) {
            // Play notification sound
            const audio = new Audio('/sounds/bell.mp3');
            audio.play().catch(() => {});
          }

          if (isBreak) {
            // End break, start next work session
            setIsBreak(false);
            return session.duration * 60;
          } else {
            // Start break
            setIsBreak(true);
            return session.breakDuration * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, isBreak, session.duration, session.breakDuration, soundEnabled]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const skipToBreak = () => {
    setIsBreak(true);
    setTimeLeft(session.breakDuration * 60);
  };

  const markTaskComplete = (taskId: string) => {
    updateTask(taskId, { completed: true });
    setCompletedTasks([...completedTasks, taskId]);
    
    // Move to next task
    if (currentTaskIndex < (session.taskIds?.length || 0) - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  const nextTask = () => {
    if (currentTaskIndex < (session.taskIds?.length || 0) - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  const previousTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  };

  const progressPercentage = isBreak 
    ? ((session.breakDuration * 60 - timeLeft) / (session.breakDuration * 60)) * 100
    : ((session.duration * 60 - timeLeft) / (session.duration * 60)) * 100;

  // Zen mode - minimal UI
  const [zenMode, setZenMode] = useState(false);

  if (zenMode) {
    return (
      <div className="fixed inset-0 bg-background flex flex-col items-center justify-center">
        <button
          onClick={() => setZenMode(false)}
          className="absolute top-4 right-4 text-secondary hover:text-primary opacity-20 hover:opacity-100 transition-opacity"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="text-center">
          <div className="text-8xl font-light text-primary mb-4">
            {formatTime(timeLeft)}
          </div>
          {currentTask && (
            <p className="text-xl text-secondary">{currentTask.title}</p>
          )}
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
          <button
            onClick={togglePause}
            className="p-3 rounded-full bg-surface hover:bg-sunglow/10 transition-colors"
          >
            {isPaused ? <PlayIcon className="w-6 h-6 text-sunglow" /> : <PauseIcon className="w-6 h-6 text-sunglow" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border-dark px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-primary">
              {isBreak ? 'Break Time' : `${session.focusType === 'deep' ? 'Deep Focus' : session.focusType} Session`}
            </h2>
            {session.goal && (
              <p className="text-secondary">Goal: {session.goal}</p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 text-secondary hover:text-primary"
            >
              {soundEnabled ? <SpeakerWaveIcon className="w-5 h-5" /> : <SpeakerXMarkIcon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setZenMode(true)}
              className="px-3 py-1 text-sm bg-surface rounded hover:bg-sunglow/10 text-secondary hover:text-primary"
            >
              Zen Mode
            </button>
            <button
              onClick={onMinimize}
              className="p-2 text-secondary hover:text-primary"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
            <button
              onClick={onEndSession}
              className="p-2 text-secondary hover:text-red-500"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Center - Timer and Current Task */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          {/* Timer Display */}
          <div className="relative mb-12">
            <svg className="w-64 h-64 transform -rotate-90">
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-surface"
              />
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 120}`}
                strokeDashoffset={`${2 * Math.PI * 120 * (1 - progressPercentage / 100)}`}
                className={isBreak ? "text-green-500" : "text-sunglow"}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-5xl font-light text-primary">
                {formatTime(timeLeft)}
              </div>
              <p className="text-secondary mt-2">
                {isBreak ? 'Recharge' : 'Focus'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={togglePause}
              className="p-4 rounded-full bg-sunglow text-white hover:bg-sunglow/90 transition-colors"
            >
              {isPaused ? <PlayIcon className="w-6 h-6" /> : <PauseIcon className="w-6 h-6" />}
            </button>
            <button
              onClick={skipToBreak}
              className="p-3 rounded-full bg-surface hover:bg-sunglow/10 transition-colors"
              disabled={isBreak}
            >
              <ForwardIcon className="w-5 h-5 text-secondary" />
            </button>
            <button
              onClick={onEndSession}
              className="p-3 rounded-full bg-surface hover:bg-red-500/10 transition-colors"
            >
              <StopIcon className="w-5 h-5 text-secondary hover:text-red-500" />
            </button>
          </div>

          {/* Current Task */}
          {currentTask && !isBreak && (
            <div className="w-full max-w-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-primary">Current Task</h3>
                <span className="text-sm text-secondary">
                  {currentTaskIndex + 1} of {session.taskIds?.length || 0}
                </span>
              </div>
              
              <div className="p-4 bg-surface rounded-lg border border-border-dark">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-primary">{currentTask.title}</p>
                    {currentTask.description && (
                      <p className="text-sm text-secondary mt-1">{currentTask.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-secondary">
                      {currentTask.estimatedMinutes && (
                        <span>Est: {currentTask.estimatedMinutes} min</span>
                      )}
                      {currentTask.priority && (
                        <span className={`px-2 py-0.5 rounded ${
                          currentTask.priority === 'critical' ? 'bg-red-500/10 text-red-500' :
                          currentTask.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                          currentTask.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                          'bg-green-500/10 text-green-500'
                        }`}>
                          {currentTask.priority}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => markTaskComplete(currentTask.id)}
                    className={`ml-4 p-2 rounded transition-colors ${
                      completedTasks.includes(currentTask.id)
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-surface hover:bg-sunglow/10 text-secondary hover:text-sunglow'
                    }`}
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Task Navigation */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border-dark">
                  <button
                    onClick={previousTask}
                    disabled={currentTaskIndex === 0}
                    className="text-sm text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={nextTask}
                    disabled={currentTaskIndex === (session.taskIds?.length || 0) - 1}
                    className="text-sm text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Break Message */}
          {isBreak && (
            <div className="text-center">
              <h3 className="text-2xl font-medium text-primary mb-2">Take a Break!</h3>
              <p className="text-secondary">Stand up, stretch, hydrate</p>
              
              <div className="mt-6 p-4 bg-surface rounded-lg max-w-md">
                <p className="text-sm text-secondary mb-2">Tasks completed this session:</p>
                <p className="text-2xl font-semibold text-primary">{completedTasks.length}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Session Notes */}
        <div className="w-80 border-l border-border-dark p-6 overflow-y-auto">
          <h3 className="font-medium text-primary mb-4">Session Notes</h3>
          
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Capture thoughts, ideas, or blockers..."
            className="w-full h-40 px-3 py-2 bg-surface border border-border-dark rounded-lg focus:border-sunglow focus:outline-none text-primary placeholder-muted resize-none"
          />

          {/* Task List */}
          <div className="mt-6">
            <h4 className="font-medium text-primary mb-3">Session Tasks</h4>
            <div className="space-y-2">
              {session.taskIds?.map((taskId, index) => {
                const task = tasks.items.find(t => t.id === taskId);
                if (!task) return null;
                
                return (
                  <div
                    key={taskId}
                    onClick={() => setCurrentTaskIndex(index)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      index === currentTaskIndex
                        ? 'bg-sunglow/10 border border-sunglow'
                        : 'bg-surface hover:bg-surface/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${
                        completedTasks.includes(taskId)
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-400'
                      }`}>
                        {completedTasks.includes(taskId) && (
                          <CheckCircleIcon className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <p className={`text-sm ${completedTasks.includes(taskId) ? 'line-through text-secondary' : 'text-primary'}`}>
                        {task.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Session Stats */}
          <div className="mt-6 p-4 bg-surface rounded-lg">
            <h4 className="font-medium text-primary mb-3">Session Stats</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Started</span>
                <span className="text-primary">
                  {formatDistanceToNow(new Date(session.startTime))} ago
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Focus Type</span>
                <span className="text-primary capitalize">{session.focusType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Completed</span>
                <span className="text-primary">{completedTasks.length} tasks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}