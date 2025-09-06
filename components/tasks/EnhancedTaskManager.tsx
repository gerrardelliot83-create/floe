'use client';

import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import useStore from '@/lib/store';
import { ExtendedTask, TaskView } from '@/lib/types/task.types';
import TaskListView from './views/TaskListView';
import TaskMatrixView from './views/TaskMatrixView';
import TaskBoardView from './views/TaskBoardView';
import TaskCalendarView from './views/TaskCalendarView';
import TaskInboxView from './views/TaskInboxView';
import TaskProjectsView from './views/TaskProjectsView';
import TaskDetailPanel from './TaskDetailPanel';
import { 
  InboxIcon, 
  CalendarDaysIcon, 
  Squares2X2Icon, 
  RectangleGroupIcon,
  FolderIcon,
  FunnelIcon,
  PlusIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

export default function EnhancedTaskManager() {
  const { tasks } = useStore();
  const [currentView, setCurrentView] = useState<TaskView>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // View configurations
  const views = [
    { 
      id: 'today' as TaskView, 
      name: 'Today', 
      icon: CalendarDaysIcon,
      description: 'Focus on what matters today'
    },
    { 
      id: 'inbox' as TaskView, 
      name: 'Inbox', 
      icon: InboxIcon,
      description: 'Unprocessed tasks'
    },
    { 
      id: 'projects' as TaskView, 
      name: 'Projects', 
      icon: FolderIcon,
      description: 'Organized by project'
    },
    { 
      id: 'matrix' as TaskView, 
      name: 'Matrix', 
      icon: Squares2X2Icon,
      description: 'Eisenhower Matrix'
    },
    { 
      id: 'board' as TaskView, 
      name: 'Board', 
      icon: RectangleGroupIcon,
      description: 'Kanban board'
    },
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      // Handle reordering logic based on view
      console.log('Reorder task', active.id, 'to position of', over.id);
      // Implementation depends on current view
    }
  };

  const getFilteredTasks = (): ExtendedTask[] => {
    let filtered = tasks.items;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply view-specific filters
    switch (currentView) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        filtered = filtered.filter(task => {
          if (task.completed) return false;
          if (!task.due_date) return false;
          const dueDate = new Date(task.due_date);
          return dueDate >= today && dueDate < tomorrow;
        });
        break;
        
      case 'inbox':
        filtered = filtered.filter(task => 
          !task.completed && 
          !task.parent_id
        );
        break;
        
      default:
        // Other views handle their own filtering
        break;
    }

    return filtered as ExtendedTask[];
  };

  const renderView = () => {
    const filteredTasks = getFilteredTasks();

    switch (currentView) {
      case 'today':
        return <TaskListView tasks={filteredTasks} onTaskSelect={setSelectedTaskId} />;
      case 'inbox':
        return <TaskInboxView tasks={filteredTasks} onTaskSelect={setSelectedTaskId} />;
      case 'projects':
        return <TaskProjectsView tasks={filteredTasks} onTaskSelect={setSelectedTaskId} />;
      case 'matrix':
        return <TaskMatrixView tasks={filteredTasks} onTaskSelect={setSelectedTaskId} />;
      case 'board':
        return <TaskBoardView tasks={filteredTasks} onTaskSelect={setSelectedTaskId} />;
      case 'calendar':
        return <TaskCalendarView tasks={filteredTasks} onTaskSelect={setSelectedTaskId} />;
      default:
        return <TaskListView tasks={filteredTasks} onTaskSelect={setSelectedTaskId} />;
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border-dark p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-primary">Tasks</h1>
              <p className="text-sm text-secondary mt-1">
                {views.find(v => v.id === currentView)?.description}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="btn btn-primary flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                New Task
              </button>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="btn btn-ghost"
              >
                <FunnelIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* View Tabs */}
          <div className="flex gap-1 overflow-x-auto">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setCurrentView(view.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  currentView === view.id
                    ? 'bg-sunglow text-white'
                    : 'hover:bg-surface text-secondary hover:text-primary'
                }`}
              >
                <view.icon className="w-4 h-4" />
                <span className="font-medium">{view.name}</span>
              </button>
            ))}
          </div>

          {/* Search & Filters */}
          {showFilters && (
            <div className="mt-4 flex gap-2">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="input pl-10 w-full"
                />
              </div>
              
              <select className="input">
                <option value="">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              
              <select className="input">
                <option value="">All Energy</option>
                <option value="high">High Energy</option>
                <option value="medium">Medium Energy</option>
                <option value="low">Low Energy</option>
              </select>
            </div>
          )}
        </div>

        {/* Task View */}
        <div className="flex-1 overflow-auto p-4">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {renderView()}
          </DndContext>
        </div>
      </div>

      {/* Task Detail Panel */}
      {selectedTaskId && (
        <TaskDetailPanel 
          taskId={selectedTaskId} 
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </div>
  );
}