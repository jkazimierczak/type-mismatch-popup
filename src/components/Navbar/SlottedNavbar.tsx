import { useRouter } from "next/router";
import { IoArrowBack } from "react-icons/io5";
import { type ReactNode } from "react";

interface SlottedNavbarProps {
  title: string;
  rightSlot?: ReactNode;
}

export function SlottedNavbar({ title, rightSlot }: SlottedNavbarProps) {
  const router = useRouter();

  return (
    <nav className="flex items-center justify-between bg-dark-500 px-5 py-4">
      <p className="flex items-center gap-3">
        <IoArrowBack size={24} onClick={router.back} />
        <span className="text-xl font-semibold">{title}</span>
      </p>

      {rightSlot}
    </nav>
  );
}
