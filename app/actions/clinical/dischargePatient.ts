'use server';

import db from '@/lib/db';
import { sendDischargeEmail } from '@/utils/email';
import { Role } from '@prisma/client';

export interface DischargePatientInput {
  admissionId: number;
  dischargedBy: string; // Clerk user ID
  dischargeSummary?: string;
}

export async function dischargePatient(input: DischargePatientInput) {
  return await db.$transaction(async (tx) => {
    // 1️⃣ Fetch admission
    const admission = await tx.admission.findUnique({
      where: { id: input.admissionId },
      select: {
        id: true,
        status: true,
        patientId: true,
        medicalRecordId: true,
        patient: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        bedAllocations: {
          where: { releasedAt: null },
          select: { id: true, bedId: true },
        },
      },
    });

    if (!admission) throw new Error('Admission not found');
    if (admission.status !== 'ACTIVE') throw new Error('Patient is not currently admitted');
    if (!admission.medicalRecordId) throw new Error('Medical record not found');

    const medicalId = admission.medicalRecordId;
    const patientId = admission.patientId;

    // 2️⃣ Update admission status + bed release
    const updatedAdmission = await tx.admission.update({
      where: { id: input.admissionId },
      data: {
        dischargedAt: new Date(),
        status: 'DISCHARGED',
      },
    });

    // 3️⃣ Release bed(s)
    for (const allocation of admission.bedAllocations) {
      await tx.bedAllocation.update({
        where: { id: allocation.id },
        data: { releasedAt: new Date() },
      });
    }

    // 4️⃣ Fetch vitals
    const vitalsRaw = await tx.vitalSigns.findMany({
      where: { medicalId },
      orderBy: { created_at: 'desc' },
    });
    const vitals = vitalsRaw.map((v) => ({
      id: v.id,
      body_temperature: v.body_temperature,
      systolic: v.systolic,
      diastolic: v.diastolic,
      heartRate: v.heartRate,
      respiratory_rate: v.respiratory_rate ?? undefined,
      oxygen_saturation: v.oxygen_saturation ?? undefined,
      weight: v.weight,
      height: v.height,
      created_at: v.created_at,
      updated_at: v.updated_at,
    }));

    // 5️⃣ Fetch diagnoses
    const diagnosesRaw = await tx.diagnosis.findMany({ where: { medicalId } });
    const diagnoses = diagnosesRaw.map((d) => ({
      id: d.id,
      doctorId: d.doctorId,
      symptoms: d.symptoms,
      diagnosis: d.diagnosis,
      notes: d.notes ?? undefined,
      prescribed_medications: d.prescribed_medications ?? undefined,
      follow_up_plan: d.follow_up_plan ?? undefined,
      created_at: d.created_at,
      updated_at: d.updated_at,
    }));

    // 6️⃣ Fetch prescriptions
    const prescriptions = await tx.prescription.findMany({
      where: { patientId },
      include: {
        medications: {
          include: { administrations: true },
        },
      },
    });

    // 7️⃣ Compose summary
    const summary = {
      patientName: `${admission.patient.first_name} ${admission.patient.last_name}`,
      dischargedAt: updatedAdmission.dischargedAt,
      vitals,
      diagnoses,
      prescriptions,
      dischargeNotes: input.dischargeSummary || '',
    };

    // 8️⃣ Send email to patient
    if (admission.patient.email) {
      try {
        await sendDischargeEmail({
          to: admission.patient.email,
          patientName: summary.patientName,
          vitals,
          diagnoses,
          prescriptions,
          dischargeNotes: summary.dischargeNotes,
        });
      } catch (err) {
        console.error('Failed to send discharge email:', err);
      }
    }

    // 9️⃣ Notify relevant staff (nurses + admin)
    const staffToNotify = await tx.staff.findMany({
      where: { role: { in: [Role.NURSE, Role.ADMIN] }, status: 'ACTIVE' },
      select: { id: true, name: true, role: true }, // include role
    });

    for (const staff of staffToNotify) {
      await tx.notification.create({
        data: {
          userId: staff.id,
          userRole: staff.role,
          title: 'Patient Discharged',
          message: `${summary.patientName} has been discharged.`,
          type: 'admission',
          priority: 'normal',
          actionUrl: `/admissions/${admission.id}`,
        },
      });
    }

    return summary;
  });
}
