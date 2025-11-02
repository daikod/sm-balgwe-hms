// app/(protected)/patient/prescriptions/PatientPrescriptionsClient.tsx
"use client";

import React, { useState } from 'react';
import { 
  Pill, 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search
} from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: string;
  instructions?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface Prescription {
  id: string;
  prescriptionNumber: string;
  doctorName: string;
  diagnosis: string;
  prescribedDate: string;
  validUntil?: string;
  status: 'active' | 'completed' | 'cancelled' | 'expired';
  medications: Medication[];
  instructions?: string;
  notes?: string;
}

export default function PatientPrescriptionsClient() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Sample data - Replace with actual data from props or API
  const prescriptions: Prescription[] = [
    {
      id: '1',
      prescriptionNumber: 'RX-2025-001',
      doctorName: 'Dr. John Smith',
      diagnosis: 'Acute Bronchitis',
      prescribedDate: new Date().toISOString(),
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      instructions: 'Take medications with food. Complete the full course even if symptoms improve.',
      medications: [
        {
          id: 'm1',
          name: 'Amoxicillin',
          dosage: '500mg',
          frequency: '3 times daily',
          duration: '7 days',
          quantity: '21 tablets',
          instructions: 'Take with meals',
          status: 'in_progress',
        },
        {
          id: 'm2',
          name: 'Cough Syrup',
          dosage: '10ml',
          frequency: '2 times daily',
          duration: '5 days',
          quantity: '100ml bottle',
          instructions: 'Take before bedtime',
          status: 'in_progress',
        },
      ],
    },
    {
      id: '2',
      prescriptionNumber: 'RX-2025-002',
      doctorName: 'Dr. Emily Watson',
      diagnosis: 'Hypertension Management',
      prescribedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      medications: [
        {
          id: 'm3',
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          quantity: '30 tablets',
          instructions: 'Take in the morning',
          status: 'completed',
        },
      ],
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-orange-100 text-orange-800 border-orange-200',
    };

    const icons = {
      active: <CheckCircle className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
      expired: <AlertCircle className="w-3 h-3" />,
      pending: <Clock className="w-3 h-3" />,
      in_progress: <Clock className="w-3 h-3" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const matchesSearch = 
      prescription.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || prescription.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Pill className="w-8 h-8 text-blue-600" />
              My Prescriptions
            </h1>
            <p className="text-gray-600 mt-1">View and manage your prescriptions</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search prescriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              <option value="all">All Prescriptions</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-6">
        {filteredPrescriptions.length > 0 ? (
          filteredPrescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Prescription Header */}
              <div className="bg-blue-50 border-b border-blue-100 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {prescription.prescriptionNumber}
                      </h3>
                      {getStatusBadge(prescription.status)}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Prescribed by: <strong>{prescription.doctorName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Date: {formatDate(prescription.prescribedDate)}</span>
                        {prescription.validUntil && (
                          <span className="text-gray-400">
                            | Valid until: {formatDate(prescription.validUntil)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        <span>Diagnosis: <strong>{prescription.diagnosis}</strong></span>
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>

              {/* Medications */}
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Medications</h4>
                <div className="space-y-4">
                  {prescription.medications.map((med) => (
                    <div key={med.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Pill className="w-5 h-5 text-blue-600" />
                            <h5 className="font-semibold text-gray-900">{med.name}</h5>
                            {getStatusBadge(med.status)}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div>
                              <span className="block text-xs text-gray-500 mb-1">Dosage</span>
                              <span className="font-medium">{med.dosage}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-gray-500 mb-1">Frequency</span>
                              <span className="font-medium">{med.frequency}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-gray-500 mb-1">Duration</span>
                              <span className="font-medium">{med.duration}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-gray-500 mb-1">Quantity</span>
                              <span className="font-medium">{med.quantity}</span>
                            </div>
                          </div>
                          {med.instructions && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                              <strong className="text-yellow-800">Instructions: </strong>
                              <span className="text-yellow-900">{med.instructions}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Prescription Instructions */}
                {prescription.instructions && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-semibold text-blue-900 mb-2">General Instructions</h5>
                    <p className="text-sm text-blue-800">{prescription.instructions}</p>
                  </div>
                )}

                {/* Notes */}
                {prescription.notes && (
                  <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h5 className="font-semibold text-gray-900 mb-2">Additional Notes</h5>
                    <p className="text-sm text-gray-700">{prescription.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Pill className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Prescriptions Found</h3>
            <p className="text-gray-600">You don't have any prescriptions yet.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Showing {filteredPrescriptions.length} prescription(s)</p>
      </div>
    </div>
  );
}