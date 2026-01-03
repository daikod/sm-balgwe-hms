import { AppointmentDetails } from "@/components/appointment/appointment-details";
import AppointmentQuickLinks from "@/components/appointment/appointment-quick-links";
import { BillsContainer } from "@/components/appointment/bills-container";
import ChartContainer from "@/components/appointment/chart-container";
import { DiagnosisContainer } from "@/components/appointment/diagnosis-container";
import { PatientDetailsCard } from "@/components/appointment/patient-details-card";
import { PaymentsContainer } from "@/components/appointment/payment-container";
import { VitalSigns } from "@/components/appointment/vital-signs";
import { MedicalHistoryContainer } from "@/components/medical-history-container";
import { getAppointmentWithMedicalRecordsById } from "@/utils/services/appointment";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const AppointmentDetailsPage = async ({ params, searchParams }: PageProps) => {
  // ✅ REQUIRED in Next.js 15
  const { id } = await params;
  const search = searchParams ? await searchParams : {};

  const cat = (search?.cat as string) || "charts";

  const { data } = await getAppointmentWithMedicalRecordsById(Number(id));

  return (
    <div className="flex p-6 flex-col-reverse lg:flex-row w-full min-h-screen gap-10">
      {/* LEFT */}
      <div className="w-full lg:w-[65%] flex flex-col gap-6">
        {cat === "charts" && <ChartContainer id={data?.patientId!} />}

        {cat === "appointments" && (
          <>
            <AppointmentDetails
              id={data?.id!}
              patientId={data?.patientId!}
              appointment_date={data?.appointment_date!}
              time={data?.time!}
              notes={data?.note!}
            />

            <VitalSigns
              id={id}
              patientId={data?.patientId!}
              doctorId={data?.doctorId!}
            />
          </>
        )}

        {cat === "diagnosis" && (
          <DiagnosisContainer
            id={id}
            patientId={data?.patientId!}
            doctorId={data?.doctorId!}
          />
        )}

        {cat === "medical-history" && (
          <MedicalHistoryContainer id={id} patientId={data?.patientId!} />
        )}

        {cat === "billing" && <BillsContainer id={id} />}

        {cat === "payments" && (
          <PaymentsContainer patientId={data?.patientId!} />
        )}
      </div>

      {/* RIGHT */}
      <div className="flex-1 space-y-6">
        <AppointmentQuickLinks staffId={data?.doctorId as string} />
        <PatientDetailsCard data={data?.patient!} />
      </div>
    </div>
  );
};

export default AppointmentDetailsPage;
