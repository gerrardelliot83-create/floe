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
} from '@heroicons/react/24/outline';

export default function UnifiedNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  
  const { 
    ui: { sidebarCollapsed },
    toggleCommandPalette, 
    toggleQuickAdd, 
    toggleSidebar,
    user 
  } = useStore();

  // Global keyboard shortcuts
  useHotkeys('1', () => router.push('/dashboard'), { enableOnFormTags: false });
  useHotkeys('2', () => router.push('/tasks'), { enableOnFormTags: false });
  useHotkeys('3', () => router.push('/timer'), { enableOnFormTags: false });
  useHotkeys('4', () => router.push('/calendar'), { enableOnFormTags: false });
  useHotkeys('cmd+t, ctrl+t', (e) => {
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
      shortcut: '1',
      color: 'text-blue-500'
    },
    { 
      href: '/tasks', 
      label: 'Tasks', 
      icon: CheckCircleIcon, 
      shortcut: '2',
      color: 'text-green-500'
    },
    { 
      href: '/timer', 
      label: 'Focus', 
      icon: ClockIcon, 
      shortcut: '3',
      color: 'text-purple-500'
    },
    { 
      href: '/calendar', 
      label: 'Calendar', 
      icon: CalendarDaysIcon, 
      shortcut: '4',
      color: 'text-orange-500'
    },
  ];

  const bottomNavItems = [
    { 
      href: '/analytics', 
      label: 'Analytics', 
      icon: ChartBarIcon,
      shortcut: '5',
      color: 'text-cyan-500'
    },
    { 
      href: '/settings', 
      label: 'Settings', 
      icon: Cog6ToothIcon,
      shortcut: ',',
      color: 'text-gray-500'
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-surface border-r border-border-dark transition-all duration-300 z-40 ${
        sidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border-dark">
          <Link href="/dashboard" className={`font-bold text-xl text-sunglow ${sidebarCollapsed ? 'hidden' : ''}`}>
            Floe
          </Link>
          <button
            onClick={toggleSidebar}
            className="text-secondary hover:text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sidebarCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
            </svg>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${
                    isActive 
                      ? 'bg-sunglow/10 text-sunglow border-l-4 border-sunglow' 
                      : 'hover:bg-surface-dark text-secondary hover:text-primary'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? '' : item.color}`} />
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      <kbd className="ml-auto px-1.5 py-0.5 text-xs bg-bg-dark rounded border border-border-dark text-secondary">
                        {item.shortcut}
                      </kbd>
                    </>
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-surface-dark rounded-md text-sm text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-4 border-t border-border-dark">
            <button
              onClick={toggleQuickAdd}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-sunglow text-white hover:bg-sunglow/90 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              {!sidebarCollapsed && (
                <>
                  <span className="font-medium">New Task</span>
                  <kbd className="ml-auto px-1.5 py-0.5 text-xs bg-white/20 rounded">
                    ⌘T
                  </kbd>
                </>
              )}
            </button>
            
            <button
              onClick={toggleCommandPalette}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-dark text-secondary hover:text-primary transition-colors mt-2"
            >
              <CommandLineIcon className="w-5 h-5" />
              {!sidebarCollapsed && (
                <>
                  <span className="font-medium">Commands</span>
                  <kbd className="ml-auto px-1.5 py-0.5 text-xs bg-bg-dark rounded border border-border-dark">
                    ⌘K
                  </kbd>
                </>
              )}
            </button>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="px-3 pb-4">
          <div className="space-y-1">
            {bottomNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${
                  pathname === item.href
                    ? 'bg-sunglow/10 text-sunglow'
                    : 'hover:bg-surface-dark text-secondary hover:text-primary'
                }`}
              >
                <item.icon className={`w-5 h-5 ${pathname === item.href ? '' : item.color}`} />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-surface-dark rounded-md text-sm text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                    {item.label}
                  </div>
                )}
              </Link>
            ))}
          </div>

          {/* User Section */}
          <div className="mt-4 pt-4 border-t border-border-dark">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-sunglow/20 flex items-center justify-center">
                <span className="text-sunglow font-medium text-sm">
                  {user.fullName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {user.fullName || 'User'}
                  </p>
                  <p className="text-xs text-secondary truncate">
                    {user.email}
                  </p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="ml-auto text-secondary hover:text-primary transition-colors"
                title="Logout"
              >
                <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border-dark z-40">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'text-sunglow' : 'text-secondary'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={toggleCommandPalette}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-secondary"
          >
            <CommandLineIcon className="w-5 h-5" />
            <span className="text-xs">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}