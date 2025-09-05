export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  type: 'task' | 'event' | 'focus' | 'break' | 'meeting';
  taskId?: string;
  color?: string;
  reminders?: {
    type: 'notification' | 'email';
    minutes: number;
  }[];
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    until?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface TimeBlock {
  id: string;
  startTime: Date;
  endTime: Date;
  title: string;
  type: 'task' | 'event' | 'break' | 'focus';
  taskId?: string;
  color: string;
  isEditing?: boolean;
}

export interface CalendarView {
  mode: 'day' | 'week' | 'month' | 'agenda';
  date: Date;
  events: CalendarEvent[];
}