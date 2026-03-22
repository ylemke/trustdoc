'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCircle2, AlertCircle, FileText, User, Clock } from 'lucide-react';
import { getCurrentUser, getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, subscribeToNotifications, type Notification } from '@/lib/store';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const currentUser = getCurrentUser();

  useEffect(() => {
    updateNotifications();

    const unsubscribe = subscribeToNotifications(() => {
      updateNotifications();
    });

    return unsubscribe;
  }, []);

  function updateNotifications() {
    const userNotifs = getUserNotifications(currentUser.id);
    setNotifications(userNotifs);
  }

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  function handleMarkAsRead(notificationId: string) {
    markNotificationAsRead(notificationId);
  }

  function handleMarkAllRead() {
    markAllNotificationsAsRead(currentUser.id);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-violet-600" strokeWidth={1.5} />
            <h1 className="text-3xl font-bold text-neutral-900">Notifications</h1>
          </div>
          <p className="text-neutral-600">
            Stay updated on your escalation resolutions and document decisions
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                <Bell className="w-6 h-6 text-neutral-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Total</p>
                <p className="text-2xl font-bold text-neutral-900">{notifications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-rose-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Unread</p>
                <p className="text-2xl font-bold text-rose-600">{unreadCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 ring-1 ring-black/5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm text-neutral-500">Read</p>
                <p className="text-2xl font-bold text-neutral-600">{notifications.length - unreadCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'all'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-neutral-600 ring-1 ring-neutral-200 hover:bg-neutral-50'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center ring-1 ring-black/5">
            <Bell className="w-16 h-16 text-neutral-300 mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-sm text-neutral-600">
              {filter === 'unread'
                ? 'All caught up! Your escalations will appear here when resolved.'
                : 'When managers respond to your escalations, you\'ll see updates here.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkAsRead
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}) {
  const typeConfig = {
    ESCALATION_RESOLVED: {
      icon: <CheckCircle2 className="w-5 h-5" strokeWidth={1.5} />,
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
      ringColor: 'ring-emerald-200'
    },
    ESCALATION_RECEIVED: {
      icon: <AlertCircle className="w-5 h-5" strokeWidth={1.5} />,
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600',
      ringColor: 'ring-amber-200'
    },
  };

  const config = typeConfig[notification.type];

  return (
    <div className={`bg-white rounded-xl ring-1 overflow-hidden transition-all hover:shadow-md ${
      !notification.read ? 'ring-violet-300 shadow-sm' : 'ring-neutral-200'
    }`}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bgColor} ${config.textColor}`}>
            {config.icon}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-base font-semibold text-neutral-900">{notification.title}</h3>
              <div className="flex items-center gap-2">
                {!notification.read && (
                  <span className="w-2 h-2 bg-violet-500 rounded-full" />
                )}
                <span className="text-xs text-neutral-500 whitespace-nowrap" suppressHydrationWarning>
                  {formatTimestamp(notification.created_at)}
                </span>
              </div>
            </div>

            <p className="text-sm text-neutral-600 mb-3 leading-relaxed">{notification.message}</p>

            {/* Document Info */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-neutral-400" strokeWidth={1.5} />
                <span className="text-xs text-neutral-500">Document</span>
              </div>
              <div className="text-sm text-neutral-900 font-medium">{notification.document_name}</div>
            </div>

            {/* Metadata */}
            {notification.metadata && (
              <div className="flex flex-wrap gap-3 mb-3 text-xs text-neutral-600">
                {notification.metadata.resolver_name && (
                  <div className="flex items-center gap-1.5">
                    <User size={14} />
                    <span>Resolved by <span className="font-semibold text-neutral-900">{notification.metadata.resolver_name}</span></span>
                  </div>
                )}
                {notification.metadata.resolution_decision && (
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] uppercase tracking-wider font-semibold ring-1 ${
                    notification.metadata.resolution_decision === 'APPROVE'
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                      : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                  }`}>
                    {notification.metadata.resolution_decision}
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-3 border-t border-neutral-100">
              <Link
                href={`/review/${notification.document_id}`}
                className="text-sm text-violet-600 hover:text-violet-700 font-semibold transition-colors"
              >
                View Document →
              </Link>
              {!notification.read && (
                <>
                  <span className="text-neutral-300">•</span>
                  <button
                    onClick={() => onMarkAsRead(notification.id)}
                    className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
                  >
                    Mark as read
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}
