"use client";

import { UserButton, useUser } from '@clerk/nextjs';
import { Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export const Navbar = () => {
  const user = useUser();
  const pathname = usePathname();
  const [path, setPath] = useState("Overview"); // Default value for SSR
  const [mounted, setMounted] = useState(false); // Track hydration
  const [notificationCount, setNotificationCount] = useState(0);

  // Determine current path for breadcrumb/title
  useEffect(() => {
    setMounted(true); // Component mounted
    if (pathname) {
      const splitRoute = pathname.split("/");
      const lastIndex = splitRoute.length - 1 > 2 ? 2 : splitRoute.length - 1;
      const pathName = splitRoute[lastIndex];
      const formattedPath = pathName.replace(/-/g, " ");
      setPath(formattedPath || "Overview");
    }
  }, [pathname]);

  // Fetch notifications from API
  useEffect(() => {
  if (!mounted || !user?.user) return;

  const fetchNotifications = async () => {
    try {
      // Keep POST for backward compatibility
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        console.error("Notifications API returned status:", res.status);
        setNotificationCount(0);
        return;
      }

      const data = await res.json();

      // Always ensure it's an array
      setNotificationCount(Array.isArray(data) ? data.length : 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotificationCount(0);
    }
  };

  fetchNotifications();
}, [mounted, user?.user]);

  return (
    <div className='p-5 flex justify-between bg-white'>
      <h1 className='text-xl font-medium text-gray-500 capitalize'>
        {path}
      </h1>

      <div className='flex items-center gap-4'>
        <div className='relative'>
          <Bell />
          {notificationCount > 0 && (
            <p className='absolute -top-3 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] text-center'>
              {notificationCount}
            </p>
          )}
        </div>

        {/* Render UserButton only after client mount */}
        {mounted && user?.user && <UserButton />}
      </div>
    </div>
  );
};
