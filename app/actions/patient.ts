"use server";

import db from "@/lib/db";
import { PatientFormSchema } from "@/lib/schema";
import { clerkClient } from "@clerk/nextjs/server";

export async function updatePatient(data: any, pid: string) {
  try {
    const validateData = PatientFormSchema.safeParse(data);

    if (!validateData.success) {
      return {
        success: false,
        error: true,
        msg: "Provide all required fields",
      };
    }

    const { 
      emergency_contact_name,
      emergency_contact_number,
      blood_group,
      allergies,
      medical_conditions,
      medical_history,
      insurance_provider,
      insurance_number,
      medical_consent,
      privacy_consent,
      service_consent,
      img,
      ...requiredFields
    } = validateData.data;

    const client = await clerkClient();
    await client.users.updateUser(pid, {
      firstName: requiredFields.first_name,
      lastName: requiredFields.last_name,
    });

    await db.patient.update({
      data: {
        ...requiredFields,
        ...(emergency_contact_name && { emergency_contact_name }),
        ...(emergency_contact_number && { emergency_contact_number }),
        ...(blood_group && { blood_group }),
        ...(allergies && { allergies }),
        ...(medical_conditions && { medical_conditions }),
        ...(medical_history && { medical_history }),
        ...(insurance_provider && { insurance_provider }),
        ...(insurance_number && { insurance_number }),
        ...(medical_consent !== undefined && { medical_consent }),
        ...(privacy_consent !== undefined && { privacy_consent }),
        ...(service_consent !== undefined && { service_consent }),
        ...(img && { img }),
      },
      where: { id: pid },
    });

    return {
      success: true,
      error: false,
      msg: "Patient info updated successfully",
    };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: true, msg: error?.message };
  }
}

export async function createNewPatient(data: any, pid: string) {
  try {
    const validateData = PatientFormSchema.safeParse(data);

    if (!validateData.success) {
      return {
        success: false,
        error: true,
        msg: "Provide all required fields",
      };
    }

    const { 
      emergency_contact_name,
      emergency_contact_number,
      blood_group,
      allergies,
      medical_conditions,
      medical_history,
      insurance_provider,
      insurance_number,
      medical_consent,
      privacy_consent,
      service_consent,
      img,
      ...requiredFields
    } = validateData.data;

    const client = await clerkClient();
    await client.users.updateUser(pid, {
      firstName: requiredFields.first_name,
      lastName: requiredFields.last_name,
    });

    // ✅ Changed from update to create for new patients
    await db.patient.create({
      data: {
        id: pid, // Use the Clerk user ID as the patient ID
        ...requiredFields,
        ...(emergency_contact_name && { emergency_contact_name }),
        ...(emergency_contact_number && { emergency_contact_number }),
        ...(blood_group && { blood_group }),
        ...(allergies && { allergies }),
        ...(medical_conditions && { medical_conditions }),
        ...(medical_history && { medical_history }),
        ...(insurance_provider && { insurance_provider }),
        ...(insurance_number && { insurance_number }),
        ...(medical_consent !== undefined && { medical_consent }),
        ...(privacy_consent !== undefined && { privacy_consent }),
        ...(service_consent !== undefined && { service_consent }),
        ...(img && { img }),
      },
    });

    return {
      success: true,
      error: false,
      msg: "Patient registered successfully",
    };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: true, msg: error?.message };
  }
}