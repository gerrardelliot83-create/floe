'use client';

import { useState } from 'react';
import { 
  CalendarIcon, 
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import useStore from '@/lib/store';
import TimeBlockingView from './TimeBlockingView';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { CalendarEvent } from '@/lib/types/database';

type ViewMode = 'day' | 'week' | 'month' | 'agenda';

export default function IntegratedCalendar() {
  const { calendar, tasks } = useStore();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get events for date range
  const getEventsForDate = (date: Date) => {
    return calendar.events.filter(event => 
      isSameDay(new Date(event.start_time), date)
    );
  };

  const getTasksForDate = (date: Date) => {
    return tasks.items.filter(task => 
      task.due_date && isSameDay(new Date(task.due_date), date)
    );
  };

  const renderDayView = () => {
    return <TimeBlockingView date={selectedDate} onDateChange={setSelectedDate} />;
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekEnd = endOfWeek(selectedDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-border-dark px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-primary">
              {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
            </h2>
            <button
              onClick={() => setSelectedDate(new Date())}
              className="btn btn-secondary btn-sm"
            >
              Today
            </button>
          </div>
        </div>

        {/* Week Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-7 h-full">
            {days.map(day => {
              const dayEvents = getEventsForDate(day);
              const dayTasks = getTasksForDate(day);
              const isCurrentDay = isToday(day);

              return (
                <div
                  key={day.toISOString()}
                  className={`border-r border-border-dark p-2 ${
                    isCurrentDay ? 'bg-sunglow/5' : ''
                  }`}
                >
                  <div className="mb-2">
                    <div className="text-xs text-secondary">{format(day, 'EEE')}</div>
                    <div className={`text-lg font-semibold ${
                      isCurrentDay ? 'text-sunglow' : 'text-primary'
                    }`}>
                      {format(day, 'd')}
                    </div>
                  </div>

                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <div
                        key={event.id}
                        className="p-1 text-xs rounded bg-purple-500/10 text-purple-500 truncate"
                      >
                        {format(new Date(event.start_time), 'h:mm a')} {event.title}
                      </div>
                    ))}
                    
                    {dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task.id}
                        className="p-1 text-xs rounded bg-blue-500/10 text-blue-500 truncate"
                      >
                        {task.title}
                      </div>
                    ))}
                    
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-secondary text-center">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b border-border-dark px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
                className="p-2 hover:bg-surface rounded-lg"
              >
                <ChevronLeftIcon className="w-5 h-5 text-secondary" />
              </button>
              <h2 className="text-xl font-semibold text-primary">
                {format(selectedDate, 'MMMM yyyy')}
              </h2>
              <button
                onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
                className="p-2 hover:bg-surface rounded-lg"
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

        {/* Month Grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-7 gap-px bg-border-dark h-full">
            {/* Day Headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="bg-surface p-2 text-center text-sm font-medium text-secondary">
                {day}
              </div>
            ))}
            
            {/* Calendar Days */}
            {days.map(day => {
              const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
              const isCurrentDay = isToday(day);
              const dayEvents = getEventsForDate(day);
              const dayTasks = getTasksForDate(day);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => {
                    setSelectedDate(day);
                    setViewMode('day');
                  }}
                  className={`bg-background p-2 min-h-[80px] cursor-pointer hover:bg-surface transition-colors ${
                    !isCurrentMonth ? 'opacity-50' : ''
                  } ${isCurrentDay ? 'ring-2 ring-sunglow' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isCurrentDay ? 'text-sunglow' : 'text-primary'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {(dayEvents.length > 0 || dayTasks.length > 0) && (
                      <div className="flex gap-1">
                        {dayEvents.length > 0 && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        )}
                        {dayTasks.length > 0 && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderAgendaView = () => {
    // Get all upcoming events and tasks
    const upcomingEvents = calendar.events
      .filter(event => new Date(event.start_time) >= new Date())
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
      .slice(0, 10);

    const upcomingTasks = tasks.items
      .filter(task => task.due_date && new Date(task.due_date) >= new Date() && !task.completed)
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, 10);

    // Combine and sort
    const allItems = [
      ...upcomingEvents.map(e => ({ ...e, itemType: 'event' as const })),
      ...upcomingTasks.map(t => ({ ...t, itemType: 'task' as const }))
    ].sort((a, b) => {
      const dateA = 'start_time' in a ? new Date(a.start_time) : new Date(a.due_date!);
      const dateB = 'start_time' in b ? new Date(b.start_time) : new Date(b.due_date!);
      return dateA.getTime() - dateB.getTime();
    });

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-primary mb-2">Agenda</h2>
          <p className="text-secondary">Upcoming events and tasks</p>
        </div>

        <div className="space-y-4">
          {allItems.map(item => {
            if (item.itemType === 'event') {
              const event = item as CalendarEvent & { itemType: 'event' };
              return (
                <div key={`event-${event.id}`} className="card flex items-center gap-4">
                  <div className="w-1 h-12 bg-purple-500 rounded-full" />
                  <div className="flex-1">
                    <h3 className="font-medium text-primary">{event.title}</h3>
                    <p className="text-sm text-secondary">
                      {format(new Date(event.start_time), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs bg-purple-500/10 text-purple-500 rounded">
                    Event
                  </span>
                </div>
              );
            } else {
              const task = item as { id: string; title: string; priority: string; due_date?: string };
              return (
                <div key={`task-${task.id}`} className="card flex items-center gap-4">
                  <div className="w-1 h-12 bg-blue-500 rounded-full" />
                  <div className="flex-1">
                    <h3 className="font-medium text-primary">{task.title}</h3>
                    <p className="text-sm text-secondary">
                      Due: {task.due_date && format(new Date(task.due_date), 'MMM d, h:mm a')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded ${
                    task.priority === 'critical' ? 'bg-red-500/10 text-red-500' :
                    task.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                    task.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-green-500/10 text-green-500'
                  }`}>
                    {task.priority || 'Task'}
                  </span>
                </div>
              );
            }
          })}

          {allItems.length === 0 && (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-secondary mx-auto mb-3 opacity-50" />
              <p className="text-secondary">No upcoming events or tasks</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Top Bar */}
      <div className="border-b border-border-dark px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-primary">Calendar</h1>
            
            {/* View Switcher */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === 'day'
                    ? 'bg-sunglow text-white'
                    : 'bg-surface text-secondary hover:text-primary'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === 'week'
                    ? 'bg-sunglow text-white'
                    : 'bg-surface text-secondary hover:text-primary'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === 'month'
                    ? 'bg-sunglow text-white'
                    : 'bg-surface text-secondary hover:text-primary'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  viewMode === 'agenda'
                    ? 'bg-sunglow text-white'
                    : 'bg-surface text-secondary hover:text-primary'
                }`}
              >
                Agenda
              </button>
            </div>
          </div>

          <button
            onClick={() => {}}
            className="btn btn-primary btn-sm flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Add Event
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'day' && renderDayView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'agenda' && renderAgendaView()}
      </div>
    </div>
  );
}