'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  ClockIcon, 
  PlusIcon, 
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import useStore from '@/lib/store';
import { format, addDays, startOfDay, endOfDay, isSameDay, addMinutes, differenceInMinutes } from 'date-fns';
import { CalendarEvent } from '@/lib/types/calendar.types';
import { ExtendedTask } from '@/lib/types/task.types';

interface TimeBlockingViewProps {
  date?: Date;
  onDateChange?: (date: Date) => void;
}

interface TimeBlock {
  id: string;
  startTime: Date;
  endTime: Date;
  title: string;
  type: 'task' | 'event' | 'break' | 'focus';
  taskId?: string;
  color: string;
  isEditing?: boolean;
}

export default function TimeBlockingView({ date = new Date(), onDateChange }: TimeBlockingViewProps) {
  const { tasks, calendar, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent } = useStore();
  const [selectedDate, setSelectedDate] = useState(date);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [showTaskSelector, setShowTaskSelector] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);

  // Time slots from 6 AM to 11 PM
  const timeSlots = Array.from({ length: 18 }, (_, i) => {
    const hour = i + 6;
    return {
      hour,
      label: format(new Date().setHours(hour, 0, 0, 0), 'h a'),
    };
  });

  // Load events for the selected date
  useEffect(() => {
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);
    
    const dayEvents = calendar.events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= dayStart && eventDate <= dayEnd;
    });

    const blocks: TimeBlock[] = dayEvents.map(event => ({
      id: event.id,
      startTime: new Date(event.date),
      endTime: addMinutes(new Date(event.date), event.duration || 60),
      title: event.title,
      type: event.type as any,
      taskId: event.taskId,
      color: getBlockColor(event.type),
    }));

    setTimeBlocks(blocks);
  }, [calendar.events, selectedDate]);

  const getBlockColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-blue-500/20 border-blue-500';
      case 'event': return 'bg-purple-500/20 border-purple-500';
      case 'break': return 'bg-green-500/20 border-green-500';
      case 'focus': return 'bg-sunglow/20 border-sunglow';
      default: return 'bg-gray-500/20 border-gray-500';
    }
  };

  const handleMouseDown = (e: React.MouseEvent, hour: number, minute: number = 0) => {
    if (e.target !== e.currentTarget) return; // Ignore if clicking on a block
    
    const startTime = new Date(selectedDate);
    startTime.setHours(hour, minute, 0, 0);
    
    setIsDragging(true);
    setDragStart(startTime);
    setDragEnd(addMinutes(startTime, 30));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !gridRef.current) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hourHeight = rect.height / 18; // 18 hours shown
    const hour = Math.floor(y / hourHeight) + 6;
    const minuteFraction = (y % hourHeight) / hourHeight;
    const minute = Math.round(minuteFraction * 60 / 15) * 15; // Round to 15 min increments
    
    const endTime = new Date(selectedDate);
    endTime.setHours(hour, minute, 0, 0);
    
    if (endTime > dragStart) {
      setDragEnd(endTime);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragEnd) return;
    
    const newBlock: TimeBlock = {
      id: Date.now().toString(),
      startTime: dragStart,
      endTime: dragEnd,
      title: 'New Block',
      type: 'task',
      color: getBlockColor('task'),
      isEditing: true,
    };
    
    setTimeBlocks([...timeBlocks, newBlock]);
    setEditingBlock(newBlock.id);
    setShowTaskSelector(true);
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  const saveBlock = (block: TimeBlock) => {
    const event: CalendarEvent = {
      id: block.id,
      title: block.title,
      date: block.startTime.toISOString(),
      duration: differenceInMinutes(block.endTime, block.startTime),
      type: block.type,
      taskId: block.taskId,
      userId: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    if (calendar.events.find(e => e.id === block.id)) {
      updateCalendarEvent(block.id, event);
    } else {
      addCalendarEvent(event);
    }
    
    setEditingBlock(null);
    setShowTaskSelector(false);
  };

  const deleteBlock = (blockId: string) => {
    setTimeBlocks(timeBlocks.filter(b => b.id !== blockId));
    deleteCalendarEvent(blockId);
  };

  const assignTaskToBlock = (blockId: string, taskId: string) => {
    const task = tasks.items.find(t => t.id === taskId);
    if (!task) return;
    
    setTimeBlocks(timeBlocks.map(block => 
      block.id === blockId 
        ? { ...block, title: task.title, taskId, isEditing: false }
        : block
    ));
    
    const block = timeBlocks.find(b => b.id === blockId);
    if (block) {
      saveBlock({ ...block, title: task.title, taskId });
    }
  };

  const getBlockStyle = (block: TimeBlock) => {
    const startHour = block.startTime.getHours();
    const startMinute = block.startTime.getMinutes();
    const endHour = block.endTime.getHours();
    const endMinute = block.endTime.getMinutes();
    
    const top = ((startHour - 6) * 60 + startMinute) / (18 * 60) * 100;
    const height = ((endHour - startHour) * 60 + (endMinute - startMinute)) / (18 * 60) * 100;
    
    return {
      top: `${top}%`,
      height: `${height}%`,
    };
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = addDays(selectedDate, direction === 'next' ? 1 : -1);
    setSelectedDate(newDate);
    onDateChange?.(newDate);
  };

  const unscheduledTasks = tasks.items.filter(task => 
    !task.completed && !timeBlocks.some(block => block.taskId === task.id)
  );

  return (
    <div className="h-full flex">
      {/* Main Calendar Grid */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border-dark px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 hover:bg-surface rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-secondary" />
              </button>
              <h2 className="text-xl font-semibold text-primary">
                {format(selectedDate, 'EEEE, MMMM d')}
              </h2>
              <button
                onClick={() => navigateDate('next')}
                className="p-2 hover:bg-surface rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-secondary" />
              </button>
            </div>
            
            <button
              onClick={() => setSelectedDate(new Date())}
              className="btn btn-secondary btn-sm"
            >
              Today
            </button>
          </div>
        </div>

        {/* Time Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex h-full">
            {/* Time Labels */}
            <div className="w-20 border-r border-border-dark">
              {timeSlots.map(slot => (
                <div
                  key={slot.hour}
                  className="h-16 border-b border-border-dark/50 px-3 py-2 text-right"
                >
                  <span className="text-xs text-secondary">{slot.label}</span>
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div
              ref={gridRef}
              className="flex-1 relative"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Hour Lines */}
              {timeSlots.map(slot => (
                <div
                  key={slot.hour}
                  className="absolute w-full h-16 border-b border-border-dark/50"
                  style={{ top: `${((slot.hour - 6) / 18) * 100}%` }}
                  onMouseDown={(e) => handleMouseDown(e, slot.hour)}
                />
              ))}

              {/* Current Time Indicator */}
              {isSameDay(selectedDate, new Date()) && (
                <div
                  className="absolute w-full h-0.5 bg-red-500 z-10"
                  style={{
                    top: `${((new Date().getHours() - 6) * 60 + new Date().getMinutes()) / (18 * 60) * 100}%`,
                  }}
                >
                  <div className="absolute -left-2 -top-2 w-4 h-4 bg-red-500 rounded-full" />
                </div>
              )}

              {/* Time Blocks */}
              {timeBlocks.map(block => (
                <div
                  key={block.id}
                  className={`absolute left-2 right-2 ${block.color} border-l-4 rounded-lg p-2 cursor-pointer hover:shadow-lg transition-all`}
                  style={getBlockStyle(block)}
                  onClick={() => setEditingBlock(block.id)}
                >
                  {block.isEditing ? (
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={block.title}
                        onChange={(e) => {
                          setTimeBlocks(timeBlocks.map(b => 
                            b.id === block.id 
                              ? { ...b, title: e.target.value }
                              : b
                          ));
                        }}
                        className="bg-transparent border-none outline-none text-sm text-primary flex-1"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => saveBlock(block)}
                          className="p-1 hover:bg-white/10 rounded"
                        >
                          <CheckIcon className="w-4 h-4 text-green-500" />
                        </button>
                        <button
                          onClick={() => deleteBlock(block.id)}
                          className="p-1 hover:bg-white/10 rounded"
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-primary truncate">
                        {block.title}
                      </p>
                      <p className="text-xs text-secondary">
                        {format(block.startTime, 'h:mm a')} - {format(block.endTime, 'h:mm a')}
                      </p>
                    </div>
                  )}
                </div>
              ))}

              {/* Drag Preview */}
              {isDragging && dragStart && dragEnd && (
                <div
                  className="absolute left-2 right-2 bg-sunglow/30 border-l-4 border-sunglow rounded-lg opacity-50"
                  style={getBlockStyle({ 
                    id: 'drag',
                    startTime: dragStart,
                    endTime: dragEnd,
                    title: '',
                    type: 'task',
                    color: '',
                  })}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Unscheduled Tasks */}
      <div className="w-80 border-l border-border-dark p-4 overflow-y-auto">
        <h3 className="font-semibold text-primary mb-4">Unscheduled Tasks</h3>
        <div className="space-y-2">
          {unscheduledTasks.map(task => (
            <div
              key={task.id}
              className="p-3 bg-surface rounded-lg border border-border-dark hover:border-sunglow cursor-move transition-colors"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('taskId', task.id);
              }}
            >
              <p className="font-medium text-primary text-sm">{task.title}</p>
              <div className="flex items-center gap-2 mt-1">
                {task.estimatedMinutes && (
                  <span className="text-xs text-secondary flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {task.estimatedMinutes}m
                  </span>
                )}
                {task.priority && (
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    task.priority === 'critical' ? 'bg-red-500/10 text-red-500' :
                    task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                    task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-green-500/10 text-green-500'
                  }`}>
                    {task.priority}
                  </span>
                )}
              </div>
            </div>
          ))}
          
          {unscheduledTasks.length === 0 && (
            <p className="text-center text-secondary py-8">
              All tasks are scheduled!
            </p>
          )}
        </div>

        {/* Quick Add Options */}
        <div className="mt-6">
          <h4 className="font-medium text-primary mb-3">Quick Add</h4>
          <div className="space-y-2">
            <button
              onClick={() => {
                const now = new Date();
                const block: TimeBlock = {
                  id: Date.now().toString(),
                  startTime: now,
                  endTime: addMinutes(now, 30),
                  title: 'Break',
                  type: 'break',
                  color: getBlockColor('break'),
                };
                setTimeBlocks([...timeBlocks, block]);
                saveBlock(block);
              }}
              className="w-full text-left p-2 bg-surface hover:bg-sunglow/10 rounded transition-colors text-sm"
            >
              <PlusIcon className="w-4 h-4 inline mr-2 text-green-500" />
              Add Break
            </button>
            <button
              onClick={() => {
                const now = new Date();
                const block: TimeBlock = {
                  id: Date.now().toString(),
                  startTime: now,
                  endTime: addMinutes(now, 90),
                  title: 'Deep Focus',
                  type: 'focus',
                  color: getBlockColor('focus'),
                };
                setTimeBlocks([...timeBlocks, block]);
                saveBlock(block);
              }}
              className="w-full text-left p-2 bg-surface hover:bg-sunglow/10 rounded transition-colors text-sm"
            >
              <PlusIcon className="w-4 h-4 inline mr-2 text-sunglow" />
              Add Focus Block
            </button>
          </div>
        </div>
      </div>

      {/* Task Selector Modal */}
      {showTaskSelector && editingBlock && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg p-4 max-w-md w-full max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-primary mb-3">Select Task</h3>
            <div className="space-y-2">
              {unscheduledTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => assignTaskToBlock(editingBlock, task.id)}
                  className="w-full text-left p-3 bg-surface hover:bg-sunglow/10 rounded-lg transition-colors"
                >
                  <p className="font-medium text-primary">{task.title}</p>
                  {task.estimatedMinutes && (
                    <p className="text-xs text-secondary">Est: {task.estimatedMinutes} min</p>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowTaskSelector(false);
                setEditingBlock(null);
              }}
              className="mt-4 w-full btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}