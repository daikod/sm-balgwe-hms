// app/(protected)/notifications/NotificationsClient.tsx
"use client";

import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  Pill, 
  AlertCircle, 
  Info, 
  CheckCircle,
  Trash2,
  Check,
  Clock,
  User,
  DollarSign,
  Shield
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'prescription' | 'system' | 'alert' | 'info' | 'billing';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  senderName?: string;
}

interface NotificationsClientProps {
  role: string;
  userId: string;
}

export default function NotificationsClient({ role, userId }: NotificationsClientProps) {
  const [filterType, setFilterType] = useState('all');
  const [filterRead, setFilterRead] = useState('all');

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Upcoming Appointment',
      message: 'You have an appointment with Dr. John Smith tomorrow at 10:00 AM',
      type: 'appointment',
      priority: 'high',
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: '/appointments/123',
      actionLabel: 'View Details',
      senderName: 'System',
    },
    {
      id: '2',
      title: 'New Prescription Available',
      message: 'Dr. Emily Watson has prescribed new medication for you.',
      type: 'prescription',
      priority: 'normal',
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      actionUrl: '/prescriptions/456',
      actionLabel: 'View Prescription',
      senderName: 'Dr. Emily Watson',
    },
  ]);

  const getNotificationIcon = (type: string) => {
    const icons = {
      appointment: <Calendar className="w-5 h-5" />,
      prescription: <Pill className="w-5 h-5" />,
      system: <Shield className="w-5 h-5" />,
      alert: <AlertCircle className="w-5 h-5" />,
      info: <Info className="w-5 h-5" />,
      billing: <DollarSign className="w-5 h-5" />,
    };
    return icons[type as keyof typeof icons] || <Bell className="w-5 h-5" />;
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'bg-red-100 text-red-600';
    if (priority === 'high') return 'bg-orange-100 text-orange-600';
    
    const colors = {
      appointment: 'bg-blue-100 text-blue-600',
      prescription: 'bg-purple-100 text-purple-600',
      system: 'bg-gray-100 text-gray-600',
      alert: 'bg-red-100 text-red-600',
      info: 'bg-green-100 text-green-600',
      billing: 'bg-yellow-100 text-yellow-600',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-600';
  };

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-100 text-gray-600',
      normal: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[priority as keyof typeof styles]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    const matchesType = filterType === 'all' || notif.type === filterType;
    const matchesRead = 
      filterRead === 'all' ||
      (filterRead === 'unread' && !notif.isRead) ||
      (filterRead === 'read' && notif.isRead);

    return matchesType && matchesRead;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="w-8 h-8 text-blue-600" />
              Notifications
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-red-500 text-white text-sm font-semibold rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-600 mt-1">Stay updated with your healthcare information</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4" />
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <h3 className="text-2xl font-bold text-gray-900">{notifications.length}</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Unread</p>
              <h3 className="text-2xl font-bold text-red-600">{unreadCount}</h3>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Read</p>
              <h3 className="text-2xl font-bold text-green-600">{notifications.length - unreadCount}</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Type
            </label>
            <select
              id="type-filter"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="appointment">Appointments</option>
              <option value="prescription">Prescriptions</option>
              <option value="billing">Billing</option>
              <option value="info">Information</option>
              <option value="system">System</option>
            </select>
          </div>

          <div>
            <label htmlFor="read-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              id="read-filter"
              value={filterRead}
              onChange={(e) => setFilterRead(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`bg-white rounded-lg shadow overflow-hidden ${
                !notif.isRead ? 'border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${getNotificationColor(notif.type, notif.priority)}`}>
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {notif.title}
                          {!notif.isRead && (
                            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                          {notif.senderName && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {notif.senderName}
                            </span>
                          )}
                          {getPriorityBadge(notif.priority)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Mark as read"
                          >
                            <Check className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notif.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {notif.actionUrl && notif.actionLabel && (
                      <a
                        href={notif.actionUrl}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        {notif.actionLabel}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Notifications</h3>
            <p className="text-gray-600">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
}