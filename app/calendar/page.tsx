'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import BackgroundProvider from '@/components/ui/BackgroundProvider';
import Navigation from '@/components/ui/Navigation';
import { CalendarEvent } from '@/lib/types/database';

const AdvancedCalendar = dynamic(
  () => import('@/components/calendar/AdvancedCalendar'),
  { 
    ssr: false,
    loading: () => (
      <div className="text-center py-12">
        <p className="text-secondary">Loading calendar...</p>
      </div>
    )
  }
);

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const handleEventCreate = (event: CalendarEvent) => {
    setEvents([...events, event]);
  };

  return (
    <BackgroundProvider>
      <div className="min-h-screen p-4">
        <Navigation />
        
        <div className="container" style={{ maxWidth: '1400px' }}>
          <div className="mb-6">
            <h2>Calendar</h2>
            <p className="text-secondary">Schedule deep work sessions and manage your time effectively</p>
          </div>
          
          <AdvancedCalendar 
            events={events}
            onEventCreate={handleEventCreate}
          />

          <div className="glass-card mt-6">
            <h3 className="mb-4">Upcoming Sessions This Week</h3>
            {events.filter(e => {
              const eventDate = new Date(e.start_time);
              const now = new Date();
              const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
              return eventDate >= now && eventDate <= weekFromNow;
            }).length > 0 ? (
              <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {events.filter(e => {
                  const eventDate = new Date(e.start_time);
                  const now = new Date();
                  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                  return eventDate >= now && eventDate <= weekFromNow;
                }).map(event => (
                  <div key={event.id} className="glass p-3">
                    <p className="font-medium mb-1">{event.title}</p>
                    <p className="text-sm text-secondary">
                      {new Date(event.start_time).toLocaleDateString()} at {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {event.session_config && (
                      <p className="text-xs text-primary mt-2">
                        {event.session_config.focus_minutes}min focus / {event.session_config.break_minutes}min break
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-secondary">No upcoming sessions scheduled</p>
                <p className="text-sm text-tertiary mt-2">
                  Use the calendar above to schedule your first deep work session
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BackgroundProvider>
  );
}