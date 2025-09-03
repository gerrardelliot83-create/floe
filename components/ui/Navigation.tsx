'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/timer', label: 'Timer', icon: '⏱️' },
    { href: '/tasks', label: 'Tasks', icon: '✓' },
    { href: '/calendar', label: 'Calendar', icon: '📅' },
  ];

  return (
    <nav className="glass-card flex-between p-4 mb-6">
      <div className="flex gap-2">
        <h3 className="text-primary">Floe</h3>
      </div>
      
      <div className="flex gap-6 mobile-hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex gap-2 items-center transition-all ${
              pathname === item.href ? 'text-primary' : 'text-secondary hover:text-primary'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="glass-button text-sm"
      >
        Logout
      </button>
    </nav>
  );
}