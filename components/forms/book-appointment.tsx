"use client";

import { AppointmentSchema } from "@/lib/schema";
import { generateTimes } from "@/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Patient, Doctor } from "@prisma/client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { UserPen, Video, MapPin } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { ProfileImage } from "../profile-image";
import { CustomInput } from "../custom-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { createNewAppointment } from "@/app/actions/appointment";
import z from "zod";

// Appointment types
const TYPES = [
  { label: "General Consultation", value: "General Consultation" },
  { label: "General Check up", value: "General Check Up" },
  { label: "Antenatal", value: "Antenatal" },
  { label: "Maternity", value: "Maternity" },
  { label: "Lab Test", value: "Lab Test" },
  { label: "ANT", value: "ANT" },
];

// Appointment modes
const APPOINTMENT_MODES = [
  {
    value: "VIDEO_CALL",
    label: "Video Call",
    icon: Video,
    description: "Online consultation",
  },
  {
    value: "IN_PERSON",
    label: "In-Person",
    icon: MapPin,
    description: "Visit clinic",
  },
];

// Full Doctor type expected by BookAppointment
export type FullDoctor = Doctor & {
  colorCode: string | null;
  type: string;
  department: string | null;
  availability_status: string | null;
};

interface BookAppointmentProps {
  data: Patient;
  doctors: Doctor[];
}

export const BookAppointment = ({ data, doctors }: BookAppointmentProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [appointmentMode, setAppointmentMode] =
    useState<"VIDEO_CALL" | "IN_PERSON">("VIDEO_CALL");

  const appointmentTimes = generateTimes(8, 17, 30);
  const patientName = `${data.first_name} ${data.last_name}`;

  // Map doctors to FullDoctor type
  const mappedDoctors: FullDoctor[] = doctors.map((d) => ({
    ...d,
    email: d.email ?? "",
    gender: d.gender ?? null,
    phone: d.phone ?? "",
    address: d.address ?? "",
    license_number: d.license_number ?? "",
    department: d.department ?? null,
    availability_status: d.availability_status ?? null,
    type: d.type ?? "GENERAL",
    colorCode: d.colorCode ?? "#ccc",
  }));

  const [physicians, setPhysicians] = useState<FullDoctor[]>(mappedDoctors);

  const form = useForm<z.infer<typeof AppointmentSchema>>({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      doctor_id: "",
      appointment_date: "",
      time: "",
      type: "",
      note: "",
    },
  });

  const onSubmit: SubmitHandler<z.infer<typeof AppointmentSchema>> = async (
    values
  ) => {
    try {
      setIsSubmitting(true);
      const newData = {
        ...values,
        patient_id: data.id,
        appointmentMode,
      };

      const res = await createNewAppointment(newData);

      if (res.success) {
        form.reset({});
        setAppointmentMode("VIDEO_CALL");
        router.refresh();
        toast.success("Appointment created successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button className="w-full flex items-center gap-2 justify-start text-sm font-light bg-blue-600 text-white hover:bg-blue-700">
          <UserPen size={16} /> Book Appointment
        </Button>
      </SheetTrigger>

      <SheetContent className="rounded-xl rounded-r-2xl md:h-[95%] md:top-[2.5%] md:right-[1%] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            Loading...
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4">
            <SheetHeader>
              <SheetTitle>Book Appointment</SheetTitle>
            </SheetHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 mt-5 2xl:mt-10"
              >
                {/* Patient Card */}
                <div className="w-full rounded-md border border-input bg-background px-3 py-1 flex items-center gap-4">
                  <ProfileImage
                    url={data.img ?? ""}
                    name={patientName}
                    className="size-16 border border-input"
                    bgColor={data.colorCode ?? "#ccc"}
                  />
                  <div>
                    <p className="font-semibold text-lg">{patientName}</p>
                    <span className="text-sm text-gray-500 capitalize">
                      {data.gender}
                    </span>
                  </div>
                </div>

                {/* Appointment Mode */}
                <div className="space-y-2">
                  <FormLabel>Appointment Mode</FormLabel>
                  <div className="grid grid-cols-2 gap-3">
                    {APPOINTMENT_MODES.map((mode) => {
                      const Icon = mode.icon;
                      const isSelected = appointmentMode === mode.value;
                      return (
                        <button
                          key={mode.value}
                          type="button"
                          disabled={isSubmitting}
                          onClick={() =>
                            setAppointmentMode(
                              mode.value as "VIDEO_CALL" | "IN_PERSON"
                            )
                          }
                          className={`p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? mode.value === "VIDEO_CALL"
                                ? "border-blue-600 bg-blue-50"
                                : "border-green-600 bg-green-50"
                              : "border-gray-200 hover:border-gray-300"
                          } ${
                            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <Icon
                            className={`w-6 h-6 mx-auto mb-2 ${
                              isSelected
                                ? mode.value === "VIDEO_CALL"
                                  ? "text-blue-600"
                                  : "text-green-600"
                                : "text-gray-400"
                            }`}
                          />
                          <p
                            className={`font-medium text-sm ${
                              isSelected
                                ? mode.value === "VIDEO_CALL"
                                  ? "text-blue-600"
                                  : "text-green-600"
                                : "text-gray-700"
                            }`}
                          >
                            {mode.label}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {mode.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {appointmentMode === "VIDEO_CALL" && (
                    <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      A video call link will be generated for this appointment
                    </p>
                  )}
                </div>

                {/* Appointment Type */}
                <CustomInput
                  type="select"
                  selectList={TYPES}
                  control={form.control}
                  name="type"
                  label="Appointment Type"
                  placeholder="Select an appointment type"
                />

                {/* Doctor Selection */}
                <FormField
                  control={form.control}
                  name="doctor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Physician</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a physician" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {physicians.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              <div className="flex items-center gap-2 p-2">
                                <ProfileImage
                                  url={d.img ?? ""}
                                  name={d.name}
                                  bgColor={d.colorCode ?? "#ccc"}
                                  textClassName="text-black"
                                />
                                <div>
                                  <p className="font-medium">{d.name}</p>
                                  <span className="text-sm text-gray-600">
                                    {d.specialization}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date & Time */}
                <div className="flex items-center gap-2">
                  <CustomInput
                    type="input"
                    control={form.control}
                    name="appointment_date"
                    label="Date"
                    inputType="date"
                  />
                  <CustomInput
                    type="select"
                    control={form.control}
                    name="time"
                    label="Time"
                    selectList={appointmentTimes}
                  />
                </div>

                {/* Notes */}
                <CustomInput
                  type="textarea"
                  control={form.control}
                  name="note"
                  label="Additional Note"
                  placeholder="Additional note"
                />

                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="bg-blue-600 w-full hover:bg-blue-700"
                >
                  {isSubmitting ? "Booking..." : "Book Appointment"}
                </Button>
              </form>
            </Form>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
