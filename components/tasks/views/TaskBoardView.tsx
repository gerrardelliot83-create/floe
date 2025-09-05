'use client';

import { useState } from 'react';
import { ExtendedTask, BoardColumn } from '@/lib/types/task.types';
import { DndContext, DragEndEvent, DragOverlay, closestCenter } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import TaskItem from '../TaskItem';
import { PlusIcon } from '@heroicons/react/24/outline';

interface TaskBoardViewProps {
  tasks: ExtendedTask[];
  onTaskSelect: (id: string) => void;
}

export default function TaskBoardView({ tasks, onTaskSelect }: TaskBoardViewProps) {
  const [columns, setColumns] = useState<BoardColumn[]>([
    {
      id: 'backlog',
      title: 'Backlog',
      tasks: tasks.filter(t => !t.status || t.status === 'backlog'),
      color: 'border-gray-500',
    },
    {
      id: 'todo',
      title: 'To Do',
      tasks: tasks.filter(t => t.status === 'todo'),
      color: 'border-blue-500',
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: tasks.filter(t => t.status === 'in-progress'),
      color: 'border-yellow-500',
      limit: 3,
    },
    {
      id: 'review',
      title: 'Review',
      tasks: tasks.filter(t => t.status === 'review'),
      color: 'border-purple-500',
    },
    {
      id: 'done',
      title: 'Done',
      tasks: tasks.filter(t => t.status === 'done' || t.completed),
      color: 'border-green-500',
    },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeTask = tasks.find(t => t.id === active.id);
    const overColumn = columns.find(col => col.id === over.id);

    if (activeTask && overColumn) {
      // Update task status
      console.log(`Moving task ${activeTask.title} to ${overColumn.title}`);
      // Here you would update the task status in the database
    }

    setActiveId(null);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        <SortableContext
          items={columns.map(col => col.id)}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column) => (
            <div
              key={column.id}
              className={`flex-shrink-0 w-80 card border-t-4 ${column.color} flex flex-col`}
            >
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-primary">{column.title}</h3>
                  <span className={`text-sm px-2 py-1 rounded ${
                    column.limit && column.tasks.length >= column.limit
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-surface text-secondary'
                  }`}>
                    {column.tasks.length}
                    {column.limit && ` / ${column.limit}`}
                  </span>
                </div>
                
                {column.limit && column.tasks.length >= column.limit && (
                  <p className="text-xs text-warning">
                    WIP limit reached. Complete tasks before adding more.
                  </p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="space-y-2">
                  {column.tasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onSelect={() => onTaskSelect(task.id)}
                      isDragging={activeId === task.id}
                    />
                  ))}
                </div>

                {column.tasks.length === 0 && (
                  <div className="text-center py-8 text-secondary text-sm border-2 border-dashed border-border-dark rounded-lg">
                    Drop tasks here
                  </div>
                )}
              </div>

              {column.id === 'backlog' && (
                <button className="mt-4 w-full btn btn-ghost justify-start">
                  <PlusIcon className="w-4 h-4" />
                  Add Task
                </button>
              )}
            </div>
          ))}
        </SortableContext>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="card shadow-xl opacity-90">
            {tasks.find(t => t.id === activeId)?.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}