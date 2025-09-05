'use client';

import { useState, useEffect, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import useStore from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Task } from '@/lib/types/database';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { parseNaturalLanguage } from '@/lib/utils/natural-language';

export default function QuickAddTask() {
  const supabase = createClient();
  const { quickAddOpen, toggleQuickAdd, addTask, user } = useStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (quickAddOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [quickAddOpen]);

  // Keyboard shortcut to close
  useHotkeys('escape', () => {
    if (quickAddOpen) toggleQuickAdd();
  }, { enableOnFormTags: true });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user.id) return;

    setLoading(true);
    
    try {
      // Parse natural language input
      const parsed = parseNaturalLanguage(input);
      
      // Create task object
      const newTask: Partial<Task> = {
        user_id: user.id,
        title: parsed.title,
        priority: parsed.priority || 'medium',
        due_date: parsed.dueDate?.toISOString(),
        tags: parsed.tags || [],
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Save to database
      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;

      // Add to store
      addTask(data);

      // Reset and close
      setInput('');
      toggleQuickAdd();

      // Show success toast (you can implement this)
      console.log('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!quickAddOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={toggleQuickAdd}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4">
        <form onSubmit={handleSubmit} className="card shadow-2xl">
          <div className="flex items-center gap-4 p-4">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What needs to be done? (e.g., 'Meeting tomorrow at 2pm high priority #work')"
              className="flex-1 text-lg bg-transparent text-primary placeholder-secondary focus:outline-none"
              disabled={loading}
            />
            <button
              type="button"
              onClick={toggleQuickAdd}
              className="text-secondary hover:text-primary transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="px-4 pb-4 flex items-center justify-between">
            <div className="text-xs text-secondary">
              <span className="inline-flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-bg-dark rounded border border-border-dark">Enter</kbd>
                to create
              </span>
              <span className="inline-flex items-center gap-2 ml-3">
                <kbd className="px-1.5 py-0.5 bg-bg-dark rounded border border-border-dark">ESC</kbd>
                to cancel
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={toggleQuickAdd}
                className="btn btn-ghost text-sm"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary text-sm"
                disabled={loading || !input.trim()}
              >
                {loading ? 'Creating...' : 'Create Task'}
              </button>
            </div>
          </div>

          {/* Natural Language Hints */}
          <div className="px-4 pb-4 border-t border-border-dark pt-3">
            <p className="text-xs text-secondary mb-2">Examples:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setInput('Call John tomorrow at 2pm')}
                className="text-xs px-2 py-1 bg-surface rounded hover:bg-surface-dark transition-colors text-secondary"
              >
                Call John tomorrow at 2pm
              </button>
              <button
                type="button"
                onClick={() => setInput('Review PR high priority #dev')}
                className="text-xs px-2 py-1 bg-surface rounded hover:bg-surface-dark transition-colors text-secondary"
              >
                Review PR high priority #dev
              </button>
              <button
                type="button"
                onClick={() => setInput('Weekly team meeting every Monday')}
                className="text-xs px-2 py-1 bg-surface rounded hover:bg-surface-dark transition-colors text-secondary"
              >
                Weekly team meeting every Monday
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}