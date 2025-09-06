'use client';

import { useState } from 'react';
import { ExtendedTask, Project } from '@/lib/types/task.types';
import TaskItem from '../TaskItem';
import { 
  FolderIcon, 
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  HashtagIcon 
} from '@heroicons/react/24/outline';

interface TaskProjectsViewProps {
  tasks: ExtendedTask[];
  onTaskSelect: (id: string) => void;
}

export default function TaskProjectsView({ tasks, onTaskSelect }: TaskProjectsViewProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [selectedProjectId] = useState<string | null>(null);

  // Mock projects - in real app, fetch from database
  const projects: Project[] = [
    { id: '1', name: 'Website Redesign', color: '#3B82F6', icon: '🌐', userId: '', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'Mobile App', color: '#10B981', icon: '📱', userId: '', createdAt: new Date(), updatedAt: new Date() },
    { id: '3', name: 'Marketing Campaign', color: '#F59E0B', icon: '📈', userId: '', createdAt: new Date(), updatedAt: new Date() },
  ];

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const getProjectTasks = (projectId: string): ExtendedTask[] => {
    // TODO: Implement project filtering when project_id is available
    return [] as ExtendedTask[];
  };

  const getUnassignedTasks = () => {
    // TODO: Return all tasks for now until project_id is available
    return tasks;
  };

  const ProjectSection = ({ project }: { project: Project }) => {
    const projectTasks = getProjectTasks(project.id);
    const isExpanded = expandedProjects.has(project.id);
    const completedCount = projectTasks.filter(t => t.completed).length;
    const progress = projectTasks.length > 0 ? (completedCount / projectTasks.length) * 100 : 0;

    return (
      <div className="mb-4">
        <div
          onClick={() => toggleProject(project.id)}
          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
            selectedProjectId === project.id ? 'bg-surface' : 'hover:bg-surface/50'
          }`}
        >
          <button className="text-secondary hover:text-primary">
            {isExpanded ? (
              <ChevronDownIcon className="w-5 h-5" />
            ) : (
              <ChevronRightIcon className="w-5 h-5" />
            )}
          </button>
          
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: project.color }}
          >
            {project.icon || project.name[0]}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-primary">{project.name}</h3>
              <span className="text-sm text-secondary">
                {completedCount}/{projectTasks.length}
              </span>
            </div>
            
            <div className="mt-1 h-1 bg-surface rounded-full overflow-hidden">
              <div 
                className="h-full bg-sunglow transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation();
              // Add new task to project
            }}
            className="p-1 text-secondary hover:text-primary"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {isExpanded && (
          <div className="ml-12 mt-2 space-y-2">
            {projectTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onSelect={() => onTaskSelect(task.id)}
              />
            ))}
            
            {projectTasks.length === 0 && (
              <p className="text-sm text-secondary py-2">No tasks in this project</p>
            )}
            
            <button className="w-full text-left p-2 text-secondary hover:text-primary hover:bg-surface rounded transition-colors flex items-center gap-2">
              <PlusIcon className="w-4 h-4" />
              Add task to {project.name}
            </button>
          </div>
        )}
      </div>
    );
  };

  const unassignedTasks = getUnassignedTasks();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Projects Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FolderIcon className="w-6 h-6 text-sunglow" />
            <h2 className="text-xl font-semibold text-primary">Projects</h2>
          </div>
          
          <button className="btn btn-primary btn-sm flex items-center gap-2">
            <PlusIcon className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary">{projects.length}</div>
            <div className="text-sm text-secondary">Active Projects</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary">{tasks.length}</div>
            <div className="text-sm text-secondary">Total Tasks</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-bold text-primary">
              {tasks.filter(t => t.completed).length}
            </div>
            <div className="text-sm text-secondary">Completed</div>
          </div>
        </div>
      </div>

      {/* Project List */}
      <div>
        {projects.map(project => (
          <ProjectSection key={project.id} project={project} />
        ))}

        {/* Unassigned Tasks */}
        {unassignedTasks.length > 0 && (
          <div className="mt-6">
            <div
              onClick={() => toggleProject('unassigned')}
              className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-surface/50"
            >
              <button className="text-secondary hover:text-primary">
                {expandedProjects.has('unassigned') ? (
                  <ChevronDownIcon className="w-5 h-5" />
                ) : (
                  <ChevronRightIcon className="w-5 h-5" />
                )}
              </button>
              
              <HashtagIcon className="w-5 h-5 text-secondary" />
              
              <div className="flex-1">
                <h3 className="font-medium text-secondary">Unassigned Tasks</h3>
                <p className="text-xs text-muted">{unassignedTasks.length} tasks</p>
              </div>
            </div>

            {expandedProjects.has('unassigned') && (
              <div className="ml-12 mt-2 space-y-2">
                {unassignedTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onSelect={() => onTaskSelect(task.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}