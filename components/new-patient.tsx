"use client";

import { useUser } from "@clerk/nextjs";
import { Patient } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Form } from "./ui/form";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PatientFormSchema } from "@/lib/schema";
import { z } from "zod";
import { CustomInput } from "./custom-input";
import { GENDER, MARITAL_STATUS, RELATION } from "@/lib";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface DataProps {
  data?: Patient | null;
  type: "create" | "update";
  onComplete?: () => Promise<void>; // ✅ Added
}

export const NewPatient = ({ data, type, onComplete }: DataProps) => {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const defaultValues = {
    first_name: user?.firstName || "",
    last_name: user?.lastName || "",
    email: user?.emailAddresses?.[0]?.emailAddress || "",
    phone: user?.phoneNumbers?.[0]?.toString() || "",
    address: "",
    date_of_birth: new Date(),
    gender: "MALE" as "MALE" | "FEMALE",
    marital_status: "single" as "single" | "married" | "divorced" | "widowed" | "separated",
    emergency_contact_name: "",
    emergency_contact_number: "",
    relation: "mother" as "mother" | "father" | "husband" | "wife" | "other",
    blood_group: "",
    allergies: "",
    medical_conditions: "",
    medical_history: "",
    insurance_number: "",
    insurance_provider: "",
    privacy_consent: false,
    service_consent: false,
    medical_consent: false,
  };

  const form = useForm<z.infer<typeof PatientFormSchema>>({
    resolver: zodResolver(PatientFormSchema),
    defaultValues,
  });

  const internalSubmit: SubmitHandler<z.infer<typeof PatientFormSchema>> = async (values) => {
    setLoading(true);
    try {
      const res = await fetch("/api/patient/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const result = await res.json();

      if (!result.success) throw new Error(result.message);

      toast.success("Patient registered successfully");

      // ✅ Call onComplete if provided
      if (onComplete) await onComplete();
      else router.push("/patient/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to submit patient data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type === "update" && data) {
      form.reset({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
        phone: data.phone || "",
        date_of_birth: data.date_of_birth ? new Date(data.date_of_birth) : new Date(),
        gender: data.gender === "FEMALE" ? "FEMALE" : "MALE",
        marital_status:
          data.marital_status === "married" ||
          data.marital_status === "divorced" ||
          data.marital_status === "widowed" ||
          data.marital_status === "separated"
            ? data.marital_status
            : "single",
        address: data.address || "",
        emergency_contact_name: data.emergency_contact_name || "",
        emergency_contact_number: data.emergency_contact_number || "",
        relation:
          data.relation === "father" ||
          data.relation === "husband" ||
          data.relation === "wife" ||
          data.relation === "other"
            ? data.relation
            : "mother",
        blood_group: data.blood_group || "",
        allergies: data.allergies || "",
        medical_conditions: data.medical_conditions || "",
        medical_history: data.medical_history || "",
        insurance_number: data.insurance_number || "",
        insurance_provider: data.insurance_provider || "",
        privacy_consent: data.privacy_consent || false,
        service_consent: data.service_consent || false,
        medical_consent: data.medical_consent || false,
      });
    } else if (type === "create") {
      form.reset(defaultValues);
    }
  }, [data, type]);

  return (
    <Card className="max-w-6xl w-full p-4">
      <CardHeader>
        <CardTitle>Patient Registration</CardTitle>
        <CardDescription>
          Please provide all information below to help us serve you better.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(internalSubmit)} className="space-y-8 mt-5">
            {/* PERSONAL INFO */}
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">
              <CustomInput type="input" control={form.control} name="first_name" label="First Name" />
              <CustomInput type="input" control={form.control} name="last_name" label="Last Name" />
            </div>
            <CustomInput type="input" control={form.control} name="email" label="Email" />
            <div className="flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">
              <CustomInput type="select" control={form.control} name="gender" label="Gender" selectList={GENDER!} />
              <CustomInput type="input" control={form.control} name="date_of_birth" label="Date of Birth" inputType="date" />
            </div>
            <div className="flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-x-4">
              <CustomInput type="input" control={form.control} name="phone" label="Phone" />
              <CustomInput type="select" control={form.control} name="marital_status" label="Marital Status" selectList={MARITAL_STATUS!} />
            </div>
            <CustomInput type="input" control={form.control} name="address" label="Address" />

            {/* FAMILY INFO */}
            <h3 className="text-lg font-semibold mt-8">Family Information</h3>
            <CustomInput type="input" control={form.control} name="emergency_contact_name" label="Emergency Contact Name" />
            <CustomInput type="input" control={form.control} name="emergency_contact_number" label="Emergency Contact Number" />
            <CustomInput type="select" control={form.control} name="relation" label="Relation" selectList={RELATION} />

            {/* MEDICAL INFO */}
            <h3 className="text-lg font-semibold mt-8">Medical Information</h3>
            <CustomInput type="input" control={form.control} name="blood_group" label="Blood Group" />
            <CustomInput type="input" control={form.control} name="allergies" label="Allergies" />
            <CustomInput type="input" control={form.control} name="medical_conditions" label="Medical Conditions" />
            <CustomInput type="input" control={form.control} name="medical_history" label="Medical History" />
            <div className="flex flex-col lg:flex-row gap-y-6 items-center gap-2 md:gap-4">
              <CustomInput type="input" control={form.control} name="insurance_provider" label="Insurance Provider" />
              <CustomInput type="input" control={form.control} name="insurance_number" label="Insurance Number" />
            </div>

            {/* CONSENT */}
            {type !== "update" && (
              <>
                <h3 className="text-lg font-semibold mt-8">Consent</h3>
                <CustomInput type="checkbox" control={form.control} name="privacy_consent" label="Privacy Policy Agreement" />
                <CustomInput type="checkbox" control={form.control} name="service_consent" label="Terms of Service Agreement" />
                <CustomInput type="checkbox" control={form.control} name="medical_consent" label="Informed Consent for Medical Treatment" />
              </>
            )}

            <Button disabled={loading} type="submit" className="w-full md:w-fit px-6">
              {type === "create" ? "Submit" : "Update"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
