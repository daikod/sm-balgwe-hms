"use server";

import { DiagnosisFormData } from "@/components/dialogs/add-diagnosis";
import db from "@/lib/db";
import {
  DiagnosisSchema,
  PatientBillSchema,
  PaymentSchema,
} from "@/lib/schema";
import { checkRole } from "@/utils/roles";

export const addDiagnosis = async (
  data: DiagnosisFormData,
  appointmentId: string
) => {
  try {
    const validatedData = DiagnosisSchema.parse(data);

    let medicalRecord = null;

    if (!validatedData.medical_id) {
      medicalRecord = await db.medicalRecords.create({
        data: {
          patientId: validatedData.patient_id,
          doctorId: validatedData.doctor_id,
          appointmentId: Number(appointmentId),
        },
      });
    }

    const med_id = validatedData.medical_id || medicalRecord?.id;
    await db.diagnosis.create({
      data: {
        patientId: validatedData.patient_id,
        doctorId: validatedData.doctor_id,
        medicalId: Number(med_id),
        symptoms: validatedData.symptoms,
        diagnosis: validatedData.diagnosis,
        notes: validatedData.notes,
        prescribed_medications: validatedData.prescribed_medications,
        follow_up_plan: validatedData.follow_up_plan,
      },
    });

    return {
      success: true,
      message: "Diagnosis added successfully",
      status: 201,
    };
  } catch (error) {
    console.log(error);
    return {
      error: "Failed to add diagnosis",
    };
  }
};

export async function addNewBill(data: any) {
  try {
    const isAdmin = await checkRole("ADMIN");
    const isDoctor = await checkRole("DOCTOR");

    if (!isAdmin && !isDoctor) {
      return {
        success: false,
        msg: "You are not authorized to add a bill",
      };
    }

    const isValidData = PatientBillSchema.safeParse(data);
    if (!isValidData.success) {
      return { success: false, msg: "Invalid data" };
    }

    const validatedData = isValidData.data;
    let bill_info: { id: number } | null = null;

    const appointment = await db.appointment.findUnique({
      where: { id: Number(data.appointment_id) },
      select: {
        id: true,
        patientId: true,
      },
    });

    if (!appointment) {
      return { success: false, msg: "Appointment not found" };
    }

    const existingBills = await db.payment.findMany({
      where: {
        appointmentId: appointment.id,
      },
      orderBy: { created_at: "asc" },
    });

    if (!existingBills.length) {
      const receiptNumber = Number(
        `${Date.now()}${Math.floor(Math.random() * 100)}`
      );

      bill_info = await db.payment.create({
        data: {
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          receipt_number: receiptNumber,
          bill_date: new Date(),
          payment_date: new Date(),
          discount: data.discount ?? 0,
          amount_paid: data.amount_paid,
          total_amount: data.total_amount,
        },
      });
    } else {
      bill_info = existingBills[0];
    }

    await db.patientBills.create({
      data: {
        bill_id: bill_info.id,
        service_id: Number(validatedData.service_id),
        service_date: new Date(validatedData.service_date),
        quantity: Number(validatedData.quantity),
        unit_cost: Number(validatedData.unit_cost),
        total_cost: Number(validatedData.total_cost),
      },
    });

    return {
      success: true,
      error: false,
      msg: "Bill added successfully",
    };
  } catch (error) {
    console.error(error);
    return { success: false, msg: "Internal Server Error" };
  }
}

// ==================== FIXED: export generateBill ====================
export const generateBill = async (data: any) => {
  try {
    const isValid = PaymentSchema.safeParse(data);
    if (!isValid.success) {
      return { success: false, msg: "Invalid data" };
    }

    const validatedData = isValid.data;

    const discountAmount =
      (Number(validatedData.discount) / 100) * Number(validatedData.total_amount);

    const payment = await db.payment.update({
      where: { id: Number(validatedData.id) },
      data: {
        bill_date: validatedData.bill_date,
        discount: discountAmount,
        total_amount: Number(validatedData.total_amount),
      },
    });

    await db.appointment.update({
      where: { id: payment.appointmentId },
      data: { status: "COMPLETED" },
    });

    return { success: true, error: false, msg: "Bill generated successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, msg: "Internal Server Error" };
  }
};
