export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  content?: any; // EditorJS data
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  tags?: string[];
  parent_id?: string;
  subtasks?: Task[];
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  type: 'focus' | 'break';
  duration_minutes: number;
  completed: boolean;
  task_id?: string;
  notes?: string;
  started_at?: string;
  ended_at?: string;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  event_type: 'deep_work' | 'task_deadline' | 'meeting';
  start_time: string;
  end_time: string;
  recurring_pattern?: any;
  task_id?: string;
  session_config?: {
    session_type: '45/15' | '25/5' | 'custom';
    focus_minutes: number;
    break_minutes: number;
    total_sessions: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_session_date?: string;
  total_sessions: number;
  total_focus_minutes: number;
  updated_at: string;
}

export interface Quote {
  id: string;
  text: string;
  author?: string;
  category?: string;
  active: boolean;
  created_by?: string;
  created_at: string;
}

export interface Background {
  id: string;
  url: string;
  title?: string;
  active: boolean;
  uploaded_by?: string;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  default_session_type: '45/15' | '25/5' | 'custom';
  custom_focus_minutes: number;
  custom_break_minutes: number;
  notification_sound: string;
  theme: 'dark' | 'light';
  daily_goal_sessions: number;
  created_at: string;
  updated_at: string;
}