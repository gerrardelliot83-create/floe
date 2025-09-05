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
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/timer', label: 'Timer' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/calendar', label: 'Calendar' },
  ];

  return (
    <nav className="card flex-between p-4 mb-6">
      <div className="flex gap-2">
        <h3 className="text-sunglow font-bold">Floe</h3>
      </div>
      
      <div className="flex gap-6 mobile-hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex gap-2 items-center transition-all font-medium ${
              pathname === item.href ? 'text-sunglow' : 'text-secondary hover:text-sunglow'
            }`}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <button
        onClick={handleLogout}
        className="btn btn-ghost text-sm"
      >
        Logout
      </button>
    </nav>
  );
}