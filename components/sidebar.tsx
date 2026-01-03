import { getRole } from "@/utils/roles";
import {
  Bell,
  LayoutDashboard,
  List,
  ListOrdered,
  Logs,
  LucideIcon,
  Pill,
  Receipt,
  Settings,
  SquareActivity,
  User,
  UserRound,
  Users,
  UsersRound,
  BarChart3,
  BedDouble,
  ClipboardPlus,
  ClipboardCheck,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { LogoutButton } from "./logout-button";

const ACCESS_LEVELS_ALL = ["admin", "doctor", "nurse", "lab technician", "patient"];

const SidebarIcon = ({ icon: Icon }: { icon: LucideIcon }) => <Icon className="size-6 lg:size-5" />;

export const Sidebar = async () => {
  const role = (await getRole()).toLowerCase();

  const SIDEBAR_LINKS = [
    {
      label: "MENU",
      links: [
        { name: "Dashboard", href: `/${role}/dashboard`, access: ACCESS_LEVELS_ALL, icon: LayoutDashboard },

        { name: "Profile", href: "/patient/dashboard", access: ["patient"], icon: User },
      ],
    },
    {
    label: "Admissions",
    links: [
      {
        name: "Active Admissions",
        href: "/doctor/admissions",
        access: ["doctor", "nurse", "admin"],
        icon: ClipboardCheck,
      },
      {
        name: "Admit Patient",
        href: "/doctor/admissions/new",
        access: ["doctor"],
        icon: ClipboardPlus,
      },
      {
        name: "Assign Bed",
        href: "/admin/inpatient",
        access: ["admin", "nurse"],
        icon: BedDouble,
      },
    ],
  },
    {
      label: "Manage",
      links: [
        { name: "Users", href: "/record/users", access: ["admin"], icon: Users },
        { name: "Doctors", href: "/record/doctors", access: ["admin"], icon: User },
        { name: "Staffs", href: "/record/staffs", access: ["admin", "doctor"], icon: UserRound },
        { name: "Patients", href: "/record/patients", access: ["admin", "doctor", "nurse"], icon: UsersRound },
        { name: "Appointments", href: "/record/appointments", access: ["admin", "doctor", "nurse"], icon: ListOrdered },
        { name: "Medical Records", href: "/record/medical-records", access: ["admin", "doctor", "nurse"], icon: SquareActivity },
        { name: "Billing Overview", href: "/record/billing", access: ["admin", "doctor"], icon: Receipt },
        { name: "Patient Management", href: "/nurse/patient-management", access: ["nurse"], icon: Users },
        { name: "Administer Medications", href: "/doctor/administer-medications", access: ["admin", "doctor", "nurse"], icon: Pill },
        { name: "Appointments", href: "/record/appointments", access: ["patient"], icon: ListOrdered },
        { name: "Records", href: "/patient/dashboard", access: ["patient"], icon: List },
        { name: "Prescription", href: "/patient/prescriptions", access: ["patient"], icon: Pill },
        { name: "Billing", href: "/patient/dashboard?cat=payments", access: ["patient"], icon: Receipt },
      ],
    },
    {
      label: "System",
      links: [
        { name: "Analytics & Reports", href: "/analytics", access: ["admin", "doctor"], icon: BarChart3 },
        { name: "Notifications", href: "/notifications", access: ACCESS_LEVELS_ALL, icon: Bell },
        { name: "Audit Logs", href: "/admin/audit-logs", access: ["admin"], icon: Logs },
        { name: "Settings", href: "/admin/system-settings", access: ["admin"], icon: Settings },
      ],
    },
  ];

   if (!role) return null;

  return (
    <div className="w-full p-4 flex flex-col justify-between gap-4 bg-teal-50 overflow-y-scroll min-h-full">
      <div>
        <div className="flex items-center justify-center lg:justify-start gap-2">
          <div className="p-1.5 rounded-md bg-blue-600 text-white">
            <SquareActivity size={22} />
          </div>
          <Link href="/" className="hidden lg:flex text-base 2xl:text-xl font-bold">SM BALGWE HMS</Link>
        </div>

        <div className="mt-4 text-sm">
          {SIDEBAR_LINKS.map(section => (
            <div key={section.label} className="flex flex-col gap-2">
              <span className="hidden uppercase lg:block text-gray-400 font-bold my-4">{section.label}</span>
              {section.links.map(link => link.access.includes(role) && (
                <Link key={link.name} href={link.href} className="flex items-center justify-center lg:justify-start gap-4 text-gray-600 py-2 md:px-2 rounded-md hover:bg-blue-600/10">
                  <SidebarIcon icon={link.icon} />
                  <span className="hidden lg:block">{link.name}</span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <LogoutButton />
    </div>
  );
};
