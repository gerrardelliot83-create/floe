'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useHotkeys } from 'react-hotkeys-hook';
import useStore from '@/lib/store';
import { 
  HomeIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  PlusIcon,
  ArrowRightStartOnRectangleIcon,
  CommandLineIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  BoltIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function UnifiedNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { 
    ui: { sidebarCollapsed },
    toggleCommandPalette, 
    toggleQuickAdd, 
    toggleSidebar,
    user 
  } = useStore();

  // Keyboard shortcuts
  useHotkeys('cmd+k, ctrl+k', (e) => {
    e.preventDefault();
    toggleCommandPalette();
  }, { enableOnFormTags: false });
  
  useHotkeys('cmd+n, ctrl+n', (e) => {
    e.preventDefault();
    toggleQuickAdd();
  }, { enableOnFormTags: false });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const navItems = [
    { 
      href: '/dashboard', 
      label: 'Dashboard', 
      icon: HomeIcon,
      description: 'Overview and stats'
    },
    { 
      href: '/tasks', 
      label: 'Tasks', 
      icon: CheckCircleIcon,
      description: 'Manage your tasks'
    },
    { 
      href: '/deep-work', 
      label: 'Deep Work', 
      icon: BoltIcon,
      description: 'Focus sessions'
    },
    { 
      href: '/timer', 
      label: 'Timer', 
      icon: ClockIcon,
      description: 'Pomodoro timer'
    },
    { 
      href: '/calendar', 
      label: 'Calendar', 
      icon: CalendarDaysIcon,
      description: 'Schedule view'
    },
    { 
      href: '/analytics', 
      label: 'Analytics', 
      icon: ChartBarIcon,
      description: 'Your progress'
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`
        hidden lg:flex flex-col fixed left-0 top-0 h-full 
        bg-surface border-r border-border z-30 transition-all duration-300
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
      `}>
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!sidebarCollapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sunglow rounded-lg flex items-center justify-center">
                <FireIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg text-primary">Floe</span>
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-surface-light transition-colors text-secondary hover:text-primary"
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? (
              <ChevronRightIcon className="w-5 h-5" />
            ) : (
              <ChevronLeftIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 relative
                  ${isActive 
                    ? 'bg-sunglow/10 text-sunglow' 
                    : 'text-secondary hover:text-primary hover:bg-surface-light'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sunglow rounded-r-full" />
                )}
                
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-sunglow' : ''}`} />
                
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.label}</p>
                    {item.description && (
                      <p className="text-xs text-muted">{item.description}</p>
                    )}
                  </div>
                )}
                
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="
                    absolute left-full ml-2 px-3 py-2 bg-surface-light rounded-lg
                    text-sm text-primary whitespace-nowrap shadow-lg border border-border
                    opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity
                    z-50
                  ">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted">{item.description}</p>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="p-3 space-y-2 border-t border-border">
          <button
            onClick={toggleQuickAdd}
            className="w-full btn btn-primary btn-sm justify-start gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            {!sidebarCollapsed && <span>New Task</span>}
          </button>
          
          <button
            onClick={toggleCommandPalette}
            className="w-full btn btn-ghost btn-sm justify-start gap-2"
          >
            <CommandLineIcon className="w-4 h-4" />
            {!sidebarCollapsed && <span>Commands</span>}
          </button>
        </div>

        {/* User Section */}
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sunglow/20 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-sunglow">
                {user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">
                  {user?.fullName || 'User'}
                </p>
                <p className="text-xs text-muted truncate">
                  {user?.email}
                </p>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-surface-light transition-colors text-secondary hover:text-primary ml-auto"
              aria-label="Logout"
            >
              <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
          
          {!sidebarCollapsed && (
            <Link 
              href="/settings"
              className="mt-2 flex items-center gap-2 px-2 py-1.5 text-xs text-secondary hover:text-primary transition-colors"
            >
              <Cog6ToothIcon className="w-4 h-4" />
              Settings
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-surface border-b border-border z-30">
        <div className="h-full px-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-sunglow rounded-lg flex items-center justify-center">
              <FireIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-primary">Floe</span>
          </Link>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-surface-light transition-colors text-secondary"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-5 h-5" />
            ) : (
              <Bars3Icon className="w-5 h-5" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setMobileMenuOpen(false)}
          />
          
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-surface">
            <div className="h-14 flex items-center px-4 border-b border-border">
              <span className="font-semibold text-lg text-primary">Menu</span>
            </div>
            
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-3 rounded-lg
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-sunglow/10 text-sunglow' 
                        : 'text-secondary hover:text-primary hover:bg-surface-light'
                      }
                    `}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-sunglow' : ''}`} />
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-3 space-y-2 border-t border-border">
              <button
                onClick={() => {
                  toggleQuickAdd();
                  setMobileMenuOpen(false);
                }}
                className="w-full btn btn-primary btn-sm"
              >
                <PlusIcon className="w-4 h-4" />
                New Task
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full btn btn-ghost btn-sm"
              >
                <ArrowRightStartOnRectangleIcon className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border z-30">
        <div className="h-full px-2 flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-lg
                  transition-colors min-w-0
                  ${isActive ? 'text-sunglow' : 'text-secondary'}
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-2xs">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}