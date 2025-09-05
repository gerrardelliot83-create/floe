'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { useHotkeys } from 'react-hotkeys-hook';
import useStore from '@/lib/store';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  PlayIcon,
  CalendarIcon,
  HomeIcon,
  CheckIcon,
  ClockIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

export default function CommandPalette() {
  const router = useRouter();
  const { 
    commandPaletteOpen, 
    toggleCommandPalette, 
    toggleQuickAdd,
    setSelectedView,
    tasks,
    selectTask,
    startSession
  } = useStore();
  
  const [search, setSearch] = useState('');
  const [pages, setPages] = useState<string[]>([]);
  const activePage = pages[pages.length - 1];
  const isHome = activePage === undefined;

  // Global keyboard shortcut
  useHotkeys('cmd+k, ctrl+k', (e) => {
    e.preventDefault();
    toggleCommandPalette();
  }, { enableOnFormTags: false });

  // Reset when closed
  useEffect(() => {
    if (!commandPaletteOpen) {
      setSearch('');
      setPages([]);
    }
  }, [commandPaletteOpen]);

  const runCommand = (command: () => void) => {
    toggleCommandPalette();
    command();
  };

  const quickActions = [
    {
      id: 'new-task',
      name: 'New Task',
      shortcut: 'T',
      icon: PlusIcon,
      action: () => runCommand(() => toggleQuickAdd()),
    },
    {
      id: 'start-focus',
      name: 'Start Focus Session',
      shortcut: 'F',
      icon: PlayIcon,
      action: () => runCommand(() => {
        setSelectedView('focus');
        router.push('/timer');
      }),
    },
    {
      id: 'schedule-event',
      name: 'Schedule Event',
      shortcut: 'E',
      icon: CalendarIcon,
      action: () => runCommand(() => {
        setSelectedView('calendar');
        router.push('/calendar');
      }),
    },
  ];

  const navigation = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      shortcut: '1',
      icon: HomeIcon,
      action: () => runCommand(() => router.push('/dashboard')),
    },
    {
      id: 'tasks',
      name: 'Tasks',
      shortcut: '2',
      icon: CheckIcon,
      action: () => runCommand(() => router.push('/tasks')),
    },
    {
      id: 'focus',
      name: 'Focus Mode',
      shortcut: '3',
      icon: ClockIcon,
      action: () => runCommand(() => router.push('/timer')),
    },
    {
      id: 'calendar',
      name: 'Calendar',
      shortcut: '4',
      icon: CalendarIcon,
      action: () => runCommand(() => router.push('/calendar')),
    },
    {
      id: 'analytics',
      name: 'Analytics',
      shortcut: '5',
      icon: ChartBarIcon,
      action: () => runCommand(() => router.push('/analytics')),
    },
    {
      id: 'settings',
      name: 'Settings',
      shortcut: ',',
      icon: Cog6ToothIcon,
      action: () => runCommand(() => router.push('/settings')),
    },
  ];

  return (
    <>
      <Command.Dialog
        open={commandPaletteOpen}
        onOpenChange={toggleCommandPalette}
        label="Command Menu"
        className="fixed inset-0 z-50"
      >
        <div 
          className="fixed inset-0 bg-black/50"
          onClick={toggleCommandPalette}
        />
        <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl">
          <div className="card overflow-hidden shadow-2xl">
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command or search..."
              className="w-full px-4 py-3 text-lg bg-transparent border-b border-border-dark text-primary placeholder-secondary focus:outline-none"
            />
            
            <Command.List className="max-h-96 overflow-y-auto p-2">
              <Command.Empty className="py-8 text-center text-secondary">
                No results found.
              </Command.Empty>
              
              {isHome && (
                <>
                  <Command.Group heading="Quick Actions" className="px-2 py-1.5 text-xs font-medium text-secondary">
                    {quickActions.map((action) => (
                      <Command.Item
                        key={action.id}
                        value={action.name}
                        onSelect={action.action}
                        className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-surface cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <action.icon className="w-4 h-4 text-secondary" />
                          <span className="text-primary">{action.name}</span>
                        </div>
                        <kbd className="px-2 py-1 text-xs bg-bg-dark rounded border border-border-dark text-secondary">
                          {action.shortcut}
                        </kbd>
                      </Command.Item>
                    ))}
                  </Command.Group>
                  
                  <Command.Group heading="Navigation" className="px-2 py-1.5 text-xs font-medium text-secondary mt-2">
                    {navigation.map((item) => (
                      <Command.Item
                        key={item.id}
                        value={item.name}
                        onSelect={item.action}
                        className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-surface cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 text-secondary" />
                          <span className="text-primary">{item.name}</span>
                        </div>
                        <kbd className="px-2 py-1 text-xs bg-bg-dark rounded border border-border-dark text-secondary">
                          {item.shortcut}
                        </kbd>
                      </Command.Item>
                    ))}
                  </Command.Group>
                  
                  {tasks.items.length > 0 && (
                    <Command.Group heading="Recent Tasks" className="px-2 py-1.5 text-xs font-medium text-secondary mt-2">
                      {tasks.items.slice(0, 5).map((task) => (
                        <Command.Item
                          key={task.id}
                          value={task.title}
                          onSelect={() => runCommand(() => {
                            selectTask(task.id);
                            router.push('/tasks');
                          })}
                          className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-surface cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <DocumentIcon className="w-4 h-4 text-secondary" />
                            <span className="text-primary">{task.title}</span>
                          </div>
                          <ArrowRightIcon className="w-4 h-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Command.Item>
                      ))}
                    </Command.Group>
                  )}
                  
                  <Command.Group heading="Search Tasks" className="px-2 py-1.5 text-xs font-medium text-secondary mt-2">
                    <Command.Item
                      value="Search all tasks"
                      onSelect={() => setPages([...pages, 'search'])}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-surface cursor-pointer"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4 text-secondary" />
                      <span className="text-primary">Search all tasks...</span>
                    </Command.Item>
                  </Command.Group>
                </>
              )}
              
              {activePage === 'search' && (
                <Command.Group heading="Search Results" className="px-2 py-1.5 text-xs font-medium text-secondary">
                  {tasks.items
                    .filter((task) => 
                      task.title.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((task) => (
                      <Command.Item
                        key={task.id}
                        value={task.title}
                        onSelect={() => runCommand(() => {
                          selectTask(task.id);
                          router.push('/tasks');
                        })}
                        className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-surface cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <CheckIcon className={`w-4 h-4 ${task.completed ? 'text-success' : 'text-secondary'}`} />
                          <div>
                            <p className="text-primary">{task.title}</p>
                            {task.due_date && (
                              <p className="text-xs text-secondary">
                                Due: {new Date(task.due_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          task.priority === 'high' ? 'bg-error/20 text-error' :
                          task.priority === 'medium' ? 'bg-warning/20 text-warning' :
                          'bg-success/20 text-success'
                        }`}>
                          {task.priority}
                        </span>
                      </Command.Item>
                    ))}
                </Command.Group>
              )}
            </Command.List>
            
            <div className="border-t border-border-dark px-4 py-2 flex items-center justify-between">
              <div className="flex gap-2 text-xs text-secondary">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-bg-dark rounded border border-border-dark">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-bg-dark rounded border border-border-dark">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-bg-dark rounded border border-border-dark">ESC</kbd>
                  Close
                </span>
              </div>
              {!isHome && (
                <button
                  onClick={() => setPages(pages.slice(0, -1))}
                  className="text-xs text-sunglow hover:underline"
                >
                  ← Back
                </button>
              )}
            </div>
          </div>
        </div>
      </Command.Dialog>
    </>
  );
}