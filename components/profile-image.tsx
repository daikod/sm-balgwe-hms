import { cn } from "@/lib/utils";
import { getInitials } from "@/utils";
import Image from "next/image";

const BG_COLORS: Record<string, string> = {
  blue: "bg-blue-600",
  red: "bg-red-600",
  green: "bg-green-600",
  orange: "bg-orange-500",
  gray: "bg-gray-600",
};

export const ProfileImage = ({
  url,
  name,
  className,
  textClassName,
  bgColor = "blue", // default to blue
}: {
  url?: string;
  name: string;
  className?: string;
  textClassName?: string;
  bgColor?: keyof typeof BG_COLORS;
}) => {
  if (url)
    return (
      <Image
        src={url}
        alt={name}
        height={40}
        width={40}
        className={cn(
          "flex md:hidden lg:block w-10 h-10 rounded-full object-cover",
          className
        )}
      />
    );

  if (name) {
    return (
      <div
        className={cn(
          "flex md:hidden lg:flex w-10 h-10 rounded-full text-white text-base items-center justify-center font-light",
          BG_COLORS[bgColor] || BG_COLORS.blue,
          className
        )}
      >
        <p className={textClassName}>{getInitials(name)}</p>
      </div>
    );
  }

  return null;
};
