'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser, getUserNotifications, getTotalBadgeCount, markAllNotificationsAsRead, subscribeToNotifications, subscribeToHDRs, getAllHDRs, getUserById, type Notification, type HDRRecord } from '@/lib/store';

type BellItem = {
  id: string;
  type: 'notification' | 'escalation';
  title: string;
  message: string;
  document_id: string;
  document_name?: string;
  created_at: string;
  isUnread: boolean;
  metadata?: any;
};

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<BellItem[]>([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const currentUser = getCurrentUser();

  useEffect(() => {
    updateItems();

    // Subscribe to notification changes
    const unsubscribeNotifications = subscribeToNotifications(() => {
      updateItems();
    });

    // Subscribe to HDR changes (for escalation status updates)
    const unsubscribeHDRs = subscribeToHDRs(() => {
      updateItems();
    });

    return () => {
      unsubscribeNotifications();
      unsubscribeHDRs();
    };
  }, []);

  function updateItems() {
    const allItems: BellItem[] = [];

    // Get notifications
    const userNotifs = getUserNotifications(currentUser.id);
    userNotifs.forEach(notif => {
      allItems.push({
        id: notif.id,
        type: 'notification',
        title: notif.title,
        message: notif.message,
        document_id: notif.document_id,
        document_name: notif.document_name,
        created_at: notif.created_at,
        isUnread: !notif.read,
        metadata: notif.metadata
      });
    });

    // Get pending escalations (for managers)
    const allHDRs = getAllHDRs();
    const pendingEscalations = allHDRs.filter(
      h => h.status === 'ESCALATED' && h.escalated_to === currentUser.id
    );
    pendingEscalations.forEach(hdr => {
      const escalator = getUserById(hdr.escalated_by || '');
      allItems.push({
        id: hdr.hdr_id,
        type: 'escalation',
        title: '⚠️ New Escalation',
        message: `${escalator?.name || 'Someone'} escalated "${hdr.document_name}" for your review`,
        document_id: hdr.document_id,
        document_name: hdr.document_name,
        created_at: hdr.created_at,
        isUnread: true, // Escalations are always "unread" until resolved
        metadata: {
          escalation_reason: hdr.escalation_reason,
          escalator_name: escalator?.name
        }
      });
    });

    // Sort by date (newest first)
    allItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setItems(allItems.slice(0, 10)); // Show latest 10
    setBadgeCount(getTotalBadgeCount(currentUser.id));
  }

  function handleMarkAllRead() {
    markAllNotificationsAsRead(currentUser.id);
    // Note: Escalations will only be "cleared" when resolved, not when marked as read
  }

  return (
    <div className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
      >
        <svg className="w-6 h-6 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {badgeCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[90]"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl ring-1 ring-black/5 shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-[100] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-neutral-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-neutral-900">Notifications</h3>
                {items.some(i => i.type === 'notification' && i.isUnread) && (
                  <button
                    onClick={() => { handleMarkAllRead(); setIsOpen(false); }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 transition-colors font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-sm text-neutral-500">No notifications yet</p>
                </div>
              ) : (
                items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.type === 'escalation' ? `/review/${item.document_id}` : `/review/${item.document_id}`}
                    onClick={() => setIsOpen(false)}
                    className={`block p-4 hover:bg-neutral-50 transition-colors border-b border-neutral-100 ${
                      item.isUnread ? (item.type === 'escalation' ? 'bg-amber-50' : 'bg-rose-50') : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                        item.isUnread
                          ? (item.type === 'escalation' ? 'bg-amber-600 animate-pulse' : 'bg-rose-600 animate-pulse')
                          : 'bg-neutral-300'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-neutral-900">{item.title}</p>
                          <span className="text-xs text-neutral-400 whitespace-nowrap" suppressHydrationWarning>
                            {formatTimeAgo(item.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 mb-2 leading-relaxed">{item.message}</p>

                        {/* Escalation reason preview */}
                        {item.type === 'escalation' && item.metadata?.escalation_reason && (
                          <div className="mt-2 p-2 bg-amber-50 border-l-2 border-amber-500 rounded-r">
                            <p className="text-xs text-amber-800 line-clamp-2">{item.metadata.escalation_reason}</p>
                          </div>
                        )}

                        {/* Resolution decision badge */}
                        {item.type === 'notification' && item.metadata?.resolution_decision && (
                          <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                            item.metadata.resolution_decision === 'APPROVE'
                              ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20'
                              : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
                          }`}>
                            {item.metadata.resolution_decision}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-3 border-t border-neutral-100 bg-neutral-50">
                <Link
                  href={items.some(i => i.type === 'escalation') ? '/worklist' : '/notifications'}
                  onClick={() => setIsOpen(false)}
                  className="block text-center text-sm text-violet-600 hover:text-violet-700 transition-colors font-semibold"
                >
                  {items.some(i => i.type === 'escalation') ? 'View Worklist →' : 'View all notifications →'}
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return time.toLocaleDateString();
}
