import Image from "next/image";
import Avatar from "boring-avatars";
import { useSession } from "next-auth/react";
import { IoMenu } from "react-icons/io5";

interface UserChipsProps {
  imgSrc?: string | null | undefined;
}

export function UserChips({ imgSrc }: UserChipsProps) {
  const { data } = useSession();

  return (
    <div className="flex items-center gap-2 rounded-full bg-dark-900 pl-3.5">
      <IoMenu size={24} color={"white"} />
      {imgSrc ? (
        <Image
          className="rounded-full"
          src={imgSrc}
          alt="Your profile image"
          width={40}
          height={40}
        />
      ) : (
        <Avatar
          size={40}
          name="Maria Mitchell"
          variant="beam"
          colors={["#0a0310", "#49007e", "#9747ff", "#ff8d61", "#ffb238"]}
        />
      )}
    </div>
  );
}
