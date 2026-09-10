import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Clock,
  Filter,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const Notifications = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const [filter, setFilter] = useState('all'); // all, unread

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));

  const getNotifIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'issue':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time updates regarding task assignments, mentions, and critical issues.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl hover:bg-slate-50 flex items-center gap-1.5 transition"
          >
            <CheckCheck className="w-4 h-4 text-[#923b5b]" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition ${
            filter === 'all'
              ? 'bg-[#923b5b] text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition ${
            filter === 'unread'
              ? 'bg-[#923b5b] text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No notifications to display in this view.
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n._id}
              className={`p-4 flex items-start justify-between gap-4 transition ${
                !n.isRead ? 'bg-rose-50/20' : 'hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="mt-1 p-2 rounded-xl bg-slate-100 shrink-0">
                  {getNotifIcon(n.type)}
                </div>
                <div>
                  <p className={`text-xs text-slate-900 ${!n.isRead ? 'font-bold' : 'font-medium'}`}>
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(n.createdAt).toLocaleDateString()} at{' '}
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!n.isRead && (
                  <button
                    onClick={() => markAsRead(n._id)}
                    className="p-1.5 text-xs text-[#923b5b] hover:bg-rose-50 rounded-lg font-bold"
                    title="Mark as Read"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(n._id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
