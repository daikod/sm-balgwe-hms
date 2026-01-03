"use client";

import availableDays from "@/components/available-doctor";
import { ProfileImage } from "@/components/profile-image";
import { RatingContainer } from "@/components/rating-container";
import { RecentAppointments } from "@/components/tables/recent-appointment";
import { getDoctorById } from "@/utils/services/doctor";
import { format } from "date-fns";
import Link from "next/link";
import React from "react";

import { BsCalendarDateFill, BsPersonWorkspace } from "react-icons/bs";
import { FaBriefcaseMedical, FaCalendarDays } from "react-icons/fa6";
import { IoTimeSharp } from "react-icons/io5";
import { MdEmail, MdLocalPhone } from "react-icons/md";

const DoctorProfile = async ({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const resolvedParams = await params;
  const { data, totalAppointment } = await getDoctorById(resolvedParams.id);

  if (!data) return null;

  const userId = data.id;
  const isAdmin = false;

  const onStartCall = async (appointmentId: string, patientEmail: string) => {
    console.log("Starting call:", appointmentId, patientEmail);
  };

  return (
    <div className="bg-gray-100/60 h-full rounded-xl py-6 px-3 2xl:px-5 flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-[70%]">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="bg-blue-50 py-6 px-4 rounded-md flex-1 flex gap-4">
            <ProfileImage
              url={data.img!}
              name={data.name}
              className="size-20"
              bgColor={data.colorCode!}
              textClassName="text-4xl text-black"
            />

            <div className="w-2/3 flex flex-col justify-between gap-x-4">
              <h1 className="text-xl font-semibold uppercase">{data.name}</h1>
              <p className="text-sm text-gray-500">
                {data.address || "No address information"}
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium">
                <div className="flex gap-1">
                  <span>License #:</span>
                  <span className="font-semibold">{data.license_number}</span>
                </div>

                <div className="flex items-center gap-2">
                  <FaBriefcaseMedical />
                  <span className="capitalize">{data.specialization}</span>
                </div>

                <div className="flex items-center gap-2">
                  <BsPersonWorkspace />
                  <span className="capitalize">{data.type}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MdEmail />
                  <span>{data.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <MdLocalPhone />
                  <span>{data.phone}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 flex gap-4 flex-wrap">
            <div className="doctorCard">
              <FaBriefcaseMedical />
              <div>
                <h1>{totalAppointment}</h1>
                <span>Appointments</span>
              </div>
            </div>

            <div className="doctorCard">
              <FaCalendarDays />
              <div>
                <h1>{data.working_days?.length}</h1>
                <span>Working Days</span>
              </div>
            </div>

            <div className="doctorCard">
              <IoTimeSharp />
              <div>
                <h1>{availableDays({ data: data.working_days } as any)}</h1>
                <span>Working Hours</span>
              </div>
            </div>

            <div className="doctorCard">
              <BsCalendarDateFill />
              <div>
                <h1>{format(data.created_at, "yyyy-MM-dd")}</h1>
                <span>Joined Date</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-e-xl p-4 mt-6">
          <RecentAppointments
            data={data.appointments}
            userId={userId}
            isAdmin={isAdmin}
            onStartCall={onStartCall}
          />
        </div>
      </div>

      <div className="w-full lg:w-[30%] flex flex-col gap-4">
        <div className="bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">Quick Links</h1>

          <div className="mt-8 flex gap-4 flex-wrap text-sm text-gray-500">
            <Link
              href={`/record/appointments?id=${data.id}`}
              className="p-3 rounded-md bg-yellow-60 hover:underline"
            >
              Doctor Appointments
            </Link>
          </div>
        </div>

        <RatingContainer id={resolvedParams.id} />
      </div>
    </div>
  );
};

export default DoctorProfile;
