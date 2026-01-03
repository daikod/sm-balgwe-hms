import db from "@/lib/db";
import { requireRole } from "@/lib/auth/requireRole";
import { format } from "date-fns";

export default async function DoctorAdmissionsPage() {
  const { userId: doctorId } = await requireRole(["DOCTOR"]);

  const admissions = await db.admission.findMany({
    where: {
      status: "ACTIVE",
      admittingDoctorId: doctorId,
    },
    include: {
      patient: {
        select: {
          first_name: true,
          last_name: true,
        },
      },
      bedAllocations: {
        take: 1,
        select: {
          bed: {
            select: {
              bedNumber: true,
              unitId: true,
            },
          },
        },
      },
    },
    orderBy: { admittedAt: "desc" },
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h1 className="text-xl font-bold mb-4">Active Admissions</h1>

      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Bed</th>
            <th>Admitted At</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {admissions.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center p-4 text-gray-600">
                No active admissions yet.
              </td>
            </tr>
          ) : (
            admissions.map(adm => (
              <tr key={adm.id}>
                <td>
                  {adm.patient.first_name} {adm.patient.last_name}
                </td>
                <td>{adm.bedAllocations[0]?.bed.bedNumber ?? "N/A"}</td>
                <td>{format(adm.admittedAt, "MMM d, yyyy hh:mm a")}</td>
                <td>{adm.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
