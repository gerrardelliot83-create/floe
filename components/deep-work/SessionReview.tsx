'use client';

import { useState } from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  BoltIcon,
  StarIcon,
  ChartBarIcon,
  TrophyIcon,
  DocumentTextIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import useStore from '@/lib/store';
import { DeepWorkSession } from '@/lib/types/session.types';
import { formatDistanceStrict } from 'date-fns';

interface SessionReviewProps {
  session: DeepWorkSession;
  completedTasks: string[];
  notes: string;
  onClose: () => void;
}

export default function SessionReview({ session, completedTasks, notes, onClose }: SessionReviewProps) {
  const { tasks, updateSession } = useStore();
  const [rating, setRating] = useState(0);
  const [reflection, setReflection] = useState('');
  const [distractions, setDistractions] = useState('');
  const [learnings, setLearnings] = useState('');

  const sessionDuration = session.endTime 
    ? formatDistanceStrict(new Date(session.startTime), new Date(session.endTime))
    : formatDistanceStrict(new Date(session.startTime), new Date());

  const completionRate = session.taskIds 
    ? (completedTasks.length / session.taskIds.length) * 100
    : 0;

  const handleSave = () => {
    // Save session data
    updateSession(session.id, {
      endTime: new Date().toISOString(),
      completedTaskIds: completedTasks,
      notes,
      review: {
        rating,
        reflection,
        distractions,
        learnings,
      },
      stats: {
        completionRate,
        focusScore: calculateFocusScore(),
        productivityScore: calculateProductivityScore(),
      }
    });
    
    onClose();
  };

  const calculateFocusScore = () => {
    // Calculate based on session completion, breaks taken, etc.
    let score = 70; // Base score
    if (completionRate >= 80) score += 20;
    if (rating >= 4) score += 10;
    return Math.min(score, 100);
  };

  const calculateProductivityScore = () => {
    // Calculate based on tasks completed vs time spent
    const tasksPerHour = (completedTasks.length / (session.duration / 60));
    return Math.min(Math.round(tasksPerHour * 30), 100);
  };

  const achievements = [
    { unlocked: completionRate === 100, icon: TrophyIcon, title: 'Perfect Session', description: 'Completed all tasks' },
    { unlocked: session.duration >= 90, icon: ClockIcon, title: 'Deep Diver', description: '90+ minute session' },
    { unlocked: completedTasks.length >= 5, icon: CheckCircleIcon, title: 'Task Master', description: '5+ tasks done' },
    { unlocked: rating === 5, icon: StarIcon, title: 'Flow State', description: 'Perfect rating' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sunglow/20 to-sunglow/5 p-6 border-b border-border-dark">
          <h2 className="text-2xl font-bold text-primary mb-2">Session Complete!</h2>
          <p className="text-secondary">Great work! Let&apos;s review your session.</p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="card text-center">
              <ClockIcon className="w-8 h-8 text-sunglow mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{sessionDuration}</div>
              <div className="text-sm text-secondary">Duration</div>
            </div>
            <div className="card text-center">
              <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{completedTasks.length}</div>
              <div className="text-sm text-secondary">Tasks Completed</div>
            </div>
            <div className="card text-center">
              <ChartBarIcon className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{Math.round(completionRate)}%</div>
              <div className="text-sm text-secondary">Completion Rate</div>
            </div>
            <div className="card text-center">
              <BoltIcon className="w-8 h-8 text-amber-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">{calculateFocusScore()}</div>
              <div className="text-sm text-secondary">Focus Score</div>
            </div>
          </div>

          {/* Achievements */}
          {achievements.some(a => a.unlocked) && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-primary mb-4">Achievements Unlocked</h3>
              <div className="flex gap-3">
                {achievements.filter(a => a.unlocked).map((achievement, index) => (
                  <div key={index} className="flex-1 p-4 bg-sunglow/10 border border-sunglow rounded-lg">
                    <achievement.icon className="w-6 h-6 text-sunglow mb-2" />
                    <h4 className="font-medium text-primary">{achievement.title}</h4>
                    <p className="text-xs text-secondary">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-primary mb-4">Completed Tasks</h3>
            <div className="space-y-2">
              {completedTasks.map(taskId => {
                const task = tasks.items.find(t => t.id === taskId);
                if (!task) return null;
                return (
                  <div key={taskId} className="flex items-center gap-3 p-3 bg-green-500/5 rounded-lg">
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    <span className="text-primary">{task.title}</span>
                  </div>
                );
              })}
              {completedTasks.length === 0 && (
                <p className="text-secondary text-center py-4">No tasks completed in this session</p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div className="mb-8">
            <h3 className="text-lg font-medium text-primary mb-4">Rate Your Session</h3>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-2 hover:scale-110 transition-transform"
                >
                  {star <= rating ? (
                    <StarSolidIcon className="w-8 h-8 text-sunglow" />
                  ) : (
                    <StarIcon className="w-8 h-8 text-gray-400" />
                  )}
                </button>
              ))}
            </div>
            <p className="text-sm text-secondary">
              {rating === 0 && 'How productive was this session?'}
              {rating === 1 && 'Struggled to focus'}
              {rating === 2 && 'Had some difficulties'}
              {rating === 3 && 'Decent session'}
              {rating === 4 && 'Very productive!'}
              {rating === 5 && 'Amazing flow state!'}
            </p>
          </div>

          {/* Reflection Questions */}
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                What went well?
              </label>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="What helped you stay focused?"
                className="w-full px-3 py-2 bg-surface border border-border-dark rounded-lg focus:border-sunglow focus:outline-none text-primary placeholder-muted resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                What distracted you?
              </label>
              <textarea
                value={distractions}
                onChange={(e) => setDistractions(e.target.value)}
                placeholder="Any interruptions or challenges?"
                className="w-full px-3 py-2 bg-surface border border-border-dark rounded-lg focus:border-sunglow focus:outline-none text-primary placeholder-muted resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                Key learnings
              </label>
              <textarea
                value={learnings}
                onChange={(e) => setLearnings(e.target.value)}
                placeholder="What would you do differently next time?"
                className="w-full px-3 py-2 bg-surface border border-border-dark rounded-lg focus:border-sunglow focus:outline-none text-primary placeholder-muted resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Session Notes (if any) */}
          {notes && (
            <div className="mb-8 p-4 bg-surface rounded-lg">
              <h3 className="text-lg font-medium text-primary mb-2 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Session Notes
              </h3>
              <p className="text-secondary whitespace-pre-wrap">{notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border-dark rounded-lg text-secondary hover:text-primary transition-colors"
            >
              Skip Review
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-sunglow text-white rounded-lg hover:bg-sunglow/90 transition-colors flex items-center justify-center gap-2"
            >
              Save & Continue
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}