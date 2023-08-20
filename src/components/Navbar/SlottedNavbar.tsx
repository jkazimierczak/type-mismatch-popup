import { useRouter } from "next/router";
import { IoArrowBack } from "react-icons/io5";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface SlottedNavbarProps {
  title: string;
  disableBack?: boolean;
  rightSlot?: ReactNode;
}

export function SlottedNavbar({
  title,
  disableBack,
  rightSlot,
}: SlottedNavbarProps) {
  const router = useRouter();

  function handleNavigateBack() {
    if (!disableBack) {
      router.back();
    }
  }

  return (
    <nav className="flex items-center justify-between bg-dark-500 px-5 py-4">
      <p className="flex items-center gap-3">
        <Button variant="transparent" size="min">
          <IoArrowBack size={24} onClick={handleNavigateBack} />
        </Button>

        <span className="text-xl font-semibold">{title}</span>
      </p>

      {rightSlot}
    </nav>
  );
}
