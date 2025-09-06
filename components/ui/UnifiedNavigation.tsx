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
import styles from './UnifiedNavigation.module.css';

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
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
        {/* Logo Section */}
        <div className={styles.sidebarHeader}>
          {!sidebarCollapsed && (
            <Link href="/dashboard" className={styles.logo}>
              <div className={styles.logoIcon}>
                <FireIcon />
              </div>
              <span className={styles.logoText}>Floe</span>
            </Link>
          )}
          <button
            onClick={toggleSidebar}
            className={styles.toggleButton}
            aria-label="Toggle sidebar"
          >
            {sidebarCollapsed ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </button>
        </div>

        {/* Main Navigation */}
        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
                           (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              >
                <item.icon className={styles.navIcon} />
                
                {!sidebarCollapsed && (
                  <div className={styles.navLabel}>
                    <p className={styles.navLabelText}>{item.label}</p>
                    {item.description && (
                      <p className={styles.navLabelDescription}>{item.description}</p>
                    )}
                  </div>
                )}
                
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className={styles.tooltip}>
                    <p className={styles.tooltipTitle}>{item.label}</p>
                    <p className={styles.tooltipDescription}>{item.description}</p>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <button
            onClick={toggleQuickAdd}
            className={`${styles.quickActionButton} ${styles.primary}`}
          >
            <PlusIcon />
            {!sidebarCollapsed && <span>New Task</span>}
          </button>
          
          <button
            onClick={toggleCommandPalette}
            className={styles.quickActionButton}
          >
            <CommandLineIcon />
            {!sidebarCollapsed && <span>Commands</span>}
          </button>
        </div>

        {/* User Section */}
        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user?.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            
            {!sidebarCollapsed && (
              <div className={styles.userDetails}>
                <p className={styles.userName}>
                  {user?.fullName || 'User'}
                </p>
                <p className={styles.userEmail}>
                  {user?.email}
                </p>
              </div>
            )}
            
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
              aria-label="Logout"
            >
              <ArrowRightStartOnRectangleIcon />
            </button>
          </div>
          
          {!sidebarCollapsed && (
            <Link 
              href="/settings"
              className={styles.settingsLink}
            >
              <Cog6ToothIcon />
              Settings
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <Link href="/dashboard" className={styles.logo}>
          <div className={styles.logoIcon}>
            <FireIcon />
          </div>
          <span className={styles.logoText}>Floe</span>
        </Link>
        
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={styles.mobileMenuButton}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <XMarkIcon />
          ) : (
            <Bars3Icon />
          )}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            className={`${styles.mobileOverlay} ${mobileMenuOpen ? styles.open : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          />
          
          <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
            <div className={styles.mobileMenuHeader}>
              Menu
            </div>
            
            <nav className={styles.mobileNav}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                  >
                    <item.icon className={styles.navIcon} />
                    <div className={styles.navLabel}>
                      <p className={styles.navLabelText}>{item.label}</p>
                      <p className={styles.navLabelDescription}>{item.description}</p>
                    </div>
                  </Link>
                );
              })}
            </nav>
            
            <div className={styles.quickActions}>
              <button
                onClick={() => {
                  toggleQuickAdd();
                  setMobileMenuOpen(false);
                }}
                className={`${styles.quickActionButton} ${styles.primary}`}
              >
                <PlusIcon />
                <span>New Task</span>
              </button>
              
              <button
                onClick={handleLogout}
                className={styles.quickActionButton}
              >
                <ArrowRightStartOnRectangleIcon />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className={styles.mobileBottomNav}>
        <div className={styles.mobileBottomNavItems}>
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.mobileBottomNavItem} ${isActive ? styles.active : ''}`}
              >
                <item.icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}