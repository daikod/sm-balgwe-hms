import { checkRole } from "@/utils/roles";
import React from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Card } from "./ui/card";
import { ProfileImage } from "./profile-image";
import { daysOfWeek } from "@/utils";
import { Days, AvailableDoctorProps } from "@/types/data-types";

const getToday = () => {
  const today = new Date().getDay();
  return daysOfWeek[today];
};

const todayDay = getToday();

interface DataProps {
  data: AvailableDoctorProps[];
  isAdmin?: boolean; // pass from parent
}

const availableDays = (days: Days[] | string | undefined) => {
  if (!days) return "Not Available";

  // If Prisma returned JSON string, parse it
  const parsedDays: Days[] =
    typeof days === "string" ? JSON.parse(days) : days;

  const today = todayDay.toLowerCase();
  const match = parsedDays.find((d) => d.day?.toLowerCase() === today);

  return match ? `${match.start_time} - ${match.close_time}` : "Not Available";
};

export const AvailableDoctors = ({ data, isAdmin = false }: DataProps) => {
  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg font-semibold">Available Doctors</h1>

        {isAdmin && (
          <Button
            asChild
            variant="outline"
            disabled={!data || data.length === 0}
            className="disabled:cursor-not-allowed disabled:text-gray-200"
          >
            <Link href="/record/doctors">View all</Link>
          </Button>
        )}
      </div>

      <div className="w-full space-y-5 md:space-y-0 md:gap-6 flex flex-col md:flex-row md:flex-wrap">
        {data?.map((doc) => (
          <Card
            key={doc.id}
            className="border-none w-full md:w-75 min-h-28 xl:w-full p-4 flex gap-4 odd:bg-emerald-600/5 even:bg-yellow-600/5"
          >
            <ProfileImage
              url={doc.img || ""}
              name={doc.name || "Dr."}
              className="md:flex min-w-14 min-h-14 md:min-w-16 md:min-h-16"
              textClassName="text-2xl font-semibold text-black"
              bgColor={doc.colorCode || "#ccc"}
            />

            <div>
              <h2 className="font-semibold text-lg md:text-xl">{doc.name}</h2>
              <p className="text-base capitalize text-gray-600">
                {doc.specialization}
              </p>
              <p className="text-sm flex items-center">
                <span className="hidden lg:flex">Available Time: </span>
                {availableDays(doc.working_days)}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AvailableDoctors;
