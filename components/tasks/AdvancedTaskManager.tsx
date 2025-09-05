'use client';

import { useState } from 'react';
import { Task } from '@/lib/types/database';
import TaskEditor from './TaskEditor';
import { OutputData } from '@editorjs/editorjs';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, ClockIcon, CalendarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface AdvancedTaskManagerProps {
  initialTasks?: Task[];
}

export default function AdvancedTaskManager({ initialTasks = [] }: AdvancedTaskManagerProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
    tags: [] as string[],
    content: null as OutputData | null
  });

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' ? !task.completed : task.completed);
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const createTask = () => {
    if (!newTaskData.title.trim()) return;

    const newTask: Task = {
      id: Date.now().toString(),
      user_id: 'current-user',
      title: newTaskData.title,
      content: newTaskData.content ? (newTaskData.content as unknown as Record<string, unknown>) : undefined,
      completed: false,
      priority: newTaskData.priority,
      due_date: newTaskData.due_date || undefined,
      tags: newTaskData.tags.length > 0 ? newTaskData.tags : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setTasks([...tasks, newTask]);
    setNewTaskData({
      title: '',
      priority: 'medium',
      due_date: '',
      tags: [],
      content: null
    });
    setShowTaskForm(false);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    if (selectedTask?.id === id) {
      setSelectedTask(null);
    }
  };

  const toggleTaskComplete = (id: string) => {
    updateTask(id, { completed: !tasks.find(t => t.id === id)?.completed });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'var(--error)';
      case 'medium': return 'var(--warning)';
      case 'low': return 'var(--success)';
      default: return 'var(--text-secondary)';
    }
  };

  const addTag = (tag: string) => {
    if (tag && !newTaskData.tags.includes(tag)) {
      setNewTaskData({ ...newTaskData, tags: [...newTaskData.tags, tag] });
    }
  };

  const removeTag = (tag: string) => {
    setNewTaskData({ ...newTaskData, tags: newTaskData.tags.filter(t => t !== tag) });
  };

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 2fr' }}>
      <div className="card" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <div className="flex-between mb-4">
          <h3>Tasks</h3>
          <button 
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem' }}
          >
            + New
          </button>
        </div>

        <AnimatePresence>
          {showTaskForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card mb-4"
            >
              <input
                type="text"
                placeholder="Task title..."
                className="input w-full mb-3"
                value={newTaskData.title}
                onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
              />
              
              <div className="flex gap-3 mb-3 mobile-flex-col">
                <select
                  className="input flex-1"
                  value={newTaskData.priority}
                  onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                
                <input
                  type="datetime-local"
                  className="input flex-1"
                  value={newTaskData.due_date}
                  onChange={(e) => setNewTaskData({ ...newTaskData, due_date: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <div className="flex gap-2 mb-2 flex-wrap">
                  {newTaskData.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="card px-2 py-1 text-sm flex gap-1 items-center"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    >
                      {tag}
                      <button 
                        onClick={() => removeTag(tag)}
                        className="text-error"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Add tags (press Enter)..."
                  className="input w-full"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>

              <TaskEditor
                placeholder="Add details..."
                onChange={(data) => setNewTaskData({ ...newTaskData, content: data })}
              />

              <div className="flex gap-3 mt-3">
                <button onClick={createTask} className="btn btn-primary flex-1">
                  Create Task
                </button>
                <button 
                  onClick={() => setShowTaskForm(false)} 
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search tasks..."
            className="input w-full mb-3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <div className="flex gap-2 mobile-flex-col">
            <select 
              className="input flex-1"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as 'all' | 'low' | 'medium' | 'high')}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            
            <select 
              className="input flex-1"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'completed')}
            >
              <option value="all">All Tasks</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="flex-col gap-2">
          <AnimatePresence>
            {filteredTasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => setSelectedTask(task)}
                className={`card p-3 cursor-pointer transition-all ${
                  selectedTask?.id === task.id ? 'border-primary bg-primary/10' : ''
                } ${task.completed ? 'opacity-60' : ''}`}
                style={{ borderLeft: `3px solid ${getPriorityColor(task.priority)}` }}
              >
                <div className="flex-between">
                  <div className="flex gap-3 items-start flex-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskComplete(task.id);
                      }}
                      className={`w-5 h-5 mt-1 rounded border-2 flex-center transition-all ${
                        task.completed 
                          ? 'bg-primary border-primary' 
                          : 'border-gray-600 hover:border-primary'
                      }`}
                    >
                      {task.completed && <CheckIcon className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1">
                      <p className={`font-medium ${task.completed ? 'line-through' : ''}`}>
                        {task.title}
                      </p>
                      {task.due_date && (
                        <p className="text-xs text-secondary mt-1">
                          Due: {new Date(task.due_date).toLocaleString()}
                        </p>
                      )}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {task.tags.map(tag => (
                            <span 
                              key={tag}
                              className="text-xs px-2 py-0.5 card"
                              style={{ borderRadius: 'var(--radius-sm)' }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="card">
        {selectedTask ? (
          <>
            <div className="flex-between mb-4">
              <h3>{selectedTask.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => deleteTask(selectedTask.id)}
                  className="btn btn-ghost text-error"
                >
                  Delete
                </button>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="btn btn-ghost"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex gap-4 mb-3">
                <div>
                  <span className="text-sm text-secondary">Status: </span>
                  <span className={selectedTask.completed ? 'text-success' : 'text-warning'}>
                    {selectedTask.completed ? 'Completed' : 'Active'}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-secondary">Priority: </span>
                  <span style={{ color: getPriorityColor(selectedTask.priority) }}>
                    {selectedTask.priority}
                  </span>
                </div>
              </div>
              
              {selectedTask.due_date && (
                <div className="mb-3">
                  <span className="text-sm text-secondary">Due Date: </span>
                  <span>{new Date(selectedTask.due_date).toLocaleString()}</span>
                </div>
              )}

              {selectedTask.tags && selectedTask.tags.length > 0 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {selectedTask.tags.map(tag => (
                    <span 
                      key={tag}
                      className="px-3 py-1 card"
                      style={{ borderRadius: 'var(--radius-sm)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <h4 className="mb-3">Details</h4>
              {selectedTask.content ? (
                <TaskEditor data={selectedTask.content as unknown as OutputData} readOnly />
              ) : (
                <p className="text-secondary">No details added</p>
              )}
            </div>

            <div className="card">
              <h4 className="mb-3">Quick Actions</h4>
              <div className="flex gap-3 flex-wrap">
                <button className="btn btn-ghost flex items-center gap-2">
                  <ClockIcon className="w-4 h-4" />
                  Start Timer
                </button>
                <button className="btn btn-ghost flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Schedule
                </button>
                <button className="btn btn-ghost flex items-center gap-2">
                  <ArrowPathIcon className="w-4 h-4" />
                  Convert to Project
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-secondary mb-2">Select a task to view details</p>
            <p className="text-sm text-tertiary">Click on any task from the list</p>
          </div>
        )}
      </div>
    </div>
  );
}