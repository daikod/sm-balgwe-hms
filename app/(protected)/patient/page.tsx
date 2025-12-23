// Import necessary types
import { Appointment, DoctorInfo } from '@/types/appointment';  // Ensure correct import
import { currentUser } from '@clerk/nextjs/server';  // Clerk server-side import
import { redirect } from 'next/navigation';
import { getPatientById, getPatientDashboardStatistics } from '@/utils/services/patient';  // Make sure these are imported
import { PatientDashboardClient } from './PatientDashboardClient'; // A separate client-side component
import { getDoctors } from "@/utils/services/doctor"

const PatientDashboardServer = async () => {
  const user = await currentUser();  // Server-side Clerk logic
  if (!user?.id) redirect('/sign-in');

  // Fetch data server-side
  const { data: patientData } = await getPatientById(user.id);  // Ensure this function is correctly imported
  const { data: doctors = [] } = await getDoctors();  // Ensure this function is correctly imported
  const { data, appointmentCounts, last5Records, totalAppointments, monthlyData } = await getPatientDashboardStatistics(user.id);  // Ensure this function is correctly imported

  if (!data || !patientData) return null;

  // Extract necessary plain data from user and patientData
  const plainUserData = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.primaryEmailAddressId,
    imageUrl: user.imageUrl,
  };

  const plainPatientData = {
  id: patientData.id,
  address: patientData.address || '',
  img: patientData.img || null,
  first_name: patientData.first_name,
  last_name: patientData.last_name,
  date_of_birth: patientData.date_of_birth,
  gender: patientData.gender,
  phone: patientData.phone,
  email: patientData.email,
  marital_status: patientData.marital_status,
  emergency_contact_name: patientData.emergency_contact_name,
  emergency_contact_number: patientData.emergency_contact_number,
  relation: patientData.relation,
  blood_group: patientData.blood_group,
  allergies: patientData.allergies,
  medical_conditions: patientData.medical_conditions,
  medical_history: patientData.medical_history,
  insurance_provider: patientData.insurance_provider,
  insurance_number: patientData.insurance_number,
  privacy_consent: patientData.privacy_consent,
  service_consent: patientData.service_consent,
  medical_consent: patientData.medical_consent,
  colorCode: patientData.colorCode,
  created_at: patientData.created_at,
  updated_at: patientData.updated_at,
};


  const mappedAppointments: Appointment[] = last5Records.map((a: any) => ({
    id: a.id,
    roomID: a.roomID || '',
    appointment_date: a.appointment_date,
    time: a.time,
    status: a.status as Appointment['status'],
    duration: a.duration || 0,
    type: (a.type as Appointment['type']) || 'PHYSICAL',
    patient: a.patient ? { ...a.patient, colorCode: a.patient.colorCode || null } : null,
    doctor: a.doctor ? ({ ...a.doctor, colorCode: a.doctor.colorCode || null } as DoctorInfo) : null,
  }));

  // Pass the serialized plain data to the client-side component
  return (
    <PatientDashboardClient
      user={plainUserData} 
      patientData={plainPatientData} 
      doctors={doctors} 
      data={data}
      appointmentCounts={appointmentCounts} 
      last5Records={mappedAppointments} 
      totalAppointments={totalAppointments} 
      monthlyData={monthlyData}
    />
  );
};

export default PatientDashboardServer;
