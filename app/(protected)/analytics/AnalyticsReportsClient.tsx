// app/(protected)/analytics/AnalyticsReportsClient.tsx
"use client";

import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Users, Activity, DollarSign, Download, BarChart3 } from 'lucide-react';

interface AnalyticsReportsClientProps {
  role: string;
}

export default function AnalyticsReportsClient({ role }: AnalyticsReportsClientProps) {
  const [dateRange, setDateRange] = useState('month');

  // Patient Demographics Data
  const genderData = [
    { name: 'Male', value: 450, color: '#3B82F6' },
    { name: 'Female', value: 520, color: '#EC4899' },
  ];

  const ageGroupData = [
    { name: '0-18', patients: 120 },
    { name: '19-35', patients: 280 },
    { name: '36-50', patients: 310 },
    { name: '51-65', patients: 180 },
    { name: '65+', patients: 80 },
  ];

  // Appointment Statistics
  const appointmentTrends = [
    { month: 'Jan', completed: 180, cancelled: 25, pending: 15 },
    { month: 'Feb', completed: 210, cancelled: 30, pending: 20 },
    { month: 'Mar', completed: 195, cancelled: 18, pending: 12 },
    { month: 'Apr', completed: 240, cancelled: 22, pending: 18 },
    { month: 'May', completed: 265, cancelled: 28, pending: 25 },
    { month: 'Jun', completed: 290, cancelled: 20, pending: 15 },
  ];

  // Department Performance
  const departmentData = [
    { name: 'Cardiology', patients: 230, revenue: 145000 },
    { name: 'Neurology', patients: 180, revenue: 120000 },
    { name: 'Pediatrics', patients: 310, revenue: 95000 },
    { name: 'Orthopedics', patients: 195, revenue: 135000 },
    { name: 'General', patients: 420, revenue: 180000 },
  ];

  // Revenue Data
  const revenueData = [
    { month: 'Jan', revenue: 125000, expenses: 85000 },
    { month: 'Feb', revenue: 145000, expenses: 90000 },
    { month: 'Mar', revenue: 135000, expenses: 88000 },
    { month: 'Apr', revenue: 165000, expenses: 95000 },
    { month: 'May', revenue: 180000, expenses: 100000 },
    { month: 'Jun', revenue: 195000, expenses: 105000 },
  ];

  // BMI Distribution
  const bmiData = [
    { category: 'Underweight', count: 85, color: '#60A5FA' },
    { category: 'Normal', count: 520, color: '#34D399' },
    { category: 'Overweight', count: 245, color: '#FBBF24' },
    { category: 'Obesity', count: 120, color: '#F87171' },
  ];

  const StatCard = ({ icon: Icon, title, value, change, color }: any) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {change && (
            <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Show limited data for doctors
  const canViewFinancials = role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-8 h-8" />
              Analytics & Reports
            </h1>
            <p className="text-gray-600 mt-1">
              {role === 'admin' ? 'Full System Analytics' : 'Clinical Analytics Dashboard'}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <label 
                htmlFor="date-range-select" 
                className="absolute -top-2 left-2 bg-gray-50 px-1 text-xs text-gray-600"
              >
                Date Range
              </label>
              <select 
                id="date-range-select"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Date range filter"
                title="Select date range for analytics"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </select>
            </div>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              aria-label="Export analytics report"
              title="Export report to PDF"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${canViewFinancials ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6 mb-8`}>
        <StatCard 
          icon={Users}
          title="Total Patients"
          value="970"
          change={12.5}
          color="bg-blue-600"
        />
        <StatCard 
          icon={Calendar}
          title="Appointments"
          value="290"
          change={8.3}
          color="bg-green-600"
        />
        {canViewFinancials && (
          <StatCard 
            icon={DollarSign}
            title="Revenue (MTD)"
            value="₦195,000"
            change={15.2}
            color="bg-purple-600"
          />
        )}
        <StatCard 
          icon={Activity}
          title="Avg. Wait Time"
          value="18 min"
          change={-5.5}
          color="bg-orange-600"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Appointment Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={appointmentTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} name="Completed" />
              <Line type="monotone" dataKey="cancelled" stroke="#EF4444" strokeWidth={2} name="Cancelled" />
              <Line type="monotone" dataKey="pending" stroke="#F59E0B" strokeWidth={2} name="Pending" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Age Group Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Age Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageGroupData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="patients" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Patients" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* BMI Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">BMI Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={bmiData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }: any) => `${category}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {bmiData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3 - Only for Admin */}
      {canViewFinancials && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue vs Expenses */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue vs Expenses</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10B981" radius={[8, 8, 0, 0]} name="Revenue" />
                <Bar dataKey="expenses" fill="#EF4444" radius={[8, 8, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Patient Volume</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="patients" fill="#8B5CF6" radius={[0, 8, 8, 0]} name="Patients" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Summary Table - Only for Admin */}
      {canViewFinancials && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Revenue Summary</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg per Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departmentData.map((dept, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.patients}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦{dept.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₦{Math.round(dept.revenue / dept.patients).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Doctor-specific notice */}
      {!canViewFinancials && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> You are viewing the clinical analytics dashboard. Financial data is restricted to administrators only.
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Report generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p className="mt-1">© 2025 SM BALGWE Hospital Management System. All rights reserved.</p>
      </div>
    </div>
  );
}