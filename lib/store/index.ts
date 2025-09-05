import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Task, DeepWorkSession, CalendarEvent } from '@/lib/types/database';

interface TaskFilter {
  view: 'today' | 'inbox' | 'projects' | 'matrix' | 'board';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  projectId?: string;
  searchQuery?: string;
  showCompleted: boolean;
}

interface AppState {
  // User
  user: {
    id: string | null;
    email: string | null;
    fullName: string | null;
    preferences: {
      theme: 'light' | 'dark';
      defaultSessionType: '25/5' | '45/15' | 'custom';
      customFocusMinutes: number;
      customBreakMinutes: number;
      dailyGoalSessions: number;
    };
  };
  
  // Tasks
  tasks: {
    items: Task[];
    filter: TaskFilter;
    selectedTaskId: string | null;
    isLoading: boolean;
  };
  
  // Sessions
  sessions: {
    active: DeepWorkSession | null;
    history: DeepWorkSession[];
    isRunning: boolean;
    timeRemaining: number;
  };
  
  // Calendar
  calendar: {
    events: CalendarEvent[];
    view: 'day' | 'week' | 'month' | 'focus';
    selectedDate: Date;
  };
  
  // UI
  ui: {
    commandPaletteOpen: boolean;
    sidebarCollapsed: boolean;
    quickAddOpen: boolean;
    selectedView: 'dashboard' | 'tasks' | 'focus' | 'calendar';
  };
  
  // Actions
  setUser: (user: Partial<AppState['user']>) => void;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setTaskFilter: (filter: Partial<TaskFilter>) => void;
  selectTask: (id: string | null) => void;
  
  startSession: (session: DeepWorkSession) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSession: () => void;
  updateSessionTime: (time: number) => void;
  
  addCalendarEvent: (event: CalendarEvent) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteCalendarEvent: (id: string) => void;
  setCalendarView: (view: AppState['calendar']['view']) => void;
  setSelectedDate: (date: Date) => void;
  
  toggleCommandPalette: () => void;
  toggleSidebar: () => void;
  toggleQuickAdd: () => void;
  setSelectedView: (view: AppState['ui']['selectedView']) => void;
}

const useStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: {
          id: null,
          email: null,
          fullName: null,
          preferences: {
            theme: 'dark',
            defaultSessionType: '25/5',
            customFocusMinutes: 45,
            customBreakMinutes: 15,
            dailyGoalSessions: 4,
          },
        },
        
        tasks: {
          items: [],
          filter: {
            view: 'today',
            showCompleted: false,
          },
          selectedTaskId: null,
          isLoading: false,
        },
        
        sessions: {
          active: null,
          history: [],
          isRunning: false,
          timeRemaining: 0,
        },
        
        calendar: {
          events: [],
          view: 'week',
          selectedDate: new Date(),
        },
        
        ui: {
          commandPaletteOpen: false,
          sidebarCollapsed: false,
          quickAddOpen: false,
          selectedView: 'dashboard',
        },
        
        // Actions
        setUser: (user) => set((state) => ({ 
          user: { ...state.user, ...user } 
        })),
        
        setTasks: (tasks) => set((state) => ({
          tasks: { ...state.tasks, items: tasks }
        })),
        
        addTask: (task) => set((state) => ({
          tasks: { ...state.tasks, items: [...state.tasks.items, task] }
        })),
        
        updateTask: (id, updates) => set((state) => ({
          tasks: {
            ...state.tasks,
            items: state.tasks.items.map((task) =>
              task.id === id ? { ...task, ...updates } : task
            ),
          }
        })),
        
        deleteTask: (id) => set((state) => ({
          tasks: {
            ...state.tasks,
            items: state.tasks.items.filter((task) => task.id !== id),
          }
        })),
        
        setTaskFilter: (filter) => set((state) => ({
          tasks: { ...state.tasks, filter: { ...state.tasks.filter, ...filter } }
        })),
        
        selectTask: (id) => set((state) => ({
          tasks: { ...state.tasks, selectedTaskId: id }
        })),
        
        startSession: (session) => set((state) => ({
          sessions: {
            ...state.sessions,
            active: session,
            isRunning: true,
          }
        })),
        
        pauseSession: () => set((state) => ({
          sessions: { ...state.sessions, isRunning: false }
        })),
        
        resumeSession: () => set((state) => ({
          sessions: { ...state.sessions, isRunning: true }
        })),
        
        endSession: () => set((state) => ({
          sessions: {
            ...state.sessions,
            active: null,
            isRunning: false,
            history: state.sessions.active 
              ? [...state.sessions.history, state.sessions.active]
              : state.sessions.history,
          }
        })),
        
        updateSessionTime: (time) => set((state) => ({
          sessions: { ...state.sessions, timeRemaining: time }
        })),
        
        addCalendarEvent: (event) => set((state) => ({
          calendar: {
            ...state.calendar,
            events: [...state.calendar.events, event],
          }
        })),
        
        updateCalendarEvent: (id, updates) => set((state) => ({
          calendar: {
            ...state.calendar,
            events: state.calendar.events.map((event) =>
              event.id === id ? { ...event, ...updates } : event
            ),
          }
        })),
        
        deleteCalendarEvent: (id) => set((state) => ({
          calendar: {
            ...state.calendar,
            events: state.calendar.events.filter((event) => event.id !== id),
          }
        })),
        
        setCalendarView: (view) => set((state) => ({
          calendar: { ...state.calendar, view }
        })),
        
        setSelectedDate: (date) => set((state) => ({
          calendar: { ...state.calendar, selectedDate: date }
        })),
        
        toggleCommandPalette: () => set((state) => ({
          ui: { ...state.ui, commandPaletteOpen: !state.ui.commandPaletteOpen }
        })),
        
        toggleSidebar: () => set((state) => ({
          ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed }
        })),
        
        toggleQuickAdd: () => set((state) => ({
          ui: { ...state.ui, quickAddOpen: !state.ui.quickAddOpen }
        })),
        
        setSelectedView: (view) => set((state) => ({
          ui: { ...state.ui, selectedView: view }
        })),
      }),
      {
        name: 'floe-storage',
        partialize: (state) => ({
          user: state.user,
          tasks: {
            filter: state.tasks.filter,
          },
          calendar: {
            view: state.calendar.view,
          },
          ui: {
            sidebarCollapsed: state.ui.sidebarCollapsed,
          },
        }),
      }
    )
  )
);

export default useStore;