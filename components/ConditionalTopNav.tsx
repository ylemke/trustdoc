'use client';

import { usePathname } from 'next/navigation';
import { TopNav } from './TopNav';

export function ConditionalTopNav() {
  const pathname = usePathname();

  // Hide TopNav on login page
  if (pathname === '/login' || pathname === '/') {
    return null;
  }

  return <TopNav />;
}
