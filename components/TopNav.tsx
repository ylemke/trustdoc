'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, ScrollText, LogOut, Inbox } from 'lucide-react';
import { getCurrentUser } from '@/lib/store';
import { logout } from '@/lib/api';
import { NotificationBell } from './NotificationBell';

export function TopNav() {
  const [userName, setUserName] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUserName(currentUser.name);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 h-14 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <div className="h-full max-w-[1600px] mx-auto px-6 flex items-center justify-between">
        {/* Left: Logo + Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-base font-semibold text-neutral-900 tracking-tight">TrustDoc</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
            >
              <LayoutDashboard size={14} strokeWidth={1.5} />
              Dashboard
            </Link>
            <Link
              href="/governance"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              Governance
            </Link>
            <Link
              href="/audit"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
            >
              <ScrollText size={14} strokeWidth={1.5} />
              Audit Trail
            </Link>
            <Link
              href="/worklist"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 rounded-md transition-colors"
            >
              <Inbox size={14} strokeWidth={1.5} />
              Worklist
            </Link>
          </div>
        </div>

        {/* Right: User Profile + Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            {userName || 'Loading...'}
          </Link>
          <NotificationBell />
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
          >
            <LogOut size={14} strokeWidth={1.5} />
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
}
