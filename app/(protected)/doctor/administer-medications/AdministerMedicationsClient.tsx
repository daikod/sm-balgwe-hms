// app/(protected)/doctor/administer-medications/AdministerMedicationsClient.tsx
"use client";

import React, { useState } from 'react';
import { 
  Pill, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search
} from 'lucide-react';

interface PendingMedication {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: string;
  roomNumber?: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  prescriptionNumber: string;
  prescribedBy: string;
  nextDue: string;
  lastAdministered?: string;
  status: 'due' | 'overdue' | 'completed' | 'missed';
  instructions?: string;
}

interface AdministerMedicationsClientProps {
  role: string;
}

export default function AdministerMedicationsClient({ role }: AdministerMedicationsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMedication, setSelectedMedication] = useState<PendingMedication | null>(null);
  const [showAdministerModal, setShowAdministerModal] = useState(false);
  const [administrationNotes, setAdministrationNotes] = useState('');

  // Sample data
  const medications: PendingMedication[] = [
    {
      id: '1',
      patientId: 'p1',
      patientName: 'John Doe',
      patientAge: '45',
      roomNumber: '201',
      medicationName: 'Amoxicillin',
      dosage: '500mg',
      frequency: '3 times daily',
      prescriptionNumber: 'RX-2025-001',
      prescribedBy: 'Dr. Smith',
      nextDue: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      lastAdministered: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      status: 'due',
      instructions: 'Take with food',
    },
    {
      id: '2',
      patientId: 'p2',
      patientName: 'Jane Smith',
      patientAge: '32',
      roomNumber: '105',
      medicationName: 'Insulin',
      dosage: '10 units',
      frequency: '2 times daily',
      prescriptionNumber: 'RX-2025-002',
      prescribedBy: 'Dr. Watson',
      nextDue: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      lastAdministered: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      status: 'overdue',
      instructions: 'Administer subcutaneously',
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      due: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      missed: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    const icons = {
      due: <Clock className="w-3 h-3" />,
      overdue: <AlertCircle className="w-3 h-3" />,
      completed: <CheckCircle className="w-3 h-3" />,
      missed: <XCircle className="w-3 h-3" />,
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {icons[status as keyof typeof icons]}
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 0) {
      return `Overdue by ${Math.abs(diffHours)}h ${Math.abs(diffMins % 60)}m`;
    } else if (diffHours < 1) {
      return `Due in ${diffMins}m`;
    } else {
      return `Due in ${diffHours}h ${diffMins % 60}m`;
    }
  };

  const handleAdminister = (medication: PendingMedication) => {
    setSelectedMedication(medication);
    setShowAdministerModal(true);
  };

  const handleConfirmAdministration = () => {
    console.log('Administering medication:', selectedMedication);
    console.log('Notes:', administrationNotes);
    
    setShowAdministerModal(false);
    setSelectedMedication(null);
    setAdministrationNotes('');
    
    alert('Medication administered successfully');
  };

  const filteredMedications = medications.filter(med => {
    const matchesSearch = 
      med.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.medicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || med.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: medications.length,
    due: medications.filter(m => m.status === 'due').length,
    overdue: medications.filter(m => m.status === 'overdue').length,
    completed: medications.filter(m => m.status === 'completed').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Pill className="w-8 h-8 text-blue-600" />
          Administer Medications
        </h1>
        <p className="text-gray-600 mt-1">Track and record medication administration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Pill className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Due</p>
              <h3 className="text-2xl font-bold text-yellow-600">{stats.due}</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Overdue</p>
              <h3 className="text-2xl font-bold text-red-600">{stats.overdue}</h3>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <h3 className="text-2xl font-bold text-green-600">{stats.completed}</h3>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by patient, medication, or room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
              <option value="due">Due</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Medication</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dosage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMedications.map((med) => (
                <tr key={med.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{med.patientName}</div>
                    <div className="text-xs text-gray-500">Age: {med.patientAge} | Room: {med.roomNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{med.medicationName}</div>
                    <div className="text-xs text-gray-500">Rx: {med.prescriptionNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{med.dosage}</div>
                    <div className="text-xs text-gray-500">{med.frequency}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{formatDateTime(med.nextDue)}</div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(med.status)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleAdminister(med)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Administer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdministerModal && selectedMedication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Administer Medication</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">{selectedMedication.patientName}</h3>
                </div>
                <div className="text-sm text-blue-800">
                  Age: {selectedMedication.patientAge} | Room: {selectedMedication.roomNumber}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500">Medication</label>
                    <p className="font-semibold text-gray-900">{selectedMedication.medicationName}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Dosage</label>
                    <p className="font-semibold text-gray-900">{selectedMedication.dosage}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="admin-notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="admin-notes"
                  value={administrationNotes}
                  onChange={(e) => setAdministrationNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleConfirmAdministration}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CheckCircle className="w-5 h-5" />
                  Confirm
                </button>
                <button
                  onClick={() => {
                    setShowAdministerModal(false);
                    setSelectedMedication(null);
                    setAdministrationNotes('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}