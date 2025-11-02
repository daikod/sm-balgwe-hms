// app/(protected)/admin/audit-logs/AuditLogClient.tsx
"use client";

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  UserPlus, 
  UserMinus, 
  LogIn, 
  LogOut, 
  Database, 
  Edit, 
  Trash2,
  Clock,
  Calendar,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userId: string;
  action: string;
  category: 'authentication' | 'user_management' | 'database' | 'system';
  details: string;
  ipAddress: string;
  status: 'success' | 'failure' | 'warning';
  sessionDuration?: string;
}

export default function AuditLogClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState('today');

  // Sample audit log data - Replace with actual data from props or API
  const auditLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: new Date().toISOString(),
      user: 'Dr. John Smith',
      userId: 'user_123',
      action: 'User Login',
      category: 'authentication',
      details: 'Successful login from Chrome browser',
      ipAddress: '192.168.1.100',
      status: 'success',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'Admin Sarah Johnson',
      userId: 'admin_456',
      action: 'Added New Doctor',
      category: 'user_management',
      details: 'Created doctor account: Dr. Michael Chen (Cardiology)',
      ipAddress: '192.168.1.101',
      status: 'success',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user: 'Dr. Emily Watson',
      userId: 'user_789',
      action: 'User Logout',
      category: 'authentication',
      details: 'Session ended normally',
      ipAddress: '192.168.1.102',
      status: 'success',
      sessionDuration: '2h 35m',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      user: 'Admin Sarah Johnson',
      userId: 'admin_456',
      action: 'Modified Patient Record',
      category: 'database',
      details: 'Updated medical history for Patient ID: PAT-001',
      ipAddress: '192.168.1.101',
      status: 'success',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      user: 'System',
      userId: 'system',
      action: 'Failed Login Attempt',
      category: 'authentication',
      details: 'Multiple failed login attempts detected',
      ipAddress: '203.0.113.45',
      status: 'failure',
    },
    {
      id: '6',
      timestamp: new Date(Date.now() - 18000000).toISOString(),
      user: 'Admin Sarah Johnson',
      userId: 'admin_456',
      action: 'Deleted Staff Account',
      category: 'user_management',
      details: 'Removed nurse account: Jane Doe (Inactive)',
      ipAddress: '192.168.1.101',
      status: 'warning',
    },
    {
      id: '7',
      timestamp: new Date(Date.now() - 21600000).toISOString(),
      user: 'Dr. John Smith',
      userId: 'user_123',
      action: 'Created Appointment',
      category: 'database',
      details: 'New appointment scheduled for Patient ID: PAT-045',
      ipAddress: '192.168.1.100',
      status: 'success',
    },
    {
      id: '8',
      timestamp: new Date(Date.now() - 25200000).toISOString(),
      user: 'Admin Sarah Johnson',
      userId: 'admin_456',
      action: 'System Settings Changed',
      category: 'system',
      details: 'Updated appointment slot duration to 30 minutes',
      ipAddress: '192.168.1.101',
      status: 'success',
    },
  ];

  const getActionIcon = (action: string, category: string) => {
    if (action.toLowerCase().includes('login')) return <LogIn className="w-4 h-4" />;
    if (action.toLowerCase().includes('logout')) return <LogOut className="w-4 h-4" />;
    if (action.toLowerCase().includes('added') || action.toLowerCase().includes('created')) return <UserPlus className="w-4 h-4" />;
    if (action.toLowerCase().includes('deleted') || action.toLowerCase().includes('removed')) return <UserMinus className="w-4 h-4" />;
    if (action.toLowerCase().includes('modified') || action.toLowerCase().includes('updated')) return <Edit className="w-4 h-4" />;
    if (category === 'database') return <Database className="w-4 h-4" />;
    return <Shield className="w-4 h-4" />;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      success: 'bg-green-100 text-green-800 border-green-200',
      failure: 'bg-red-100 text-red-800 border-red-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };

    const icons = {
      success: <CheckCircle className="w-3 h-3" />,
      failure: <XCircle className="w-3 h-3" />,
      warning: <AlertCircle className="w-3 h-3" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const styles = {
      authentication: 'bg-blue-100 text-blue-800',
      user_management: 'bg-purple-100 text-purple-800',
      database: 'bg-orange-100 text-orange-800',
      system: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[category as keyof typeof styles]}`}>
        {category.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: auditLogs.length,
    success: auditLogs.filter(l => l.status === 'success').length,
    failures: auditLogs.filter(l => l.status === 'failure').length,
    warnings: auditLogs.filter(l => l.status === 'warning').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-600" />
              Audit Logs
            </h1>
            <p className="text-gray-600 mt-1">System activity and security monitoring</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <label htmlFor="date-range-audit" className="absolute -top-2 left-2 bg-gray-50 px-1 text-xs text-gray-600">
                Time Period
              </label>
              <select 
                id="date-range-audit"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Select time period"
              >
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              <Download className="w-4 h-4" />
              Export Logs
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Events</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Successful</p>
              <h3 className="text-2xl font-bold text-green-600">{stats.success}</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Failures</p>
              <h3 className="text-2xl font-bold text-red-600">{stats.failures}</h3>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Warnings</p>
              <h3 className="text-2xl font-bold text-yellow-600">{stats.warnings}</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category-filter" className="sr-only">Filter by category</label>
            <select
              id="category-filter"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Filter by category"
            >
              <option value="all">All Categories</option>
              <option value="authentication">Authentication</option>
              <option value="user_management">User Management</option>
              <option value="database">Database Changes</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select
              id="status-filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="warning">Warning</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                      {log.sessionDuration && (
                        <div className="text-xs text-gray-500 mt-1">
                          Duration: {log.sessionDuration}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.user}</div>
                      <div className="text-xs text-gray-500">{log.userId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        {getActionIcon(log.action, log.category)}
                        {log.action}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getCategoryBadge(log.category)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(log.status)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">No audit logs found</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Showing {filteredLogs.length} of {auditLogs.length} audit logs</p>
        <p className="mt-1">© 2025 SM BALGWE Hospital Management System. All rights reserved.</p>
      </div>
    </div>
  );
}