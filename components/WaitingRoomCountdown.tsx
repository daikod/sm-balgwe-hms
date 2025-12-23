"use client";

import { useEffect, useState } from "react";

export default function WaitingRoomCountdown() {
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 30));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-4 text-center text-sm text-gray-600">
      Waiting for doctor to start the consultation…
      <div className="font-semibold mt-1">
        Checking again in {seconds}s
      </div>
    </div>
  );
}
