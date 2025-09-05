import { Task } from './database';

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtendedTask extends Task {
  project?: Project;
  subtasks?: ExtendedTask[];
  parent?: ExtendedTask;
  dependencies?: string[];
  estimatedMinutes?: number;
  actualMinutes?: number;
  energy?: 'high' | 'medium' | 'low';
  aiPriorityScore?: number;
}

export type TaskView = 'today' | 'inbox' | 'projects' | 'matrix' | 'board' | 'calendar';

export interface TaskFilter {
  view: TaskView;
  projectId?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  energy?: 'high' | 'medium' | 'low';
  searchQuery?: string;
  tags?: string[];
  showCompleted: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface TaskGroup {
  id: string;
  title: string;
  tasks: ExtendedTask[];
  color?: string;
  collapsed?: boolean;
}

export interface MatrixQuadrant {
  id: 'urgent-important' | 'not-urgent-important' | 'urgent-not-important' | 'not-urgent-not-important';
  title: string;
  description: string;
  tasks: ExtendedTask[];
  color: string;
}

export interface BoardColumn {
  id: string;
  title: string;
  tasks: ExtendedTask[];
  limit?: number;
  color?: string;
}