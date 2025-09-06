export interface DeepWorkSession {
  id: string;
  startTime: string;
  endTime?: string;
  duration: number;
  breakDuration: number;
  focusType: 'deep' | 'shallow' | 'creative' | 'meeting';
  taskIds?: string[];
  sessionGoal?: string;
  goal?: string;
  completed: boolean;
  stats?: {
    focusScore: number;
    distractions: number;
    breaksTaken: number;
    tasksCompleted: number;
  };
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SessionConfig {
  duration: number;
  breakDuration: number;
  taskIds: string[];
  focusType: string;
  sessionGoal?: string;
}

export interface SessionStats {
  totalSessions: number;
  totalMinutes: number;
  averageDuration: number;
  averageFocusScore: number;
  currentStreak: number;
  bestStreak: number;
}