'use client';

import { useState, useEffect } from 'react';
import { USERS, getCurrentUser, setCurrentUser, type User } from '@/lib/store';

export function UserSwitcher() {
  const [currentUser, setCurrentUserState] = useState<User>(getCurrentUser());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentUserState(getCurrentUser());
  }, []);

  function handleUserChange(userId: string) {
    setCurrentUser(userId);
    setCurrentUserState(USERS.find(u => u.id === userId) || USERS[0]);
    setIsOpen(false);
    // Reload page to reflect new user
    window.location.reload();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 rounded-lg border border-default hover:border-strong transition-colors bg-elevated"
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-inverse font-semibold text-sm">
          {currentUser.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-primary">{currentUser.name}</div>
          <div className="text-xs text-tertiary">{currentUser.role}</div>
        </div>
        <svg
          className={`w-4 h-4 text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-64 bg-elevated border border-default rounded-lg shadow-xl z-20 overflow-hidden">
            <div className="p-2 border-b border-subtle">
              <p className="text-xs text-tertiary font-medium px-2 py-1">Switch User (Dev Mode)</p>
            </div>
            {USERS.map(user => (
              <button
                key={user.id}
                onClick={() => handleUserChange(user.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-overlay transition-colors ${
                  user.id === currentUser.id ? 'bg-overlay' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-inverse font-semibold text-sm ${
                  user.id === currentUser.id ? 'bg-primary' : 'bg-secondary'
                }`}>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-left flex-1">
                  <div className="text-sm font-medium text-primary">{user.name}</div>
                  <div className="text-xs text-tertiary">{user.role}</div>
                  <div className="text-xs text-tertiary">{user.department}</div>
                </div>
                {user.id === currentUser.id && (
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
