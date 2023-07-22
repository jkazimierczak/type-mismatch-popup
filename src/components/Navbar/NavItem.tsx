import Link from "next/link";

interface NavItemProps {
  text: string;
  href: string;
  isActive: boolean;
}

export const NavItem = ({ text, href, isActive }: NavItemProps) => {
  return <Link href={href}>{text}</Link>;
};
