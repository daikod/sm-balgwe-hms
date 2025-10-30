import Image from "next/image";
import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-1/2 h-full flex items-center justify-center">
        {children}
      </div>
      <div className="hidden md:flex w-1/2 h-full relative">
        <Image
          src="https://thevoiceofblackcincinnati.com/wp-content/uploads/2021/06/AdobeStock_305412791-scaled.jpeg"
          width={1000}
          height={1000}
          alt="Doctors"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-0 w-full h-full bg-opacity-40 z-10 flex flex-col items-center justify-center">
          <h1 className="text-4xl 2xl:text-5xl font-bold text-white">
            SM BALGWE HMS
          </h1>
          <p className="text-blue-600 text-base">
            Welcome to Excellence in Care.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;