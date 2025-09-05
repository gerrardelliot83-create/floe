'use client';

import { useState } from 'react';
import { CalendarEvent, Task } from '@/lib/types/database';
import { motion, AnimatePresence } from 'framer-motion';

interface AdvancedCalendarProps {
  events?: CalendarEvent[];
  tasks?: Task[];
  onEventCreate?: (event: CalendarEvent) => void;
}

export default function AdvancedCalendar({ events = [], tasks = [], onEventCreate }: AdvancedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_type: 'deep_work' as 'deep_work' | 'task_deadline' | 'meeting',
    start_time: '',
    end_time: '',
    session_config: {
      session_type: '25/5' as '45/15' | '25/5' | 'custom',
      focus_minutes: 25,
      break_minutes: 5,
      total_sessions: 4
    }
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_time);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const createEvent = () => {
    if (!newEvent.title || !newEvent.start_time || !selectedDate) return;

    const event: CalendarEvent = {
      id: Date.now().toString(),
      user_id: 'current-user',
      title: newEvent.title,
      description: newEvent.description,
      event_type: newEvent.event_type,
      start_time: newEvent.start_time,
      end_time: newEvent.end_time || new Date(new Date(newEvent.start_time).getTime() + 60 * 60 * 1000).toISOString(),
      session_config: newEvent.event_type === 'deep_work' ? newEvent.session_config : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (onEventCreate) {
      onEventCreate(event);
    }

    setNewEvent({
      title: '',
      description: '',
      event_type: 'deep_work',
      start_time: '',
      end_time: '',
      session_config: {
        session_type: '25/5',
        focus_minutes: 25,
        break_minutes: 5,
        total_sessions: 4
      }
    });
    setShowEventForm(false);
  };

  const updateSessionConfig = (type: '45/15' | '25/5' | 'custom') => {
    const configs = {
      '45/15': { focus_minutes: 45, break_minutes: 15, total_sessions: 3 },
      '25/5': { focus_minutes: 25, break_minutes: 5, total_sessions: 4 },
      'custom': { focus_minutes: newEvent.session_config.focus_minutes, break_minutes: newEvent.session_config.break_minutes, total_sessions: 3 }
    };

    setNewEvent({
      ...newEvent,
      session_config: {
        session_type: type,
        ...configs[type]
      }
    });
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalCells = 42;

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const dayEvents = getEventsForDate(date);
      const dayTasks = getTasksForDate(date);
      const hasItems = dayEvents.length > 0 || dayTasks.length > 0;

      days.push(
        <motion.button
          key={day}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setSelectedDate(date)}
          className={`relative p-2 rounded-lg transition-all text-center ${
            isToday ? 'bg-sunglow text-white' : 
            isSelected ? 'bg-sunglow text-white border border-sunglow' : 
            'hover:bg-surface'
          }`}
        >
          <span className="text-sm font-medium">{day}</span>
          {hasItems && (
            <div className="flex gap-1 justify-center mt-1">
              {dayEvents.length > 0 && (
                <span className="w-1.5 h-1.5 bg-sunglow rounded-full"></span>
              )}
              {dayTasks.length > 0 && (
                <span className="w-1.5 h-1.5 bg-warning rounded-full"></span>
              )}
            </div>
          )}
        </motion.button>
      );
    }

    const remainingCells = totalCells - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push(<div key={`empty-end-${i}`} className="p-2"></div>);
    }

    return days;
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((date, index) => (
          <div key={index} className="card p-3">
            <div className="text-center mb-2">
              <p className="text-xs text-secondary">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </p>
              <p className={`font-bold ${
                date.toDateString() === new Date().toDateString() ? 'text-sunglow' : ''
              }`}>
                {date.getDate()}
              </p>
            </div>
            <div className="space-y-1">
              {getEventsForDate(date).slice(0, 3).map(event => (
                <div key={event.id} className="text-xs p-1 card rounded">
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
      <div className="card">
        <div className="flex-between mb-4">
          <button onClick={previousMonth} className="btn btn-ghost">
            ←
          </button>
          <div className="flex gap-2">
            <button 
              onClick={goToToday} 
              className="btn btn-secondary text-sm"
            >
              Today
            </button>
            <select 
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'month' | 'week' | 'day')}
              className="input"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
            </select>
          </div>
          <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
          <button onClick={nextMonth} className="btn btn-ghost">
            →
          </button>
        </div>

        {viewMode === 'month' && (
          <>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs text-secondary font-semibold p-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {renderCalendarDays()}
            </div>
          </>
        )}

        {viewMode === 'week' && renderWeekView()}

        {viewMode === 'day' && selectedDate && (
          <div className="card p-4">
            <h4 className="mb-4">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            <div className="space-y-3">
              {getEventsForDate(selectedDate).map(event => (
                <div key={event.id} className="card p-3">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-secondary">
                    {new Date(event.start_time).toLocaleTimeString()} - 
                    {new Date(event.end_time).toLocaleTimeString()}
                  </p>
                </div>
              ))}
              {getEventsForDate(selectedDate).length === 0 && (
                <p className="text-center text-secondary py-8">No events scheduled</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="mb-4">
          {selectedDate ? 
            `${selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : 
            'Select a date'
          }
        </h3>

        {selectedDate ? (
          <div className="flex-col gap-4">
            <AnimatePresence>
              {!showEventForm && (
                <motion.button 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowEventForm(true)}
                  className="btn-primary w-full"
                >
                  + Schedule Deep Work Session
                </motion.button>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showEventForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="card p-4"
                >
                  <input
                    type="text"
                    placeholder="Session title..."
                    className="input w-full mb-3"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />

                  <select
                    className="input w-full mb-3"
                    value={newEvent.event_type}
                    onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value as 'deep_work' | 'task_deadline' | 'meeting' })}
                  >
                    <option value="deep_work">Deep Work Session</option>
                    <option value="task_deadline">Task Deadline</option>
                    <option value="meeting">Meeting</option>
                  </select>

                  <div className="flex gap-3 mb-3 mobile-flex-col">
                    <input
                      type="datetime-local"
                      className="input flex-1"
                      value={newEvent.start_time}
                      onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                    />
                    <input
                      type="datetime-local"
                      className="input flex-1"
                      value={newEvent.end_time}
                      onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                    />
                  </div>

                  {newEvent.event_type === 'deep_work' && (
                    <div className="card p-3 mb-3">
                      <p className="text-sm text-secondary mb-2">Session Configuration</p>
                      <div className="flex gap-2 mb-3">
                        {(['45/15', '25/5', 'custom'] as const).map(type => (
                          <button
                            key={type}
                            onClick={() => updateSessionConfig(type)}
                            className={`btn btn-secondary flex-1 ${
                              newEvent.session_config.session_type === type ? 'border-sunglow bg-sunglow text-white' : ''
                            }`}
                          >
                            {type === 'custom' ? 'Custom' : type}
                          </button>
                        ))}
                      </div>
                      {newEvent.session_config.session_type === 'custom' && (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Focus"
                            className="input flex-1"
                            value={newEvent.session_config.focus_minutes}
                            onChange={(e) => setNewEvent({
                              ...newEvent,
                              session_config: {
                                ...newEvent.session_config,
                                focus_minutes: parseInt(e.target.value)
                              }
                            })}
                          />
                          <input
                            type="number"
                            placeholder="Break"
                            className="input flex-1"
                            value={newEvent.session_config.break_minutes}
                            onChange={(e) => setNewEvent({
                              ...newEvent,
                              session_config: {
                                ...newEvent.session_config,
                                break_minutes: parseInt(e.target.value)
                              }
                            })}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <textarea
                    placeholder="Description (optional)..."
                    className="input w-full mb-3"
                    rows={3}
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  />

                  <div className="flex gap-3">
                    <button onClick={createEvent} className="btn-primary flex-1">
                      Schedule
                    </button>
                    <button 
                      onClick={() => setShowEventForm(false)}
                      className="btn btn-ghost flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-3">
              <h4>Events & Tasks</h4>
              {getEventsForDate(selectedDate).map(event => (
                <motion.div 
                  key={event.id}
                  layout
                  className="card p-3"
                >
                  <div className="flex-between mb-2">
                    <p className="font-medium">{event.title}</p>
                    <span className={`text-xs px-2 py-1 rounded card ${
                      event.event_type === 'deep_work' ? 'text-sunglow' :
                      event.event_type === 'task_deadline' ? 'text-warning' :
                      'text-sunglow'
                    }`}>
                      {event.event_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-secondary">
                    {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {event.end_time && ` - ${new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </p>
                  {event.session_config && (
                    <p className="text-xs text-tertiary mt-2">
                      {event.session_config.focus_minutes}min focus / {event.session_config.break_minutes}min break
                    </p>
                  )}
                </motion.div>
              ))}

              {getTasksForDate(selectedDate).map(task => (
                <motion.div 
                  key={task.id}
                  layout
                  className="card p-3 border-l-2"
                  style={{ borderLeftColor: 'var(--color-warning)' }}
                >
                  <p className="font-medium">{task.title}</p>
                  <p className="text-sm text-warning">Task Due</p>
                </motion.div>
              ))}

              {getEventsForDate(selectedDate).length === 0 && getTasksForDate(selectedDate).length === 0 && (
                <p className="text-center text-secondary py-4">No events or tasks scheduled</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-secondary">Click on a date to view or schedule events</p>
          </div>
        )}
      </div>
    </div>
  );
}